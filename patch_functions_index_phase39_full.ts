import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { auditTrack, TrackPoint, AuditResult } from './antiCheat/trackAudit';
import { getDistanceToPath } from './utils/segmentMath';

// Only call initializeApp if it hasn't been initialized yet
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

// ----------------------------------------------------------------------
// SEGMENT ATTEMPTS AUDIT
// ----------------------------------------------------------------------
export const onSegmentAttemptCreated = functions.firestore.onDocumentCreated(
  'segments/{segmentId}/attempts/{attemptId}',
  async (event: any) => {
    const snapshot = event.data;
    if (!snapshot) return;
    const attemptData = snapshot.data();
    
    // Idempotency: Check if already processed
    if (attemptData.antiCheatStatus) {
      return;
    }

    const segmentId = event.params.segmentId;
    const trackPoints: TrackPoint[] = attemptData.trackPoints || [];
    
    const auditResult = auditTrack(trackPoints);
    
    // Optional: Cross-reference with segment path
    if (auditResult.riskScore < 100) { // Don't bother if already completely invalid
        const segmentDoc = await db.collection('segments').doc(segmentId).get();
        if (segmentDoc.exists) {
            const segmentData = segmentDoc.data();
            const segmentPath = segmentData?.path;
            if (segmentPath && segmentPath.length >= 2) {
                // Check if they deviated significantly (simplistic check for now)
                let outOfBoundsCount = 0;
                for (const pt of trackPoints) {
                    const distToPathResult = getDistanceToPath([pt.latitude, pt.longitude], segmentPath);
                    if (!distToPathResult || distToPathResult.distanceMeters > 30) {
                        outOfBoundsCount++;
                    }
                }
                if (outOfBoundsCount > trackPoints.length * 0.3) {
                    auditResult.reasons.push('trajectory_out_of_bounds');
                    auditResult.riskScore += 30;
                }
            }
        }
    }

    // Re-evaluate suspicious flag and cap score
    if (auditResult.riskScore > 100) auditResult.riskScore = 100;
    if (auditResult.riskScore > 20) auditResult.suspicious = true;

    const antiCheatStatus = auditResult.suspicious ? (auditResult.riskScore > 80 ? 'rejected' : 'suspicious') : 'approved';

    // FASE 3.8 - Update attempt and bestRecord atomically
    await db.runTransaction(async (transaction: any) => {
      const segRef = db.collection('segments').doc(segmentId);
      const segSnap = await transaction.get(segRef);
      
      transaction.update(snapshot.ref, {
        antiCheatStatus: antiCheatStatus,
        antiCheat: auditResult
      });

      if (!segSnap.exists) return;
      
      const currentData = segSnap.data();
      const currentBest = currentData?.bestRecord;

      // Only update bestRecord if the run is fully approved!
      if (antiCheatStatus === 'approved' && attemptData.timeSeconds) {
        const isNewRecord = !currentBest || attemptData.timeSeconds < currentBest.timeSeconds;
        
        if (isNewRecord) {
          transaction.update(segRef, {
            bestRecord: {
              playerId: attemptData.playerId,
              playerName: attemptData.playerName || 'Anônimo',
              timeSeconds: attemptData.timeSeconds,
              averageSpeedKmH: attemptData.averageSpeedKmH || 0,
              date: attemptData.createdAt ? new Date(attemptData.createdAt).toISOString() : new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          });
        }
      }
    });
  }
);

// ----------------------------------------------------------------------
// ZONE CONQUESTS AUDIT & SERVER AUTHORITY (PHASE 3.9)
// ----------------------------------------------------------------------
export const onZoneConquestCreated = functions.firestore.onDocumentCreated(
  'zones/{zoneId}/history/{operationId}',
  async (event: any) => {
    const snapshot = event.data;
    if (!snapshot) return;
    const historyData = snapshot.data();
    
    // Idempotency: Check if already processed
    if (historyData.antiCheatStatus) {
      return;
    }

    const zoneId = event.params.zoneId;
    const playerId = historyData.playerId;
    const trackPoints: TrackPoint[] = historyData.trackPoints || [];
    const nowUnix = historyData.createdAt || Date.now();
    const nowIso = new Date(nowUnix).toISOString();
    
    // 1. Audit Track
    const auditResult = auditTrack(trackPoints);
    let antiCheatStatus = auditResult.suspicious ? (auditResult.riskScore > 80 ? 'rejected' : 'suspicious') : 'approved';

    // 2. We can do pre-transaction queries!
    // Let's get the player's real clan safely
    const clansQuery = await db.collection('clans').where('memberIds', 'array-contains', playerId).limit(1).get();
    let playerClanId: string | null = null;
    let playerClanRef: admin.firestore.DocumentReference | null = null;
    
    if (!clansQuery.empty) {
        playerClanId = clansQuery.docs[0].id;
        playerClanRef = clansQuery.docs[0].ref;
    }

    // 3. Server-Side Transaction
    await db.runTransaction(async (transaction: any) => {
        // ALWAYS update the history ref status first
        transaction.update(snapshot.ref, {
            antiCheatStatus: antiCheatStatus,
            antiCheat: auditResult
        });
        
        if (antiCheatStatus === 'rejected') {
            // Cannot grant rewards
            return;
        }

        const zoneRef = db.collection('zones').doc(zoneId);
        const zoneDoc = await transaction.get(zoneRef);
        if (!zoneDoc.exists) return;
        const currentZone = zoneDoc.data()!;
        
        // Concurrency check: Does this operation's createdAt beat the lastConquered time?
        const lastConqueredTimestamp = currentZone.lastConquered ? new Date(currentZone.lastConquered).getTime() : 0;
        
        // If the zone is free, OR the operation is newer than the last conquer, update controller
        if (currentZone.status === 'free' || nowUnix >= lastConqueredTimestamp) {
            
            // Build new controller info from history payload if available
            // but override the clanId with the SERVER verified clanId!
            const clientController = historyData.payload?.controller || {};
            const newController = {
                ...clientController,
                id: playerId,
                clanId: playerClanId, // Authoritative!
            };
            
            const updatedZoneData: any = {
                status: 'controlled',
                controller: newController,
                dominance: 100,
                activeDispute: null,
                contested: false,
                lastConquered: nowIso,
                conqueredAtUnix: nowUnix
            };
            
            // Flattened fields
            if (newController.name) updatedZoneData.controllerName = newController.name;
            if (newController.nickname) updatedZoneData.controllerNickname = newController.nickname;
            if (newController.avatar) updatedZoneData.controllerAvatar = newController.avatar;
            if (newController.level) updatedZoneData.controllerLevel = newController.level;
            
            // --- CLAN REWARDS & COOLDOWN ---
            if (playerClanId && playerClanRef) {
                const TERRITORY_REWARD_COOLDOWN_MS = 30 * 60 * 1000;
                const clanCooldowns = currentZone.clanCooldowns || {};
                const lastClanCooldown = clanCooldowns[playerClanId] || 0;
                
                if (nowUnix >= lastClanCooldown) {
                    updatedZoneData.clanCooldowns = { ...clanCooldowns, [playerClanId]: nowUnix + TERRITORY_REWARD_COOLDOWN_MS };
                    
                    const clanDoc = await transaction.get(playerClanRef);
                    if (clanDoc.exists) {
                        const clanData = clanDoc.data();
                        let clanPointsAwarded = 0;
                        
                        if (currentZone.status === 'free') {
                            clanPointsAwarded = 100;
                        } else if (currentZone.controller?.clanId === playerClanId) {
                            clanPointsAwarded = 25;
                        } else {
                            clanPointsAwarded = 150;
                        }
                        
                        const clanUpdate: any = {};
                        clanUpdate.territoryScore = (clanData.territoryScore || 0) + clanPointsAwarded;
                        
                        // Handle Enemy Zone count reduction
                        const enemyClanId = currentZone.controller?.clanId;
                        if (enemyClanId && enemyClanId !== playerClanId) {
                            const enemyClanRef = db.collection('clans').doc(enemyClanId);
                            const enemyClanDoc = await transaction.get(enemyClanRef);
                            if (enemyClanDoc.exists) {
                                const eClanData = enemyClanDoc.data();
                                transaction.update(enemyClanRef, {
                                    zonesControlledCount: Math.max(0, (eClanData.zonesControlledCount || 1) - 1)
                                });
                            }
                        }
                        
                        // Increase our count if we didn't own it
                        if (currentZone.controller?.clanId !== playerClanId) {
                            clanUpdate.zonesControlledCount = (clanData.zonesControlledCount || 0) + 1;
                        }
                        
                        // Process Clan Missions
                        const missions = clanData.missions || [];
                        let updatedMissions = [...missions];
                        let missionsUpdated = false;
                        let missionXpAwarded = 0;
                        
                        for (let i = 0; i < updatedMissions.length; i++) {
                            let m = updatedMissions[i];
                            if (m.status !== 'active') continue;
                            
                            if (nowUnix >= m.expiresAt) {
                                m.status = 'expired';
                                missionsUpdated = true;
                                continue;
                            }
                            
                            let progressGained = false;
                            if (m.type === 'EXPANSION' && currentZone.status === 'free') {
                                m.progress += 1;
                                progressGained = true;
                            } else if (m.type === 'WAR' && currentZone.status !== 'free' && currentZone.controller?.clanId !== playerClanId) {
                                m.progress += 1;
                                progressGained = true;
                            } else if (m.type === 'DOMINANCE') {
                                m.progress += 1;
                                progressGained = true;
                            }
                            
                            if (progressGained) {
                                missionsUpdated = true;
                                if (m.progress >= m.target) {
                                    m.progress = m.target;
                                    m.status = 'completed';
                                    missionXpAwarded += m.rewardXp || 0;
                                }
                            }
                            updatedMissions[i] = m;
                        }
                        
                        if (missionsUpdated) {
                            clanUpdate.missions = updatedMissions;
                        }
                        
                        if (missionXpAwarded > 0) {
                            clanUpdate.xp = (clanData.xp || 0) + missionXpAwarded;
                            const currentLevel = clanData.level || 1;
                            const newXp = clanUpdate.xp;
                            const nextLevelXp = clanData.nextLevelXp || (currentLevel * 1000);
                            if (newXp >= nextLevelXp) {
                                clanUpdate.level = currentLevel + 1;
                                clanUpdate.nextLevelXp = Math.floor(nextLevelXp * 1.5);
                            }
                        }
                        
                        transaction.update(playerClanRef, clanUpdate);
                    }
                }
            }
            
            transaction.update(zoneRef, updatedZoneData);
        }
    });
  }
);

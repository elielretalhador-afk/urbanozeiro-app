import sys

with open('src/services/db.ts', 'r') as f:
    content = f.read()

# We will locate the async conquerZoneTransaction function and replace it.
import re

start_marker = "  async conquerZoneTransaction(zoneId: string, operation: ZoneOperation): Promise<Zone> {"
end_marker = "  async queueSegmentOperation(operation: SegmentOperation): Promise<void> {"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Markers not found!")
    sys.exit(1)

new_func = """  async conquerZoneTransaction(zoneId: string, operation: ZoneOperation): Promise<Zone> {
    const zoneRef = doc(db, 'zones', zoneId);
    return await runTransaction(db, async (transaction) => {
      const zoneDoc = await transaction.get(zoneRef);
      if (!zoneDoc.exists()) {
        throw new Error("Zona não existe no banco oficial.");
      }
      
      const currentZone = zoneDoc.data() as Zone;
      
      // Idempotency check
      const currentHistory = currentZone.conquestHistory || [];
      if (currentHistory.some(h => h.operationId === operation.operationId)) {
        return currentZone; // Already processed
      }

      const newEntry = { ...operation.payload.conquestHistoryEntry };
      const trackPoints = newEntry.trackPoints || [];
      delete newEntry.trackPoints;

      // Add the new entry to history
      const newHistory = [newEntry, ...currentHistory];
      
      const updatedData: Partial<Zone> = {
        conquestHistory: newHistory,
      };

      // Concurrency check: Does this operation's createdAt beat the lastConquered time?
      const lastConqueredTimestamp = currentZone.lastConquered ? new Date(currentZone.lastConquered).getTime() : 0;
      const now = operation.createdAt;
      
      // If the zone is free, OR the operation is newer than the last conquer, update controller
      if (currentZone.status === 'free' || now >= lastConqueredTimestamp) {
        updatedData.status = 'controlled';
        updatedData.controller = operation.payload.controller;
        updatedData.dominance = 100;
        updatedData.activeDispute = null;
        updatedData.contested = false;
        
        // Flattened fields for easy access in views
        if (operation.payload.controller) {
          updatedData.controllerName = operation.payload.controller.name;
          updatedData.controllerNickname = operation.payload.controller.nickname;
          updatedData.controllerAvatar = operation.payload.controller.avatar;
          updatedData.controllerLevel = operation.payload.controller.level;
          updatedData.controllerCrew = operation.payload.controller.crew;
        }
        updatedData.lastConquered = new Date(now).toISOString();
        updatedData.conqueredAtUnix = now;
        
        // --- CLAN WAR & COOLDOWN LOGIC ---
        const clanId = operation.payload.controller?.clanId;
        if (clanId) {
          const TERRITORY_REWARD_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes
          const clanCooldowns = currentZone.clanCooldowns || {};
          const lastClanCooldown = clanCooldowns[clanId] || 0;
          
          if (now >= lastClanCooldown) {
            // Cooldown passed, we can grant rewards
            updatedData.clanCooldowns = { ...clanCooldowns, [clanId]: now + TERRITORY_REWARD_COOLDOWN_MS };
            
            const clanRef = doc(db, 'clans', clanId);
            const clanDoc = await transaction.get(clanRef);
            
            if (clanDoc.exists()) {
              const clanData = clanDoc.data();
              let clanPointsAwarded = 0;
              
              if (currentZone.status === 'free') {
                clanPointsAwarded = 100;
              } else if (currentZone.controller?.clanId === clanId) {
                clanPointsAwarded = 25;
              } else {
                clanPointsAwarded = 150;
              }
              
              const clanUpdate: any = {};
              clanUpdate.territoryScore = (clanData.territoryScore || 0) + clanPointsAwarded;
              
              // Handle Enemy Zone count reduction
              const enemyClanId = currentZone.controller?.clanId;
              if (enemyClanId && enemyClanId !== clanId) {
                const enemyClanRef = doc(db, 'clans', enemyClanId);
                const enemyClanDoc = await transaction.get(enemyClanRef);
                if (enemyClanDoc.exists()) {
                  const eClanData = enemyClanDoc.data();
                  transaction.update(enemyClanRef, {
                    zonesControlledCount: Math.max(0, (eClanData.zonesControlledCount || 1) - 1)
                  });
                }
              }
              
              // Increase our count if we didn't own it
              if (currentZone.controller?.clanId !== clanId) {
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
                
                if (now >= m.expiresAt) {
                  m.status = 'expired';
                  missionsUpdated = true;
                  continue;
                }
                
                let progressGained = false;
                if (m.type === 'EXPANSION' && currentZone.status === 'free') {
                  m.progress += 1;
                  progressGained = true;
                } else if (m.type === 'WAR' && currentZone.status !== 'free' && currentZone.controller?.clanId !== clanId) {
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
                // Level up logic (simplified for now, ideally ClanService handles it, but we can do a naive check)
                const currentLevel = clanData.level || 1;
                const newXp = clanUpdate.xp;
                const nextLevelXp = clanData.nextLevelXp || (currentLevel * 1000);
                if (newXp >= nextLevelXp) {
                   clanUpdate.level = currentLevel + 1;
                   clanUpdate.nextLevelXp = Math.floor(nextLevelXp * 1.5);
                }
              }
              
              transaction.update(clanRef, clanUpdate);
            }
          }
        }
      }

      // Merge manually, respecting rules
      const mergedZone = { ...currentZone, ...updatedData };
      
      transaction.update(zoneRef, updatedData);

      // Save the trackpoints to a subcollection document for anti-cheat audit
      const proofRef = doc(db, 'zones', zoneId, 'history', operation.operationId);
      transaction.set(proofRef, {
        operationId: operation.operationId,
        playerId: operation.playerId,
        createdAt: operation.createdAt,
        trackPoints: trackPoints
      });

      return mergedZone;
    });
  }

"""

new_content = content[:start_idx] + new_func + content[end_idx:]

with open('src/services/db.ts', 'w') as f:
    f.write(new_content)

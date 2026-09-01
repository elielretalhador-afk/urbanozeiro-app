"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onClanInviteCreated = exports.seedShop = exports.equipCosmetic = exports.purchaseShopItem = exports.openChest = exports.debugGrantCoins = exports.finalizeSeason = exports.processSeasonEvent = exports.onZoneConquestCreated = exports.onSegmentAttemptCreated = void 0;
const functions = require("firebase-functions/v2");
const notifications_1 = require("./notifications");
const admin = require("firebase-admin");
const trackAudit_1 = require("./antiCheat/trackAudit");
const segmentMath_1 = require("./utils/segmentMath");
// Only call initializeApp if it hasn't been initialized yet
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// ----------------------------------------------------------------------
// SEGMENT ATTEMPTS AUDIT
// ----------------------------------------------------------------------
async function autoAwardSeasonPoints(type, sourceEventId, zoneId, playerId, playerClanId) {
    try {
        const activeSeasonSnap = await db.collection('seasons').where('status', '==', 'active').limit(1).get();
        if (activeSeasonSnap.empty)
            return;
        const seasonId = activeSeasonSnap.docs[0].id;
        let eventScore = 100;
        const seasonEventId = `${seasonId}_${sourceEventId}`;
        const seasonEventRef = db.collection('seasonEvents').doc(seasonEventId);
        await db.runTransaction(async (transaction) => {
            const evSnap = await transaction.get(seasonEventRef);
            if (evSnap.exists)
                return;
            const playerScoreRef = db.collection('seasonScores').doc(`${seasonId}_${playerId}`);
            const playerScoreSnap = await transaction.get(playerScoreRef);
            if (playerScoreSnap.exists) {
                transaction.update(playerScoreRef, {
                    score: admin.firestore.FieldValue.increment(eventScore),
                    lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            else {
                const userRef = db.collection('users').doc(playerId);
                const userSnap = await transaction.get(userRef);
                const userData = userSnap.data() || {};
                transaction.set(playerScoreRef, {
                    seasonId,
                    playerId,
                    playerName: userData.name || 'Unknown',
                    playerNickname: userData.nickname || 'unknown',
                    playerAvatar: userData.avatar || '',
                    clanId: playerClanId,
                    score: eventScore,
                    lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            if (playerClanId) {
                const clanScoreRef = db.collection('seasonClanScores').doc(`${seasonId}_${playerClanId}`);
                const clanScoreSnap = await transaction.get(clanScoreRef);
                if (clanScoreSnap.exists) {
                    transaction.update(clanScoreRef, {
                        score: admin.firestore.FieldValue.increment(eventScore),
                        lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
                else {
                    const clanRef = db.collection('clans').doc(playerClanId);
                    const clanSnap = await transaction.get(clanRef);
                    const clanDoc = clanSnap.data() || {};
                    transaction.set(clanScoreRef, {
                        seasonId,
                        clanId: playerClanId,
                        clanName: clanDoc.name || 'Unknown',
                        clanIcon: clanDoc.icon || clanDoc.symbol || '🛡️',
                        score: eventScore,
                        lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
            }
            transaction.set(seasonEventRef, {
                seasonId,
                sourceEventId,
                type,
                playerId,
                scoreAwarded: eventScore,
                processedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            // Economy: grant coins and chest
            const rewardAmount = 50;
            const walletRef = db.collection('users').doc(playerId).collection('wallet').doc('main');
            const walletSnap = await transaction.get(walletRef);
            let currentBalance = 0;
            let currentEarned = 0;
            if (walletSnap.exists) {
                const w = walletSnap.data() || {};
                currentBalance = w.balance || 0;
                currentEarned = w.totalEarned || 0;
            }
            const newBalance = currentBalance + rewardAmount;
            if (walletSnap.exists) {
                transaction.update(walletRef, {
                    balance: newBalance,
                    totalEarned: currentEarned + rewardAmount,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            else {
                transaction.set(walletRef, {
                    playerId: playerId,
                    currencyName: 'moedas',
                    currencySymbol: '🪙',
                    balance: newBalance,
                    totalEarned: rewardAmount,
                    totalSpent: 0,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            const uuidv4Local = require('uuid').v4;
            const txId = uuidv4Local();
            const txRef = db.collection('users').doc(playerId).collection('walletTransactions').doc(txId);
            transaction.set(txRef, {
                id: txId,
                playerId: playerId,
                type: 'territory_reward',
                amount: rewardAmount,
                balanceAfter: newBalance,
                source: 'zone_conquest',
                sourceId: seasonEventId,
                description: 'Recompensa de Guerra Territorial',
                timestamp: new Date().toISOString(),
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            // Award a chest occasionally (e.g. 100% for testing or 20% normally, let's just award a bronze chest)
            const chestId = uuidv4Local();
            const chestRef = db.collection('users').doc(playerId).collection('chests').doc(chestId);
            transaction.set(chestRef, {
                id: chestId,
                userId: playerId,
                type: 'bronze',
                source: 'zone_conquest',
                sourceId: seasonEventId,
                seasonId: seasonId,
                status: 'available',
                createdAt: new Date().toISOString()
            });
        });
    }
    catch (e) {
        console.error('Error awarding season points', e);
    }
}
exports.onSegmentAttemptCreated = functions.firestore.onDocumentCreated('segments/{segmentId}/attempts/{attemptId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot)
        return;
    const attemptData = snapshot.data();
    // Idempotency: Check if already processed
    if (attemptData.antiCheatStatus) {
        return;
    }
    const segmentId = event.params.segmentId;
    const trackPoints = attemptData.trackPoints || [];
    const auditResult = (0, trackAudit_1.auditTrack)(trackPoints);
    // Optional: Cross-reference with segment path
    if (auditResult.riskScore < 100) { // Don't bother if already completely invalid
        const segmentDoc = await db.collection('segments').doc(segmentId).get();
        if (segmentDoc.exists) {
            const segmentData = segmentDoc.data();
            const segmentPath = segmentData === null || segmentData === void 0 ? void 0 : segmentData.path;
            if (segmentPath && segmentPath.length >= 2) {
                // Check if they deviated significantly (simplistic check for now)
                let outOfBoundsCount = 0;
                for (const pt of trackPoints) {
                    const distToPathResult = (0, segmentMath_1.getDistanceToPath)([pt.latitude, pt.longitude], segmentPath);
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
    if (auditResult.riskScore > 100)
        auditResult.riskScore = 100;
    if (auditResult.riskScore > 20)
        auditResult.suspicious = true;
    const antiCheatStatus = auditResult.suspicious ? (auditResult.riskScore > 80 ? 'rejected' : 'suspicious') : 'approved';
    // FASE 3.8 - Update attempt and bestRecord atomically
    await db.runTransaction(async (transaction) => {
        const segRef = db.collection('segments').doc(segmentId);
        const segSnap = await transaction.get(segRef);
        transaction.update(snapshot.ref, {
            antiCheatStatus: antiCheatStatus,
            antiCheat: auditResult
        });
        if (!segSnap.exists)
            return;
        const currentData = segSnap.data();
        const currentBest = currentData === null || currentData === void 0 ? void 0 : currentData.bestRecord;
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
});
// ----------------------------------------------------------------------
// ZONE CONQUESTS AUDIT & SERVER AUTHORITY (PHASE 3.9)
// ----------------------------------------------------------------------
exports.onZoneConquestCreated = functions.firestore.onDocumentCreated('zones/{zoneId}/history/{operationId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot)
        return;
    const historyData = snapshot.data();
    // Idempotency: Check if already processed
    if (historyData.antiCheatStatus) {
        return;
    }
    const zoneId = event.params.zoneId;
    const playerId = historyData.playerId;
    const trackPoints = historyData.trackPoints || [];
    const nowUnix = historyData.createdAt || Date.now();
    const nowIso = new Date(nowUnix).toISOString();
    // 1. Audit Track
    const auditResult = (0, trackAudit_1.auditTrack)(trackPoints);
    let antiCheatStatus = auditResult.suspicious ? (auditResult.riskScore > 80 ? 'rejected' : 'suspicious') : 'approved';
    // 2. We can do pre-transaction queries!
    // Let's get the player's real clan safely
    const clansQuery = await db.collection('clans').where('memberIds', 'array-contains', playerId).limit(1).get();
    let playerClanId = null;
    let playerClanRef = null;
    if (!clansQuery.empty) {
        playerClanId = clansQuery.docs[0].id;
        playerClanRef = clansQuery.docs[0].ref;
    }
    // 3. Server-Side Transaction
    const txResult = await db.runTransaction(async (transaction) => {
        var _a, _b, _c, _d, _e;
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
        if (!zoneDoc.exists)
            return;
        const currentZone = zoneDoc.data();
        // Concurrency check: Does this operation's createdAt beat the lastConquered time?
        const lastConqueredTimestamp = currentZone.lastConquered ? new Date(currentZone.lastConquered).getTime() : 0;
        // If the zone is free, OR the operation is newer than the last conquer, update controller
        if (currentZone.status === 'free' || nowUnix >= lastConqueredTimestamp) {
            // Build new controller info from history payload if available
            // but override the clanId with the SERVER verified clanId!
            const clientController = ((_a = historyData.payload) === null || _a === void 0 ? void 0 : _a.controller) || {};
            const newController = Object.assign(Object.assign({}, clientController), { id: playerId, clanId: playerClanId });
            const updatedZoneData = {
                status: 'controlled',
                controller: newController,
                dominance: 100,
                activeDispute: null,
                contested: false,
                lastConquered: nowIso,
                conqueredAtUnix: nowUnix
            };
            // Flattened fields
            if (newController.name)
                updatedZoneData.controllerName = newController.name;
            if (newController.nickname)
                updatedZoneData.controllerNickname = newController.nickname;
            if (newController.avatar)
                updatedZoneData.controllerAvatar = newController.avatar;
            if (newController.level)
                updatedZoneData.controllerLevel = newController.level;
            // --- CLAN REWARDS & COOLDOWN ---
            if (playerClanId && playerClanRef) {
                const TERRITORY_REWARD_COOLDOWN_MS = 30 * 60 * 1000;
                const clanCooldowns = currentZone.clanCooldowns || {};
                const lastClanCooldown = clanCooldowns[playerClanId] || 0;
                if (nowUnix >= lastClanCooldown) {
                    updatedZoneData.clanCooldowns = Object.assign(Object.assign({}, clanCooldowns), { [playerClanId]: nowUnix + TERRITORY_REWARD_COOLDOWN_MS });
                    const clanDoc = await transaction.get(playerClanRef);
                    if (clanDoc.exists) {
                        const clanData = clanDoc.data();
                        let clanPointsAwarded = 0;
                        if (currentZone.status === 'free') {
                            clanPointsAwarded = 100;
                        }
                        else if (((_b = currentZone.controller) === null || _b === void 0 ? void 0 : _b.clanId) === playerClanId) {
                            clanPointsAwarded = 25;
                        }
                        else {
                            clanPointsAwarded = 150;
                        }
                        const clanUpdate = {};
                        clanUpdate.territoryScore = (clanData.territoryScore || 0) + clanPointsAwarded;
                        // Handle Enemy Zone count reduction
                        const enemyClanId = (_c = currentZone.controller) === null || _c === void 0 ? void 0 : _c.clanId;
                        if (enemyClanId && enemyClanId !== playerClanId) {
                            const enemyClanRef = db.collection('clans').doc(enemyClanId);
                            const enemyClanDoc = await transaction.get(enemyClanRef);
                            if (enemyClanDoc.exists) {
                                const eClanData = enemyClanDoc.data();
                                transaction.update(enemyClanRef, {
                                    zonesControlledCount: Math.max(0, (eClanData.zonesControlledCount || 1) - 1)
                                });
                                // Schedule notification
                                transaction._pushNotification = {
                                    enemyClanData: eClanData,
                                    zoneName: currentZone.name,
                                    zoneId: zoneId
                                };
                            }
                        }
                        // Increase our count if we didn't own it
                        if (((_d = currentZone.controller) === null || _d === void 0 ? void 0 : _d.clanId) !== playerClanId) {
                            clanUpdate.zonesControlledCount = (clanData.zonesControlledCount || 0) + 1;
                        }
                        // Process Clan Missions
                        const missions = clanData.missions || [];
                        let updatedMissions = [...missions];
                        let missionsUpdated = false;
                        let missionXpAwarded = 0;
                        for (let i = 0; i < updatedMissions.length; i++) {
                            let m = updatedMissions[i];
                            if (m.status !== 'active')
                                continue;
                            if (nowUnix >= m.expiresAt) {
                                m.status = 'expired';
                                missionsUpdated = true;
                                continue;
                            }
                            let progressGained = false;
                            if (m.type === 'EXPANSION' && currentZone.status === 'free') {
                                m.progress += 1;
                                progressGained = true;
                            }
                            else if (m.type === 'WAR' && currentZone.status !== 'free' && ((_e = currentZone.controller) === null || _e === void 0 ? void 0 : _e.clanId) !== playerClanId) {
                                m.progress += 1;
                                progressGained = true;
                            }
                            else if (m.type === 'DOMINANCE') {
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
        return transaction._pushNotification;
    });
    if (txResult && txResult.enemyClanData) {
        const eClanData = txResult.enemyClanData;
        if (eClanData.memberIds && Array.isArray(eClanData.memberIds)) {
            for (const memberId of eClanData.memberIds) {
                await (0, notifications_1.checkPreferencesAndSendPush)(memberId, 'notifyZoneConquest', '⚔️ Seu território foi tomado', `O clã adversário conquistou a zona ${txResult.zoneName}.`, { type: 'zone_lost', entityId: txResult.zoneId });
            }
        }
    }
    if (antiCheatStatus === 'approved') {
        await autoAwardSeasonPoints('ZONE_CONQUEST', event.params.operationId, event.params.zoneId, historyData.playerId, playerClanId);
    }
});
// ----------------------------------------------------------------------
// SEASON EVENT PROCESSOR (PHASE 4.0)
// ----------------------------------------------------------------------
exports.processSeasonEvent = functions.https.onCall(async (request) => {
    const data = request.data;
    const context = { auth: request.auth };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const { sourceEventId, type, zoneId } = data;
    if (!sourceEventId || !type) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing sourceEventId or type.');
    }
    const playerId = context.auth.uid;
    // 1. Get active season
    const activeSeasonSnap = await db.collection('seasons').where('status', '==', 'active').limit(1).get();
    if (activeSeasonSnap.empty) {
        throw new functions.https.HttpsError('failed-precondition', 'No active season found.');
    }
    const seasonDoc = activeSeasonSnap.docs[0];
    const seasonId = seasonDoc.id;
    // 2. Validate source event
    let eventScore = 0;
    if (type === 'ZONE_CONQUEST') {
        if (!zoneId)
            throw new functions.https.HttpsError('invalid-argument', 'Missing zoneId.');
        const historyRef = db.collection('zones').doc(zoneId).collection('history').doc(sourceEventId);
        const historySnap = await historyRef.get();
        if (!historySnap.exists) {
            throw new functions.https.HttpsError('not-found', 'Source event not found.');
        }
        const historyData = historySnap.data();
        if (historyData.playerId !== playerId) {
            throw new functions.https.HttpsError('permission-denied', 'Not your event.');
        }
        if (historyData.antiCheatStatus !== 'approved') {
            throw new functions.https.HttpsError('failed-precondition', 'Event not approved by anti-cheat.');
        }
        eventScore = 100; // Base score for valid conquest
    }
    else {
        throw new functions.https.HttpsError('invalid-argument', 'Unknown event type.');
    }
    const seasonEventId = `${seasonId}_${sourceEventId}`;
    const seasonEventRef = db.collection('seasonEvents').doc(seasonEventId);
    // 3. Idempotent Transaction
    await db.runTransaction(async (transaction) => {
        const evSnap = await transaction.get(seasonEventRef);
        if (evSnap.exists) {
            // Already processed, do nothing
            return;
        }
        // Find player clan
        const clansQuery = await db.collection('clans').where('memberIds', 'array-contains', playerId).limit(1).get();
        let playerClanId = null;
        if (!clansQuery.empty) {
            playerClanId = clansQuery.docs[0].id;
        }
        // Update Player Season Score
        const playerScoreRef = db.collection('seasonScores').doc(`${seasonId}_${playerId}`);
        const playerScoreSnap = await transaction.get(playerScoreRef);
        if (playerScoreSnap.exists) {
            transaction.update(playerScoreRef, {
                score: admin.firestore.FieldValue.increment(eventScore),
                lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        else {
            // Need player profile for ranking
            const userRef = db.collection('users').doc(playerId);
            const userSnap = await transaction.get(userRef);
            const userData = userSnap.data() || {};
            transaction.set(playerScoreRef, {
                seasonId,
                playerId,
                playerName: userData.name || 'Unknown',
                playerNickname: userData.nickname || 'unknown',
                playerAvatar: userData.avatar || '',
                clanId: playerClanId,
                score: eventScore,
                lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        // Update Clan Season Score
        if (playerClanId) {
            const clanScoreRef = db.collection('seasonClanScores').doc(`${seasonId}_${playerClanId}`);
            const clanScoreSnap = await transaction.get(clanScoreRef);
            if (clanScoreSnap.exists) {
                transaction.update(clanScoreRef, {
                    score: admin.firestore.FieldValue.increment(eventScore),
                    lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            else {
                const clanDoc = clansQuery.docs[0].data();
                transaction.set(clanScoreRef, {
                    seasonId,
                    clanId: playerClanId,
                    clanName: clanDoc.name || 'Unknown',
                    clanIcon: clanDoc.icon || clanDoc.symbol || '🛡️',
                    score: eventScore,
                    lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }
        // Mark as processed
        transaction.set(seasonEventRef, {
            seasonId,
            sourceEventId,
            type,
            playerId,
            scoreAwarded: eventScore,
            processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    });
    return { success: true, eventScore };
});
// ----------------------------------------------------------------------
// SEASON FINALIZER
// ----------------------------------------------------------------------
exports.finalizeSeason = functions.https.onCall(async (request) => {
    const data = request.data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // Optionally restrict to admin only, for now we will just check if time passed
    const { seasonId } = data;
    if (!seasonId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing seasonId.');
    }
    await db.runTransaction(async (transaction) => {
        const seasonRef = db.collection('seasons').doc(seasonId);
        const seasonSnap = await transaction.get(seasonRef);
        if (!seasonSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'Season not found.');
        }
        const seasonData = seasonSnap.data();
        if (seasonData.status !== 'active') {
            throw new functions.https.HttpsError('failed-precondition', 'Season is not active.');
        }
        // Mark as finished
        transaction.update(seasonRef, {
            status: 'finished',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Here we could snapshot top players, but for Phase 4.0 we just keep the seasonScores accessible
    });
    return { success: true };
});
const uuid_1 = require("uuid");
exports.debugGrantCoins = functions.https.onCall(async (request) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const context = { auth: request.auth };
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    const amount = request.data.amount || 100;
    const userId = context.auth.uid;
    try {
        await grantEconomyReward(userId, 'admin_grant', 'debug_grant', amount, 'currency');
        return { success: true };
    }
    catch (e) {
        console.error(e);
        return { success: false };
    }
});
exports.openChest = functions.https.onCall(async (request) => {
    const context = { auth: request.auth };
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    const chestId = request.data.chestId;
    if (!chestId)
        throw new functions.https.HttpsError('invalid-argument', 'Chest ID required.');
    const userId = context.auth.uid;
    try {
        const result = await db.runTransaction(async (transaction) => {
            const chestRef = db.collection('users').doc(userId).collection('chests').doc(chestId);
            const chestSnap = await transaction.get(chestRef);
            if (!chestSnap.exists) {
                throw new Error('Chest not found');
            }
            const chestData = chestSnap.data() || {};
            if (chestData.status !== 'available') {
                throw new Error('Chest is not available');
            }
            // Generate a reward based on chest type
            let rewardAmount = 50;
            if (chestData.type === 'silver')
                rewardAmount = 150;
            if (chestData.type === 'gold')
                rewardAmount = 500;
            // Record reward
            const walletRef = db.collection('users').doc(userId).collection('wallet').doc('main');
            const walletSnap = await transaction.get(walletRef);
            let currentBalance = 0;
            let currentEarned = 0;
            if (walletSnap.exists) {
                const w = walletSnap.data() || {};
                currentBalance = w.balance || 0;
                currentEarned = w.totalEarned || 0;
            }
            const newBalance = currentBalance + rewardAmount;
            if (walletSnap.exists) {
                transaction.update(walletRef, {
                    balance: newBalance,
                    totalEarned: currentEarned + rewardAmount,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            else {
                transaction.set(walletRef, {
                    playerId: userId,
                    currencyName: 'moedas',
                    currencySymbol: '🪙',
                    balance: newBalance,
                    totalEarned: rewardAmount,
                    totalSpent: 0,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            const txId = (0, uuid_1.v4)();
            const txRef = db.collection('users').doc(userId).collection('walletTransactions').doc(txId);
            transaction.set(txRef, {
                id: txId,
                playerId: userId,
                type: 'chest_reward',
                amount: rewardAmount,
                balanceAfter: newBalance,
                source: 'chest',
                sourceId: chestId,
                description: `Recompensa de Cofre ${chestData.type.toUpperCase()}`,
                timestamp: new Date().toISOString(),
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            transaction.update(chestRef, {
                status: 'opened',
                openedAt: new Date().toISOString(),
                rewardTransactionId: txId,
                rewards: [{
                        type: 'currency',
                        amount: rewardAmount
                    }]
            });
            return { success: true, reward: { type: 'currency', amount: rewardAmount } };
        });
        return result;
    }
    catch (e) {
        console.error('Error opening chest:', e);
        return { success: false, error: e.message };
    }
});
async function grantEconomyReward(userId, transactionType, sourceId, amount, rewardType) {
    if (rewardType !== 'currency')
        return;
    await db.runTransaction(async (transaction) => {
        // check idempotency if needed, but here we just rely on ledger sourceId mapping if we wanted.
        // For simplicity, we just grant it.
        const walletRef = db.collection('users').doc(userId).collection('wallet').doc('main');
        const walletSnap = await transaction.get(walletRef);
        let currentBalance = 0;
        let currentEarned = 0;
        if (walletSnap.exists) {
            const w = walletSnap.data() || {};
            currentBalance = w.balance || 0;
            currentEarned = w.totalEarned || 0;
        }
        const newBalance = currentBalance + amount;
        if (walletSnap.exists) {
            transaction.update(walletRef, {
                balance: newBalance,
                totalEarned: currentEarned + amount,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        else {
            transaction.set(walletRef, {
                playerId: userId,
                currencyName: 'moedas',
                currencySymbol: '🪙',
                balance: newBalance,
                totalEarned: amount,
                totalSpent: 0,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        const txId = (0, uuid_1.v4)();
        const txRef = db.collection('users').doc(userId).collection('walletTransactions').doc(txId);
        transaction.set(txRef, {
            id: txId,
            playerId: userId,
            type: transactionType,
            amount: amount,
            balanceAfter: newBalance,
            source: 'system',
            sourceId: sourceId,
            description: `Recompensa: ${transactionType}`,
            timestamp: new Date().toISOString(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
    });
}
exports.purchaseShopItem = functions.https.onCall(async (request) => {
    const context = { auth: request.auth };
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    const itemId = request.data.itemId;
    if (!itemId)
        throw new functions.https.HttpsError('invalid-argument', 'Item ID required.');
    const userId = context.auth.uid;
    try {
        const result = await db.runTransaction(async (transaction) => {
            const itemRef = db.collection('shopItems').doc(itemId);
            const itemSnap = await transaction.get(itemRef);
            if (!itemSnap.exists) {
                throw new Error('Item not found');
            }
            const itemData = itemSnap.data() || {};
            if (!itemData.isActive) {
                throw new Error('Item is not available');
            }
            const price = itemData.price || 0;
            const inventoryRef = db.collection('users').doc(userId).collection('inventory').doc(itemId);
            const inventorySnap = await transaction.get(inventoryRef);
            if (inventorySnap.exists) {
                throw new Error('User already owns this item');
            }
            const walletRef = db.collection('users').doc(userId).collection('wallet').doc('main');
            const walletSnap = await transaction.get(walletRef);
            let currentBalance = 0;
            let currentSpent = 0;
            if (walletSnap.exists) {
                const w = walletSnap.data() || {};
                currentBalance = w.balance || 0;
                currentSpent = w.totalSpent || 0;
            }
            if (currentBalance < price) {
                throw new Error('Insufficient balance');
            }
            const newBalance = currentBalance - price;
            const newSpent = currentSpent + price;
            transaction.update(walletRef, {
                balance: newBalance,
                totalSpent: newSpent,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            const txId = require('uuid').v4();
            const txRef = db.collection('users').doc(userId).collection('walletTransactions').doc(txId);
            transaction.set(txRef, {
                id: txId,
                playerId: userId,
                type: 'shop_purchase',
                amount: -price,
                balanceAfter: newBalance,
                source: 'shop',
                sourceId: itemId,
                description: `Compra na loja: ${itemData.name}`,
                timestamp: new Date().toISOString(),
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            transaction.set(inventoryRef, {
                itemId: itemId,
                acquiredAt: admin.firestore.FieldValue.serverTimestamp(),
                source: 'shop_purchase',
                seasonId: itemData.seasonId || null,
                purchaseId: txId
            });
            return { success: true, newBalance };
        });
        return result;
    }
    catch (e) {
        console.error('Error purchasing item:', e);
        return { success: false, error: e.message };
    }
});
exports.equipCosmetic = functions.https.onCall(async (request) => {
    const context = { auth: request.auth };
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    const itemId = request.data.itemId;
    const category = request.data.category; // expect 'avatar_frame', 'title', etc
    if (!itemId || !category)
        throw new functions.https.HttpsError('invalid-argument', 'Item ID and Category required.');
    const userId = context.auth.uid;
    try {
        const result = await db.runTransaction(async (transaction) => {
            const inventoryRef = db.collection('users').doc(userId).collection('inventory').doc(itemId);
            const inventorySnap = await transaction.get(inventoryRef);
            if (!inventorySnap.exists) {
                throw new Error('User does not own this item');
            }
            // Validate category against shop/officialTitles? Let's just trust for now since they own it.
            // Ideally we check if the item is indeed of that category.
            const cosmeticsRef = db.collection('users').doc(userId).collection('profile').doc('cosmetics');
            const cosmeticsSnap = await transaction.get(cosmeticsRef);
            const updateData = {};
            updateData[category] = itemId;
            updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
            if (cosmeticsSnap.exists) {
                transaction.update(cosmeticsRef, updateData);
            }
            else {
                transaction.set(cosmeticsRef, updateData);
            }
            return { success: true };
        });
        return result;
    }
    catch (e) {
        console.error('Error equipping cosmetic:', e);
        return { success: false, error: e.message };
    }
});
exports.seedShop = functions.https.onCall(async (request) => {
    // Admin only, or open for testing
    try {
        const items = [
            { id: 'frame_gold', name: 'Moldura de Ouro', description: 'Uma moldura reluzente.', category: 'avatar_frame', price: 500, rarity: 'rare', isActive: true, visualKey: 'gold_frame' },
            { id: 'title_veteran', name: 'Veterano', description: 'Para jogadores experientes.', category: 'title', price: 1000, rarity: 'epic', isActive: true, visualKey: 'title_veteran' },
            { id: 'badge_star', name: 'Estrela', description: 'Uma insígnia brilhante.', category: 'profile_badge', price: 200, rarity: 'common', isActive: true, visualKey: 'badge_star' }
        ];
        for (const item of items) {
            await db.collection('shopItems').doc(item.id).set(item);
        }
        return { success: true };
    }
    catch (e) {
        return { success: false, error: e.message };
    }
});
exports.onClanInviteCreated = functions.firestore.onDocumentCreated('clanInvites/{inviteId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot)
        return;
    const inviteData = snapshot.data();
    if (inviteData.userId && inviteData.clanName) {
        await (0, notifications_1.checkPreferencesAndSendPush)(inviteData.userId, 'notifySocialActivities', '🤝 Novo Convite de Clã', `Você foi convidado para o clã ${inviteData.clanName}.`, { type: 'clan_invite', entityId: inviteData.clanId });
    }
});
//# sourceMappingURL=index.js.map
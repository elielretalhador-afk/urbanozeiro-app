import sys

with open('functions/src/index.ts', 'r') as f:
    content = f.read()

helper_function = """
async function autoAwardSeasonPoints(type: string, sourceEventId: string, zoneId: string, playerId: string, playerClanId: string | null) {
    try {
        const activeSeasonSnap = await db.collection('seasons').where('status', '==', 'active').limit(1).get();
        if (activeSeasonSnap.empty) return;
        const seasonId = activeSeasonSnap.docs[0].id;
        
        let eventScore = 100;
        const seasonEventId = `${seasonId}_${sourceEventId}`;
        const seasonEventRef = db.collection('seasonEvents').doc(seasonEventId);
        
        await db.runTransaction(async (transaction: any) => {
            const evSnap = await transaction.get(seasonEventRef);
            if (evSnap.exists) return;
            
            const playerScoreRef = db.collection('seasonScores').doc(`${seasonId}_${playerId}`);
            const playerScoreSnap = await transaction.get(playerScoreRef);
            
            if (playerScoreSnap.exists) {
                transaction.update(playerScoreRef, {
                    score: admin.firestore.FieldValue.increment(eventScore),
                    lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
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
                } else {
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
        });
    } catch (e) {
        console.error('Error awarding season points', e);
    }
}
"""

content = content.replace("export const onSegmentAttemptCreated", helper_function + "\nexport const onSegmentAttemptCreated")

# now inject the call inside onZoneConquestCreated, right after transaction.update(zoneRef, updatedZoneData);
call_injection = """
            transaction.update(zoneRef, updatedZoneData);
        }
    });

    if (antiCheatStatus === 'approved') {
       await autoAwardSeasonPoints('ZONE_CONQUEST', event.params.operationId, event.params.zoneId, historyData.playerId, currentZone.controller?.clanId || null);
    }
"""
content = content.replace("            transaction.update(zoneRef, updatedZoneData);\n        }\n    });", call_injection)

with open('functions/src/index.ts', 'w') as f:
    f.write(content)

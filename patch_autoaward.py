import sys

with open('functions/src/index.ts', 'r') as f:
    content = f.read()

economy_award = """
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
            } else {
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
"""

content = content.replace("""            transaction.set(seasonEventRef, {
                seasonId,
                sourceEventId,
                type,
                playerId,
                scoreAwarded: eventScore,
                processedAt: admin.firestore.FieldValue.serverTimestamp()
            });""", economy_award)

with open('functions/src/index.ts', 'w') as f:
    f.write(content)

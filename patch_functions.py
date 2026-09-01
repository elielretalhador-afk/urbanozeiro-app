import sys

with open('functions/src/index.ts', 'r') as f:
    content = f.read()

# Add Cloud Functions for Economy
economy_functions = """
import { v4 as uuidv4 } from 'uuid';

export const debugGrantCoins = functions.https.onCall(async (request: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const context = { auth: request.auth };
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    
    const amount = request.data.amount || 100;
    const userId = context.auth.uid;
    
    try {
        await grantEconomyReward(userId, 'admin_grant', 'debug_grant', amount, 'currency');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false };
    }
});

export const openChest = functions.https.onCall(async (request: any) => {
    const context = { auth: request.auth };
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    
    const chestId = request.data.chestId;
    if (!chestId) throw new functions.https.HttpsError('invalid-argument', 'Chest ID required.');
    
    const userId = context.auth.uid;
    
    try {
        const result = await db.runTransaction(async (transaction: any) => {
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
            if (chestData.type === 'silver') rewardAmount = 150;
            if (chestData.type === 'gold') rewardAmount = 500;
            
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
            } else {
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
            
            const txId = uuidv4();
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
    } catch (e: any) {
        console.error('Error opening chest:', e);
        return { success: false, error: e.message };
    }
});

async function grantEconomyReward(userId: string, transactionType: string, sourceId: string, amount: number, rewardType: string) {
    if (rewardType !== 'currency') return;
    
    await db.runTransaction(async (transaction: any) => {
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
        } else {
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
        
        const txId = uuidv4();
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
"""

content = content + "\n" + economy_functions

with open('functions/src/index.ts', 'w') as f:
    f.write(content)

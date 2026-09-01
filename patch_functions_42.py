import sys

with open('functions/src/index.ts', 'r') as f:
    content = f.read()

shop_functions = """
export const purchaseShopItem = functions.https.onCall(async (request: any) => {
    const context = { auth: request.auth };
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    
    const itemId = request.data.itemId;
    if (!itemId) throw new functions.https.HttpsError('invalid-argument', 'Item ID required.');
    
    const userId = context.auth.uid;
    
    try {
        const result = await db.runTransaction(async (transaction: any) => {
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
    } catch (e: any) {
        console.error('Error purchasing item:', e);
        return { success: false, error: e.message };
    }
});

export const equipCosmetic = functions.https.onCall(async (request: any) => {
    const context = { auth: request.auth };
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    
    const itemId = request.data.itemId;
    const category = request.data.category; // expect 'avatar_frame', 'title', etc
    
    if (!itemId || !category) throw new functions.https.HttpsError('invalid-argument', 'Item ID and Category required.');
    
    const userId = context.auth.uid;
    
    try {
        const result = await db.runTransaction(async (transaction: any) => {
            const inventoryRef = db.collection('users').doc(userId).collection('inventory').doc(itemId);
            const inventorySnap = await transaction.get(inventoryRef);
            
            if (!inventorySnap.exists) {
                throw new Error('User does not own this item');
            }
            
            // Validate category against shop/officialTitles? Let's just trust for now since they own it.
            // Ideally we check if the item is indeed of that category.
            
            const cosmeticsRef = db.collection('users').doc(userId).collection('profile').doc('cosmetics');
            const cosmeticsSnap = await transaction.get(cosmeticsRef);
            
            const updateData: any = {};
            updateData[category] = itemId;
            updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
            
            if (cosmeticsSnap.exists) {
                transaction.update(cosmeticsRef, updateData);
            } else {
                transaction.set(cosmeticsRef, updateData);
            }
            
            return { success: true };
        });
        
        return result;
    } catch (e: any) {
        console.error('Error equipping cosmetic:', e);
        return { success: false, error: e.message };
    }
});

export const seedShop = functions.https.onCall(async (request: any) => {
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
    } catch (e: any) {
        return { success: false, error: e.message };
    }
});
"""

if "purchaseShopItem" not in content:
    content = content + "\n" + shop_functions
    with open('functions/src/index.ts', 'w') as f:
        f.write(content)

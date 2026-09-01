import sys

with open('src/services/economyService.ts', 'r') as f:
    content = f.read()

types_import = "import { VirtualWallet, Chest, CurrencyTransaction, ShopItem, InventoryItem, EquippedCosmetics } from '../types';"
content = content.replace("import { VirtualWallet, Chest, CurrencyTransaction } from '../types';", types_import)

service_methods = """
  static subscribeToShopItems(callback: (items: ShopItem[]) => void) {
    const q = query(collection(db, 'shopItems'), orderBy('price', 'asc'));
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => d.data() as ShopItem);
      callback(items);
    });
  }

  static subscribeToInventory(userId: string, callback: (items: InventoryItem[]) => void) {
    const q = query(collection(db, 'users', userId, 'inventory'));
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => d.data() as InventoryItem);
      callback(items);
    });
  }

  static subscribeToEquippedCosmetics(userId: string, callback: (equipped: EquippedCosmetics | null) => void) {
    const docRef = doc(db, 'users', userId, 'profile', 'cosmetics');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as EquippedCosmetics);
      } else {
        callback(null);
      }
    });
  }

  static async purchaseShopItem(itemId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const purchaseFn = httpsCallable(functions, 'purchaseShopItem');
      const result = await purchaseFn({ itemId });
      return result.data as any;
    } catch (e: any) {
      console.error('Error purchasing item:', e);
      return { success: false, error: e.message };
    }
  }

  static async equipCosmetic(itemId: string, category: string): Promise<{ success: boolean; error?: string }> {
    try {
      const equipFn = httpsCallable(functions, 'equipCosmetic');
      const result = await equipFn({ itemId, category });
      return result.data as any;
    } catch (e: any) {
      console.error('Error equipping cosmetic:', e);
      return { success: false, error: e.message };
    }
  }
  
  static async seedShop(): Promise<void> {
    try {
      const seedFn = httpsCallable(functions, 'seedShop');
      await seedFn();
    } catch (e) {
      console.error('Error seeding shop:', e);
    }
  }
"""

if "subscribeToShopItems" not in content:
    # insert before the last brace
    last_brace_idx = content.rfind('}')
    content = content[:last_brace_idx] + service_methods + content[last_brace_idx:]
    with open('src/services/economyService.ts', 'w') as f:
        f.write(content)

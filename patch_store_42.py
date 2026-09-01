import sys

with open('src/components/VirtualWalletModal.tsx', 'r') as f:
    content = f.read()

types_import = """import { EconomyService } from '../services/economyService';
import { Chest, ShopItem, InventoryItem, EquippedCosmetics } from '../types';"""
content = content.replace("import { Chest } from '../types';", types_import)

state_vars = """  const [openingChest, setOpeningChest] = useState<string | null>(null);

  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equipped, setEquipped] = useState<EquippedCosmetics | null>(null);
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);
  const [equippingItem, setEquippingItem] = useState<string | null>(null);

  React.useEffect(() => {
    const unsubShop = EconomyService.subscribeToShopItems(setShopItems);
    let unsubInv = () => {};
    let unsubEq = () => {};
    if (wallet.playerId) {
      unsubInv = EconomyService.subscribeToInventory(wallet.playerId, setInventory);
      unsubEq = EconomyService.subscribeToEquippedCosmetics(wallet.playerId, setEquipped);
    }
    return () => {
      unsubShop();
      unsubInv();
      unsubEq();
    };
  }, [wallet.playerId]);

  const handlePurchase = async (item: ShopItem) => {
    if (wallet.balance < item.price) {
      alert("Saldo insuficiente!");
      return;
    }
    setPurchasingItem(item.id);
    const res = await EconomyService.purchaseShopItem(item.id);
    if (res.success) {
      alert("Item adquirido!");
    } else {
      alert("Erro na compra: " + res.error);
    }
    setPurchasingItem(null);
  };

  const handleEquip = async (item: ShopItem) => {
    setEquippingItem(item.id);
    const res = await EconomyService.equipCosmetic(item.id, item.category);
    if (res.success) {
      // success
    } else {
      alert("Erro ao equipar: " + res.error);
    }
    setEquippingItem(null);
  };
"""

content = content.replace("  const [openingChest, setOpeningChest] = useState<string | null>(null);", state_vars)

# Now, we replace the whole "loja" tab render

store_tab = """
          {activeTab === 'loja' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-white font-bold font-display uppercase tracking-wider">Catálogo Sazonal</h3>
                 <button onClick={() => EconomyService.seedShop()} className="text-xs text-white/30 hover:text-white/80">Seed Test Items</button>
              </div>

              {shopItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/40 font-mono-stat">Nenhum item na loja.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {shopItems.map((item) => {
                    const isOwned = inventory.some(inv => inv.itemId === item.id);
                    const isEquipped = equipped?.[item.category] === item.id;
                    const canAfford = wallet.balance >= item.price;
                    
                    return (
                      <div key={item.id} className="bg-[#121c2a] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                         <div>
                           <div className="text-xs text-yellow-400 font-bold mb-1 uppercase">{item.category.replace('_', ' ')}</div>
                           <h4 className="text-white font-bold">{item.name}</h4>
                           <p className="text-xs text-white/60 mt-1 mb-4 h-8">{item.description}</p>
                         </div>
                         
                         <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                           {!isOwned && (
                             <div className={`font-bold flex items-center gap-1 ${canAfford ? 'text-white' : 'text-red-400'}`}>
                               <Coins className="w-4 h-4 text-yellow-400" />
                               {item.price}
                             </div>
                           )}
                           
                           {isOwned ? (
                             <button
                               onClick={() => handleEquip(item)}
                               disabled={isEquipped || equippingItem === item.id}
                               className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                                 isEquipped 
                                   ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                                   : 'bg-white/10 text-white hover:bg-white/20'
                               }`}
                             >
                               {equippingItem === item.id ? '...' : (isEquipped ? 'Equipado' : 'Equipar')}
                             </button>
                           ) : (
                             <button
                               onClick={() => handlePurchase(item)}
                               disabled={!canAfford || purchasingItem === item.id}
                               className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                                 canAfford 
                                   ? 'bg-yellow-400 hover:bg-yellow-300 text-black' 
                                   : 'bg-white/5 text-white/20 cursor-not-allowed'
                               }`}
                             >
                               {purchasingItem === item.id ? '...' : 'Comprar'}
                             </button>
                           )}
                         </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
"""

import re
content = re.sub(r"          \{/\* LOJA \*/\}.*?          \{/\* LOJA \*/\}", store_tab, content, flags=re.DOTALL)

with open('src/components/VirtualWalletModal.tsx', 'w') as f:
    f.write(content)

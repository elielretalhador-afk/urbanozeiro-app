import sys
import re

with open('src/components/VirtualWalletModal.tsx', 'r') as f:
    content = f.read()

# Fix ShopItem
content = content.replace("item.type === 'FRAME'", "item.category === 'avatar_frame'")
content = content.replace("item.type === 'TITLE'", "item.category === 'title'")
content = content.replace("item.type === 'BADGE'", "item.category === 'profile_badge'")
content = content.replace("{item.type}", "{item.category}")

# Fix InventoryItem mapping
inventory_replacement = """
                {inventory.length > 0 ? inventory.map((inv) => {
                  const itemDetails = shopItems.find(s => s.id === inv.itemId);
                  const itemCategory = itemDetails?.category || 'unknown';
                  const itemName = itemDetails?.name || inv.itemId;

                  return (
                    <div
                      key={inv.itemId}
                      className="p-3.5 rounded-2xl bg-[#0f1620] border border-white/10 flex flex-col justify-between gap-2.5 transition-all"
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex flex-col items-center justify-center shrink-0">
                          {itemCategory === 'avatar_frame' && <Sparkles className="w-5 h-5 text-yellow-400" />}
                          {itemCategory === 'title' && <ShieldCheck className="w-5 h-5 text-blue-400" />}
                          {itemCategory === 'profile_badge' && <Zap className="w-5 h-5 text-cyan-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] font-black uppercase text-purple-300 font-mono-stat px-1.5 py-0.5 rounded bg-purple-400/10">
                              {itemCategory}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white leading-tight">{itemName}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Adquirido</p>
                        </div>
                      </div>

                      <div className="flex items-end justify-end pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => handleEquip(inv.itemId, itemCategory)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-[10px] font-black font-mono-stat uppercase cursor-pointer transition-all"
                        >
                          Equipar
                        </button>
                      </div>
                    </div>
                  );
                }) : (
"""

content = re.sub(r"                \{inventory\.length > 0 \? inventory\.map\(\(inv\) => \{.*?\n                \}\) : \(", inventory_replacement, content, flags=re.DOTALL)


# Fix Chest
content = content.replace("chest.status === 'OPENED'", "chest.status === 'opened'")
content = content.replace("COFRE {chest.rarity}", "COFRE {chest.type}")

with open('src/components/VirtualWalletModal.tsx', 'w') as f:
    f.write(content)

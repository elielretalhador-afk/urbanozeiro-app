import sys
import re

with open('src/components/VirtualWalletModal.tsx', 'r') as f:
    content = f.read()

loja_content = """
          {activeTab === 'loja' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {shopItems.length > 0 ? shopItems.map((item) => {
                  const hasItem = inventory.some(i => i.itemId === item.id);
                  const canBuy = wallet.balance >= item.price;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-[#0f1620] border border-white/10 flex flex-col justify-between gap-2.5 transition-all"
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex flex-col items-center justify-center shrink-0">
                          {item.type === 'FRAME' && <Sparkles className="w-5 h-5 text-yellow-400" />}
                          {item.type === 'TITLE' && <ShieldCheck className="w-5 h-5 text-blue-400" />}
                          {item.type === 'BADGE' && <Zap className="w-5 h-5 text-cyan-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] font-black uppercase text-amber-300 font-mono-stat px-1.5 py-0.5 rounded bg-amber-400/10">
                              {item.type}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white leading-tight">{item.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{item.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className={`text-sm font-black font-mono-stat ${canBuy ? 'text-white' : 'text-rose-400'}`}>
                            {item.price.toLocaleString()}
                          </span>
                        </div>
                        {hasItem ? (
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl bg-slate-700/50 text-slate-400 text-[10px] font-bold font-mono-stat cursor-not-allowed uppercase"
                            disabled
                          >
                            Adquirido
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePurchase(item.id)}
                            disabled={!canBuy || isProcessing}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black font-mono-stat uppercase cursor-pointer transition-all ${
                              canBuy && !isProcessing
                                ? 'bg-yellow-400 hover:bg-yellow-300 text-black'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {isProcessing ? 'Processando...' : 'Comprar'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-slate-400 text-center w-full py-4 text-xs">A loja está vazia no momento.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'inventario' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {inventory.length > 0 ? inventory.map((inv) => {
                  return (
                    <div
                      key={inv.id}
                      className="p-3.5 rounded-2xl bg-[#0f1620] border border-white/10 flex flex-col justify-between gap-2.5 transition-all"
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex flex-col items-center justify-center shrink-0">
                          {inv.itemType === 'FRAME' && <Sparkles className="w-5 h-5 text-yellow-400" />}
                          {inv.itemType === 'TITLE' && <ShieldCheck className="w-5 h-5 text-blue-400" />}
                          {inv.itemType === 'BADGE' && <Zap className="w-5 h-5 text-cyan-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] font-black uppercase text-purple-300 font-mono-stat px-1.5 py-0.5 rounded bg-purple-400/10">
                              {inv.itemType}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white leading-tight">{inv.itemRef?.name || inv.itemId}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Adquirido em {new Date(inv.acquiredAt.seconds * 1000).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-end justify-end pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => handleEquip(inv.itemId, inv.itemType)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-[10px] font-black font-mono-stat uppercase cursor-pointer transition-all"
                        >
                          Equipar
                        </button>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-slate-400 text-center w-full py-4 text-xs">Seu inventário está vazio.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'cofres' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {chests.length > 0 ? chests.map((chest) => {
                  const isOpen = chest.status === 'OPENED';
                  return (
                    <div
                      key={chest.id}
                      className="p-3.5 rounded-2xl bg-[#0f1620] border border-white/10 flex flex-col justify-between gap-2.5 transition-all"
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex flex-col items-center justify-center shrink-0">
                          <Gift className={`w-6 h-6 ${isOpen ? 'text-slate-500' : 'text-amber-400 animate-pulse'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] font-black uppercase text-amber-300 font-mono-stat px-1.5 py-0.5 rounded bg-amber-400/10">
                              COFRE {chest.rarity}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white leading-tight">Recompensa Pendente</h4>
                        </div>
                      </div>

                      <div className="flex items-end justify-end pt-2 border-t border-white/10">
                        {isOpen ? (
                          <button disabled className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-500 text-[10px] font-black font-mono-stat uppercase">Aberto</button>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              if (isProcessing) return;
                              setIsProcessing(true);
                              const res = await EconomyService.openChest(chest.id);
                              setIsProcessing(false);
                              if (res.success) showFeedback('Cofre aberto!', 'success');
                              else showFeedback('Erro ao abrir.', 'error');
                            }}
                            disabled={isProcessing}
                            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-black font-mono-stat uppercase cursor-pointer transition-all"
                          >
                            Abrir Cofre
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-slate-400 text-center w-full py-4 text-xs">Você não possui cofres no momento.</p>
                )}
              </div>
            </div>
          )}
"""

# Replace everything from `{activeTab === 'loja' && (` to the end of the file except `</div>\n      </div>\n    </div>\n  );\n};\n`
# Actually, it's easier to find `{activeTab === 'loja' && (` and `{activeTab === 'regras' && (`

content = re.sub(r"          \{activeTab === 'loja' && \(.*?(?=        </div>\n      </div>\n    </div>\n  \);\n};\n)", loja_content + "\n", content, flags=re.DOTALL)

with open('src/components/VirtualWalletModal.tsx', 'w') as f:
    f.write(content)

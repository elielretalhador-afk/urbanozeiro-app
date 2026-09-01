import sys

with open('src/components/VirtualWalletModal.tsx', 'r') as f:
    content = f.read()

import_add = """import { EconomyService } from '../services/economyService';
import { Chest } from '../types';
"""

if "EconomyService" not in content:
    content = content.replace("import { VirtualWallet", import_add + "import { VirtualWallet")

state_add = """  const [transactions, setTransactions] = useState<CurrencyTransaction[]>([]);
  const [chests, setChests] = useState<Chest[]>([]);
  const [openingChest, setOpeningChest] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && wallet.playerId) {
      const unsub1 = EconomyService.subscribeToTransactions(wallet.playerId, setTransactions);
      const unsub2 = EconomyService.subscribeToChests(wallet.playerId, setChests);
      return () => {
        unsub1();
        unsub2();
      };
    }
  }, [isOpen, wallet.playerId]);

  const handleOpenChest = async (chestId: string) => {
    setOpeningChest(chestId);
    const res = await EconomyService.openChest(chestId);
    if (res.success) {
      alert(`Cofre aberto! Recompensa: ${res.reward?.amount} moedas!`);
    } else {
      alert(`Falha ao abrir o cofre.`);
    }
    setOpeningChest(null);
  };
"""

content = content.replace("  const [activeTab, setActiveTab] = useState<'carteira' | 'loja'>('carteira');", "  const [activeTab, setActiveTab] = useState<'carteira' | 'loja' | 'cofres'>('carteira');\n" + state_add)

# In the render, modify the transaction mapping to use `transactions` instead of `wallet.transactions`
content = content.replace("wallet.transactions.map((t)", "transactions.map((t)")
content = content.replace("wallet.transactions.length === 0", "transactions.length === 0")
content = content.replace("wallet.coins", "wallet.balance")

# Render Cofres Tab in the UI
cofres_ui = """
          {activeTab === 'cofres' && (
            <div className="space-y-4">
              <div className="bg-[#121c2a] border border-white/5 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold font-display">Seus Cofres</h3>
                    <p className="text-white/60 text-sm">Abra cofres para ganhar recompensas.</p>
                  </div>
                </div>
              </div>

              {chests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-white/40 font-mono-stat">Nenhum cofre encontrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {chests.map((c) => (
                    <div key={c.id} className="bg-[#121c2a] border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center">
                       <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${c.status === 'opened' ? 'bg-white/10 text-white/40' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                          <ShoppingBag className="w-8 h-8" />
                       </div>
                       <h4 className="text-white font-bold mb-1 uppercase tracking-wider">{c.type} Chest</h4>
                       <p className="text-xs text-white/50 mb-3">{c.status === 'opened' ? 'Já Aberto' : 'Disponível'}</p>
                       
                       {c.status === 'available' && (
                         <button 
                           disabled={openingChest === c.id}
                           onClick={() => handleOpenChest(c.id)}
                           className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all"
                         >
                           {openingChest === c.id ? 'Abrindo...' : 'Abrir Cofre'}
                         </button>
                       )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
"""

content = content.replace("          {/* LOJA */}", cofres_ui + "          {/* LOJA */}")

# Replace Tabs
tabs_html = """
          <div className="flex gap-2 bg-[#091018] p-2 rounded-2xl mb-6 border border-white/5">
            <button
              onClick={() => setActiveTab('carteira')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono-stat uppercase tracking-wider transition-all ${
                activeTab === 'carteira' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              Carteira
            </button>
            <button
              onClick={() => setActiveTab('cofres')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono-stat uppercase tracking-wider transition-all ${
                activeTab === 'cofres' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              Cofres
            </button>
            <button
              onClick={() => setActiveTab('loja')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono-stat uppercase tracking-wider transition-all ${
                activeTab === 'loja' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              Loja
            </button>
          </div>
"""

content = content.replace("""          <div className="flex gap-2 bg-[#091018] p-2 rounded-2xl mb-6 border border-white/5">
            <button
              onClick={() => setActiveTab('carteira')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono-stat uppercase tracking-wider transition-all ${
                activeTab === 'carteira' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              Extrato
            </button>
            <button
              onClick={() => setActiveTab('loja')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono-stat uppercase tracking-wider transition-all ${
                activeTab === 'loja' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              Loja Virtual
            </button>
          </div>""", tabs_html)


with open('src/components/VirtualWalletModal.tsx', 'w') as f:
    f.write(content)

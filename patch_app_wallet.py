import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace handleEarnCoins and handleSpendCoins
# Actually, since the modal requires them, I will modify the modal so it uses real actions or removes the buttons.
# But for App.tsx, I should load the wallet from EconomyService.

import_add = "import { EconomyService } from './services/economyService';\n"
if "import { EconomyService }" not in content:
    content = content.replace("import { auth, db, functions } from './lib/firebase';", import_add + "import { auth, db, functions } from './lib/firebase';")

state_replace = """
  const [wallet, setWallet] = useState<any>({ 
    id: 'temp', 
    playerId: 'temp', 
    currencyName: 'moedas', 
    currencySymbol: '🪙', 
    balance: 0, 
    totalEarned: 0, 
    totalSpent: 0, 
    transactions: [], 
    createdAt: '' 
  });
  
  useEffect(() => {
    if (user?.id) {
       const unsub = EconomyService.subscribeToWallet(user.id, (w) => {
           if (w) setWallet(w);
       });
       return () => unsub();
    }
  }, [user?.id]);
"""

content = content.replace("  const [wallet, setWallet] = useState<any>({ coins: 0, history: [] });", state_replace)

# Disable the handleEarnCoins / handleSpendCoins logic since it's server authoritative
content = content.replace("  const handleEarnCoins = (amount: number, source: any, desc: string, relatedId?: string) => { setWallet((prev: any) => ({...prev, coins: prev.coins + amount})); };", "  const handleEarnCoins = async (amount: number, source: any, desc: string, relatedId?: string) => { /* Disabled: Server Authoritative */ };")
content = content.replace("  const handleSpendCoins = (amount: number, source: any, desc: string, relatedId?: string) => { \n    if (wallet.coins >= amount) { setWallet((prev: any) => ({...prev, coins: prev.coins - amount})); return true; } \n    return false; \n  };", "  const handleSpendCoins = (amount: number, source: any, desc: string, relatedId?: string) => { /* Disabled: Server Authoritative */ return false; };")

with open('src/App.tsx', 'w') as f:
    f.write(content)

import sys
import re

with open('src/components/VirtualWalletModal.tsx', 'r') as f:
    content = f.read()

# First, add the required useEffects and states
state_injections = """
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [chests, setChests] = useState<Chest[]>([]);
  const [transactions, setTransactions] = useState<CurrencyTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (isOpen && wallet?.playerId) {
      const unsubShop = EconomyService.subscribeToShopItems(setShopItems);
      const unsubInv = EconomyService.subscribeToInventory(wallet.playerId, setInventory);
      const unsubChests = EconomyService.subscribeToChests(wallet.playerId, setChests);
      const unsubTx = EconomyService.subscribeToTransactions(wallet.playerId, setTransactions);
      return () => {
        unsubShop();
        unsubInv();
        unsubChests();
        unsubTx();
      };
    }
  }, [isOpen, wallet?.playerId]);

  const handlePurchase = async (itemId: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    const res = await EconomyService.purchaseShopItem(itemId);
    setIsProcessing(false);
    if (res.success) {
      showFeedback('Item adquirido com sucesso!', 'success');
    } else {
      showFeedback(res.error || 'Erro ao comprar item.', 'error');
    }
  };

  const handleEquip = async (itemId: string, itemType: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    const res = await EconomyService.equipCosmetic(itemId, itemType as any);
    setIsProcessing(false);
    if (res.success) {
      showFeedback('Item equipado!', 'success');
    } else {
      showFeedback(res.error || 'Erro ao equipar item.', 'error');
    }
  };
"""

content = content.replace("  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);", "  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);\n" + state_injections)


# Second, replace the Mock store render with real store render
# In the original, it used MOCK_COSMETIC_STORE_PRICES.map((item) => { ...
# Let's replace the whole catalog content
# We will do this via Python re block replacement.

with open('src/components/VirtualWalletModal.tsx', 'w') as f:
    f.write(content)

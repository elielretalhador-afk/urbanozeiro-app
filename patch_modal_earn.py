import sys

with open('src/components/VirtualWalletModal.tsx', 'r') as f:
    content = f.read()

replacement = """  const handleTestEarn = async (amount: number, source: CurrencySource, desc: string) => {
    // Disabled frontend-only earn, now uses backend function for debug
    const res = await EconomyService.debugGrantCoins(amount);
    if (res.success) {
      showFeedback(`+${amount} moedas creditadas com sucesso!`, 'success');
    } else {
      showFeedback('Erro ao adicionar moedas.', 'error');
    }
  };"""

content = content.replace("""  const handleTestEarn = (amount: number, source: CurrencySource, desc: string) => {
    if (onEarnCoins) {
      onEarnCoins(amount, source, desc);
      showFeedback(`+${amount} moedas creditadas com sucesso!`, 'success');
    }
  };""", replacement)

with open('src/components/VirtualWalletModal.tsx', 'w') as f:
    f.write(content)

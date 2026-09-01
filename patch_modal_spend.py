import sys

with open('src/components/VirtualWalletModal.tsx', 'r') as f:
    content = f.read()

replacement = """  const handleTestSpend = (item: MockStoreItemPrice) => {
    alert("Loja não implementada nesta fase. Apenas recompensa de temporada e cofres estão ativos.");
  };"""

import re
content = re.sub(r"  const handleTestSpend = \(item: MockStoreItemPrice\) => \{.*?\n  \};\n", replacement + "\n", content, flags=re.DOTALL)

with open('src/components/VirtualWalletModal.tsx', 'w') as f:
    f.write(content)

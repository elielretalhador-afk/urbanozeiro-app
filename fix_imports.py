import sys

with open('src/components/VirtualWalletModal.tsx', 'r') as f:
    content = f.read()

# Replace historyFilter mistake just in case
content = content.replace("historyFilter, Package, Gift, setHistoryFilter", "historyFilter, setHistoryFilter")
content = content.replace("historyFilter, Package, Gift,", "historyFilter,")

# Add imports
content = content.replace("  ShoppingBag,", "  ShoppingBag,\n  Package,\n  Gift,")

with open('src/components/VirtualWalletModal.tsx', 'w') as f:
    f.write(content)

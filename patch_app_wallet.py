import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add VirtualWalletModal component near the end
wallet_modal_code = """
        {/* Modal: Virtual Wallet / Economy Hub */}
        <VirtualWalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          wallet={wallet}
        />
"""

if "<VirtualWalletModal" not in content:
    content = content.replace("{/* Bottom Fixed Navigation Bar */}", wallet_modal_code + "\n        {/* Bottom Fixed Navigation Bar */}")
    
    with open('src/App.tsx', 'w') as f:
        f.write(content)

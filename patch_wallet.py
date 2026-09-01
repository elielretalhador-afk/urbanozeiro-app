with open('src/components/VirtualWalletModal.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(r'  const handleTestEarn = async.*?};\n\n  const handleTestSpend = .*?};\n', '', content, flags=re.DOTALL)

with open('src/components/VirtualWalletModal.tsx', 'w') as f:
    f.write(content)

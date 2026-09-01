import sys

with open('src/components/VirtualWalletModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { EconomyService } from '../services/economyService';\nimport { Chest, ShopItem, InventoryItem, EquippedCosmetics } from '../types';\nimport { EconomyService } from '../services/economyService';\nimport { Chest } from '../types';", "import { EconomyService } from '../services/economyService';\nimport { Chest, ShopItem, InventoryItem, EquippedCosmetics } from '../types';")

# Also might have duplicates of others, let's just make sure there's only one EconomyService import
lines = content.split('\n')
seen_economy = False
new_lines = []
for line in lines:
    if "import { EconomyService }" in line:
        if seen_economy:
            continue
        seen_economy = True
    if "import { Chest } from" in line:
        continue # we already have the combined one
    new_lines.append(line)

with open('src/components/VirtualWalletModal.tsx', 'w') as f:
    f.write('\n'.join(new_lines))


with open('src/types/index.ts', 'r') as f:
    t_content = f.read()

# Replace the whole block of types if it was duplicated
import re
t_content = re.sub(r'export type CosmeticCategory =.*?(?=export type CosmeticCategory)', '', t_content, flags=re.DOTALL)
# wait, my regex is bad. Let's just remove the first occurrence of the duplicate types manually.
blocks = t_content.split('export type CosmeticCategory =')
if len(blocks) > 2:
    t_content = blocks[0] + 'export type CosmeticCategory =' + blocks[2]

with open('src/types/index.ts', 'w') as f:
    f.write(t_content)


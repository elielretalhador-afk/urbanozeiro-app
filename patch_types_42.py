import sys

with open('src/types/index.ts', 'r') as f:
    content = f.read()

types_to_add = """
export type CosmeticCategory = 'avatar_frame' | 'avatar_effect' | 'profile_badge' | 'trail_cosmetic' | 'clan_emblem' | 'title';
export type CosmeticRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: CosmeticCategory;
  price: number;
  rarity: CosmeticRarity;
  seasonId?: string;
  isActive: boolean;
  visualKey: string;
}

export interface InventoryItem {
  itemId: string;
  acquiredAt: string;
  source: string;
  seasonId?: string;
  purchaseId?: string;
}

export interface OfficialTitle {
  id: string;
  name: string;
  description: string;
  rarity: CosmeticRarity;
  seasonId?: string;
  requirementType: string;
  requirementValue: number;
  isActive: boolean;
}

export interface EquippedCosmetics {
  avatar_frame?: string;
  avatar_effect?: string;
  profile_badge?: string;
  trail_cosmetic?: string;
  clan_emblem?: string;
  title?: string;
}
"""

if "export interface ShopItem {" not in content:
    content += types_to_add
    with open('src/types/index.ts', 'w') as f:
        f.write(content)

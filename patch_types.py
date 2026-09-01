import sys

with open('src/types/index.ts', 'r') as f:
    content = f.read()

# Add Chest Types
chest_types = """
export type ChestStatus = 'locked' | 'available' | 'opened';
export type ChestType = 'bronze' | 'silver' | 'gold' | 'epic' | 'legendary';

export interface ChestReward {
  type: 'currency' | 'seasonXp' | 'clanXp' | 'cosmeticUnlock' | 'chest';
  amount?: number;
  cosmeticId?: string;
  name?: string;
}

export interface Chest {
  id: string;
  userId: string;
  type: ChestType;
  source: string;
  sourceId: string;
  seasonId?: string;
  status: ChestStatus;
  createdAt: string;
  openedAt?: string;
  rewardTransactionId?: string;
  rewards?: ChestReward[];
}

"""

if "export interface Chest {" not in content:
    content += chest_types

with open('src/types/index.ts', 'w') as f:
    f.write(content)

import sys

with open('src/types/index.ts', 'r') as f:
    content = f.read()

old_modal = """export interface ConquestResultModalData {
  zone: Zone;
  zoneName: string;
  durationFormatted: string;
  durationSeconds: number;
  distanceKmFormatted: string;
  xpEarned: number;
  player: UserProfile;
}"""

new_modal = """export interface ConquestResultModalData {
  zone: Zone;
  zoneName: string;
  durationFormatted: string;
  durationSeconds: number;
  distanceKmFormatted: string;
  xpEarned: number;
  player: UserProfile;
  clanWar?: {
    points: number;
    result: string;
    clanName: string;
  };
}"""

if old_modal in content:
    content = content.replace(old_modal, new_modal)
    with open('src/types/index.ts', 'w') as f:
        f.write(content)

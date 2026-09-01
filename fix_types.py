import sys

with open('src/types/index.ts', 'r') as f:
    content = f.read()

# Fix ZoneController
old_zc = """export interface ZoneController {
  id?: string;
  name: string;
  nickname?: string;
  avatar?: string;
  level: number;
  clan?: string;
  crew?: string;
}"""

new_zc = """export interface ZoneController {
  id?: string;
  name: string;
  nickname?: string;
  avatar?: string;
  level: number;
  clan?: string;
  crew?: string;
  clanId?: string;
  clanName?: string;
  clanIcon?: string;
}"""

if old_zc in content:
    content = content.replace(old_zc, new_zc)
else:
    print("WARNING: ZoneController not found as expected")

# Fix ConquestResultModalData
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
else:
    print("WARNING: ConquestResultModalData not found as expected")

with open('src/types/index.ts', 'w') as f:
    f.write(content)

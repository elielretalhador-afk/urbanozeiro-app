import sys

with open('src/types/index.ts', 'r') as f:
    content = f.read()

old_modal = """export interface ConquestResultModalData {
  zone: Zone;
  zoneName: string;
  durationFormatted: string; // e.g. "02:38"
  durationSeconds: number;
  distanceKmFormatted: string; // e.g. "1,42 km" or "150 m"
  distanceMeters: number;
  xpEarned: number; // e.g. 320
  player: UserProfile;
  trackPoints: ActivityTrackPoint[];
}"""

new_modal = """export interface ConquestResultModalData {
  zone: Zone;
  zoneName: string;
  durationFormatted: string; // e.g. "02:38"
  durationSeconds: number;
  distanceKmFormatted: string; // e.g. "1,42 km" or "150 m"
  distanceMeters: number;
  xpEarned: number; // e.g. 320
  player: UserProfile;
  trackPoints: ActivityTrackPoint[];
  clanWar?: {
    points: number;
    result: string;
    clanName: string;
  };
}"""

content = content.replace(old_modal, new_modal)

with open('src/types/index.ts', 'w') as f:
    f.write(content)

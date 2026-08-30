import re

with open('src/types/index.ts', 'r') as f:
    content = f.read()

replacement = """export interface ZoneOperation {
  operationId: string;
  zoneId: string;
  type: 'CONQUEST';
  playerId: string;
  payload: {
    controller: ZoneController;
    conquestHistoryEntry: any; // Ideally we can define this better, but `any` matches the ad-hoc usage
  };
  createdAt: number;
  syncStatus: 'pending' | 'error' | 'synced';
  retryCount: number;
}

export interface ZoneActivity {"""

content = content.replace("export interface ZoneActivity {", replacement)

# Add operationId to conquestHistory item inside Zone interface
pattern = r"conquestHistory\?: Array<\{\n\s*playerId: string;"
replacement_history = """  conquestHistory?: Array<{
    operationId?: string;
    playerId: string;"""
content = re.sub(pattern, replacement_history, content)

with open('src/types/index.ts', 'w') as f:
    f.write(content)

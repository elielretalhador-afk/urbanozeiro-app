import sys

with open('src/services/db.ts', 'r') as f:
    content = f.read()

import re

# Find conquerZoneTransaction and replace it completely
old_block = re.search(r"  async conquerZoneTransaction\(zoneId: string, operation: ZoneOperation\): Promise<Zone> \{.*?(?=\n  async queueSegmentOperation)", content, re.DOTALL)

if old_block:
    old_str = old_block.group(0)
    
    new_str = """  async conquerZoneTransaction(zoneId: string, operation: ZoneOperation): Promise<Zone> {
    const zoneRef = doc(db, 'zones', zoneId);
    return await runTransaction(db, async (transaction) => {
      const zoneDoc = await transaction.get(zoneRef);
      if (!zoneDoc.exists()) {
        throw new Error("Zona não existe no banco oficial.");
      }
      
      const currentZone = zoneDoc.data() as Zone;
      
      // We just write the operation to the history subcollection.
      // The Cloud Function will process it and update the Zone and Clan.
      const historyRef = doc(db, 'zones', zoneId, 'history', operation.operationId);
      const historyDoc = await transaction.get(historyRef);
      
      if (historyDoc.exists()) {
        return currentZone; // Already submitted
      }
      
      transaction.set(historyRef, {
        operationId: operation.operationId,
        playerId: operation.playerId,
        createdAt: operation.createdAt,
        trackPoints: operation.payload.conquestHistoryEntry?.trackPoints || [],
        payload: operation.payload
      });
      
      return currentZone;
    });
  }"""
    content = content.replace(old_str, new_str)
    
    with open('src/services/db.ts', 'w') as f:
        f.write(content)
    print("Patched conquerZoneTransaction")
else:
    print("Could not find conquerZoneTransaction block")


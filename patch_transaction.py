import re

with open('src/services/db.ts', 'r') as f:
    content = f.read()

replacement = """  async queueZoneOperation(operation: ZoneOperation): Promise<void> {
    const outbox = await loadIdb<ZoneOperation[]>(KEYS.ZONE_OUTBOX, []);
    outbox.push(operation);
    await saveIdb(KEYS.ZONE_OUTBOX, outbox);

    if (navigator.onLine) {
      this.processSyncQueue().catch(console.error);
    }
  },

  async conquerZoneTransaction(zoneId: string, operation: ZoneOperation): Promise<Zone> {
    const zoneRef = doc(db, 'zones', zoneId);
    return await runTransaction(db, async (transaction) => {
      const zoneDoc = await transaction.get(zoneRef);
      if (!zoneDoc.exists()) {
        throw new Error("Zona não existe no banco oficial.");
      }
      
      const currentZone = zoneDoc.data() as Zone;
      
      // Idempotency check
      const currentHistory = currentZone.conquestHistory || [];
      if (currentHistory.some(h => h.operationId === operation.operationId)) {
        return currentZone; // Already processed
      }

      const newEntry = operation.payload.conquestHistoryEntry;
      // Add the new entry to history
      const newHistory = [newEntry, ...currentHistory];
      
      const updatedData: Partial<Zone> = {
        conquestHistory: newHistory,
      };

      // Concurrency check: Does this operation's createdAt beat the lastConquered time?
      const lastConqueredTimestamp = currentZone.lastConquered ? new Date(currentZone.lastConquered).getTime() : 0;
      
      // If the zone is free, OR the operation is newer than the last conquer, update controller
      if (currentZone.status === 'free' || operation.createdAt >= lastConqueredTimestamp) {
        updatedData.status = 'controlled';
        updatedData.controller = operation.payload.controller;
        updatedData.dominance = 100;
        updatedData.activeDispute = null;
        updatedData.contested = false;
        
        // Flattened fields for easy access in views (if they are used)
        if (operation.payload.controller) {
          updatedData.controllerName = operation.payload.controller.name;
          updatedData.controllerNickname = operation.payload.controller.nickname;
          updatedData.controllerAvatar = operation.payload.controller.avatar;
          updatedData.controllerLevel = operation.payload.controller.level;
          updatedData.controllerCrew = operation.payload.controller.crew;
        }
        updatedData.lastConquered = new Date(operation.createdAt).toISOString();
      }

      // Merge manually, respecting rules
      const mergedZone = { ...currentZone, ...updatedData };
      
      transaction.update(zoneRef, updatedData);
      return mergedZone;
    });
  },"""

pattern = re.compile(r'  async conquerZoneTransaction\(zoneId: string, conquestData: Partial<Zone>\): Promise<Zone> \{.*?    \}\);\n  \},', re.DOTALL)
content = pattern.sub(replacement, content)

with open('src/services/db.ts', 'w') as f:
    f.write(content)

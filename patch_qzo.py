import re
with open('src/services/db.ts', 'r') as f:
    c = f.read()

c = re.sub(
    r"  async queueZoneOperation\(operation: ZoneOperation\): Promise<void> \{\n    const outbox = await loadIdb<ZoneOperation\[\]>\(KEYS\.ZONE_OUTBOX, \[\]\);\n    outbox\.push\(operation\);\n    await saveIdb\(KEYS\.ZONE_OUTBOX, outbox\);\n    if \(navigator\.onLine\) \{\n      this\.processSyncQueue\(\)\.catch\(console\.error\);\n    \}\n  \},",
    """  async queueZoneOperation(operation: ZoneOperation): Promise<void> {
    const release = await idbMutex.acquire();
    try {
      const outbox = await loadIdb<ZoneOperation[]>(KEYS.ZONE_OUTBOX, []);
      outbox.push(operation);
      await saveIdb(KEYS.ZONE_OUTBOX, outbox);
    } finally {
      release();
    }
    if (navigator.onLine) {
      this.processSyncQueue().catch(console.error);
    }
  },""", c)
with open('src/services/db.ts', 'w') as f:
    f.write(c)

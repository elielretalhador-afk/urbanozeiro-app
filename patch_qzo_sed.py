with open('src/services/db.ts', 'r') as f:
    c = f.read()

old = """  async queueZoneOperation(operation: ZoneOperation): Promise<void> {
    const outbox = await loadIdb<ZoneOperation[]>(KEYS.ZONE_OUTBOX, []);
    outbox.push(operation);
    await saveIdb(KEYS.ZONE_OUTBOX, outbox);

    if (navigator.onLine) {"""
new = """  async queueZoneOperation(operation: ZoneOperation): Promise<void> {
    const release = await idbMutex.acquire();
    try {
      const outbox = await loadIdb<ZoneOperation[]>(KEYS.ZONE_OUTBOX, []);
      outbox.push(operation);
      await saveIdb(KEYS.ZONE_OUTBOX, outbox);
    } finally {
      release();
    }

    if (navigator.onLine) {"""
c = c.replace(old, new)
with open('src/services/db.ts', 'w') as f:
    f.write(c)

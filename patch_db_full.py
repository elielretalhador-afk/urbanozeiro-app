with open('src/services/db.ts', 'r') as f:
    c = f.read()

# Fix duplicates of AsyncMutex if any
import re
c = re.sub(r'class AsyncMutex \{.*?const idbMutex = new AsyncMutex\(\);\n', '', c, flags=re.DOTALL)

mutex_code = """
class AsyncMutex {
  private promise: Promise<void> = Promise.resolve();
  async acquire(): Promise<() => void> {
    let release: () => void = () => {};
    const next = new Promise<void>(resolve => release = resolve);
    const wait = this.promise;
    this.promise = wait.then(() => next);
    await wait;
    return release;
  }
}
const idbMutex = new AsyncMutex();
"""
c = c.replace("export const DatabaseService = {", mutex_code + "\nexport const DatabaseService = {")

# Objective 4: queueZoneOperation
qzo_old = """  async queueZoneOperation(operation: ZoneOperation): Promise<void> {
    const outbox = await loadIdb<ZoneOperation[]>(KEYS.ZONE_OUTBOX, []);
    outbox.push(operation);
    await saveIdb(KEYS.ZONE_OUTBOX, outbox);
    if (navigator.onLine) {
      this.processSyncQueue().catch(console.error);
    }
  },"""
qzo_new = """  async queueZoneOperation(operation: ZoneOperation): Promise<void> {
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
  },"""
c = c.replace(qzo_old, qzo_new)

# Objective 4: saveSession
ss_old = """  async saveSession(session: ActivitySession): Promise<void> {
    const sessions = await loadIdb<ActivitySession[]>(KEYS.SESSIONS, INITIAL_SESSION_HISTORY);
    // Evitar duplicatas caso a sessão já exista (idempotência)
    if (!sessions.some(s => s.id === session.id)) {
      sessions.unshift(session);
      await saveIdb(KEYS.SESSIONS, sessions);
    }
  },"""
ss_new = """  async saveSession(session: ActivitySession): Promise<void> {
    const release = await idbMutex.acquire();
    try {
      const sessions = await loadIdb<ActivitySession[]>(KEYS.SESSIONS, INITIAL_SESSION_HISTORY);
      if (!sessions.some(s => s.id === session.id)) {
        sessions.unshift(session);
        await saveIdb(KEYS.SESSIONS, sessions);
      }
    } finally {
      release();
    }
  },"""
c = c.replace(ss_old, ss_new)

# Objective 4: saveActivity
sa_old = """  async saveActivity(activity: PlayerPublicActivity): Promise<void> {
    const activities = await loadIdb<PlayerPublicActivity[]>(KEYS.ACTIVITIES, INITIAL_ACTIVITIES as any);
    if (!activities.some(a => a.id === activity.id)) {
      activities.unshift(activity);
      await saveIdb(KEYS.ACTIVITIES, activities);
    }
  }"""
sa_new = """  async saveActivity(activity: PlayerPublicActivity): Promise<void> {
    const release = await idbMutex.acquire();
    try {
      const activities = await loadIdb<PlayerPublicActivity[]>(KEYS.ACTIVITIES, INITIAL_ACTIVITIES as any);
      if (!activities.some(a => a.id === activity.id)) {
        activities.unshift(activity);
        await saveIdb(KEYS.ACTIVITIES, activities);
      }
    } finally {
      release();
    }
  }"""
c = c.replace(sa_old, sa_new)

# Objective 1: trackPoints separation
trackpoints_old = """      const newEntry = operation.payload.conquestHistoryEntry;
      // Add the new entry to history
      const newHistory = [newEntry, ...currentHistory];
      
      const updatedData: Partial<Zone> = {
        conquestHistory: newHistory,
      };"""
trackpoints_new = """      const newEntry = { ...operation.payload.conquestHistoryEntry };
      const trackPoints = newEntry.trackPoints || [];
      delete newEntry.trackPoints;

      // Add the new entry to history
      const newHistory = [newEntry, ...currentHistory];
      
      const updatedData: Partial<Zone> = {
        conquestHistory: newHistory,
      };"""
c = c.replace(trackpoints_old, trackpoints_new)

transaction_old = """      // Merge manually, respecting rules
      const mergedZone = { ...currentZone, ...updatedData };
      
      transaction.update(zoneRef, updatedData);
      return mergedZone;
    });"""
transaction_new = """      // Merge manually, respecting rules
      const mergedZone = { ...currentZone, ...updatedData };
      
      transaction.update(zoneRef, updatedData);

      // Save the trackpoints to a subcollection document for anti-cheat audit
      const proofRef = doc(db, 'zones', zoneId, 'history', operation.operationId);
      transaction.set(proofRef, {
        operationId: operation.operationId,
        playerId: operation.playerId,
        createdAt: operation.createdAt,
        trackPoints: trackPoints
      });

      return mergedZone;
    });"""
c = c.replace(transaction_old, transaction_new)

# Sync Queue locks & logic
c = re.sub(
    r"      if \(successfulSessionIds\.size > 0 \|\| failedSessionIds\.size > 0\) \{[\s\S]*?await saveIdb\(KEYS\.SESSIONS, updatedSessions\);\n      \}",
    """      if (successfulSessionIds.size > 0 || failedSessionIds.size > 0) {
        const release = await idbMutex.acquire();
        try {
          const currentSessions = await loadIdb<ActivitySession[]>(KEYS.SESSIONS, []);
          const updatedSessions = currentSessions.map(s => {
            if (successfulSessionIds.has(s.id)) return { ...s, syncStatus: 'synced' as const };
            if (failedSessionIds.has(s.id)) return { ...s, syncStatus: 'error' as const };
            return s;
          });
          await saveIdb(KEYS.SESSIONS, updatedSessions);
        } finally {
          release();
        }
      }""",
    c
)

c = re.sub(
    r"      if \(successfulActivityIds\.size > 0 \|\| failedActivityIds\.size > 0\) \{[\s\S]*?await saveIdb\(KEYS\.ACTIVITIES, updatedActivities\);\n      \}",
    """      if (successfulActivityIds.size > 0 || failedActivityIds.size > 0) {
        const release = await idbMutex.acquire();
        try {
          const currentActivities = await loadIdb<PlayerPublicActivity[]>(KEYS.ACTIVITIES, []);
          const updatedActivities = currentActivities.map(a => {
            if (successfulActivityIds.has(a.id)) return { ...a, syncStatus: 'synced' as const };
            if (failedActivityIds.has(a.id)) return { ...a, syncStatus: 'error' as const };
            return a;
          });
          await saveIdb(KEYS.ACTIVITIES, updatedActivities);
        } finally {
          release();
        }
      }""",
    c
)

# Objective 3: Remove synced zones from outbox
c = re.sub(
    r"      if \(successfulZoneIds\.size > 0 \|\| failedZoneIds\.size > 0\) \{[\s\S]*?await saveIdb\(KEYS\.ZONE_OUTBOX, updatedZones\);\n      \}",
    """      if (successfulZoneIds.size > 0 || failedZoneIds.size > 0) {
        const release = await idbMutex.acquire();
        try {
          const currentZones = await loadIdb<ZoneOperation[]>(KEYS.ZONE_OUTBOX, []);
          const updatedZones = currentZones
            .filter(z => !successfulZoneIds.has(z.operationId))
            .map(z => {
              if (failedZoneIds.has(z.operationId)) return { ...z, syncStatus: 'error' as const, retryCount: (z.retryCount || 0) + 1 };
              return z;
            });
          await saveIdb(KEYS.ZONE_OUTBOX, updatedZones);
        } finally {
          release();
        }
      }""",
    c
)


with open('src/services/db.ts', 'w') as f:
    f.write(c)


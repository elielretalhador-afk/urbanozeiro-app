import re

with open('src/services/db.ts', 'r') as f:
    content = f.read()

replacement = """  async processSyncQueue(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Dispositivo offline: Sincronização em nuvem adiada na fila.');
      return;
    }

    if (isSyncing) {
      console.log('[SyncQueue] Sincronização já em andamento. Ignorando nova chamada (Mutex ativo).');
      return;
    }
    isSyncing = true;

    try {
      const initialSessions = await loadIdb<ActivitySession[]>(KEYS.SESSIONS, []);
      const initialActivities = await loadIdb<PlayerPublicActivity[]>(KEYS.ACTIVITIES, []);
      const initialZoneOutbox = await loadIdb<ZoneOperation[]>(KEYS.ZONE_OUTBOX, []);

      const pendingSessions = initialSessions.filter(s => s.syncStatus === 'pending' || s.syncStatus === 'error');
      const pendingActivities = initialActivities.filter(a => a.syncStatus === 'pending' || a.syncStatus === 'error');
      const pendingZones = initialZoneOutbox.filter(z => z.syncStatus === 'pending' || z.syncStatus === 'error');

      if (pendingSessions.length === 0 && pendingActivities.length === 0 && pendingZones.length === 0) {
        return; // Fila vazia
      }

      console.log(`[SyncQueue] Enviando ${pendingSessions.length} sessões, ${pendingActivities.length} atividades e ${pendingZones.length} zonas para o Firestore...`);

      const successfulSessionIds = new Set<string>();
      const failedSessionIds = new Set<string>();
      const successfulActivityIds = new Set<string>();
      const failedActivityIds = new Set<string>();
      const successfulZoneIds = new Set<string>();
      const failedZoneIds = new Set<string>();

      for (const s of pendingSessions) {
        try {
          const sessionRef = doc(db, 'sessions', s.id);
          await setDoc(sessionRef, s);
          successfulSessionIds.add(s.id);
        } catch (error) {
          console.error(`[SyncQueue] Falha ao enviar sessão ${s.id}:`, error);
          failedSessionIds.add(s.id);
        }
      }

      for (const a of pendingActivities) {
        try {
          const activityRef = doc(db, 'activities', a.id);
          await setDoc(activityRef, a);
          successfulActivityIds.add(a.id);
        } catch (error) {
          console.error(`[SyncQueue] Falha ao enviar atividade ${a.id}:`, error);
          failedActivityIds.add(a.id);
        }
      }

      for (const op of pendingZones) {
        try {
          // Utiliza a transaction para processar a conquista garantindo regras de timeline e idempotência
          await this.conquerZoneTransaction(op.zoneId, op);
          successfulZoneIds.add(op.operationId);
        } catch (error) {
          console.error(`[SyncQueue] Falha ao enviar zona ${op.operationId}:`, error);
          failedZoneIds.add(op.operationId);
        }
      }

      // Re-load and update state to prevent stale writes
      if (successfulSessionIds.size > 0 || failedSessionIds.size > 0) {
        const currentSessions = await loadIdb<ActivitySession[]>(KEYS.SESSIONS, []);
        const updatedSessions = currentSessions.map(s => {
          if (successfulSessionIds.has(s.id)) return { ...s, syncStatus: 'synced' as const };
          if (failedSessionIds.has(s.id)) return { ...s, syncStatus: 'error' as const };
          return s;
        });
        await saveIdb(KEYS.SESSIONS, updatedSessions);
      }

      if (successfulActivityIds.size > 0 || failedActivityIds.size > 0) {
        const currentActivities = await loadIdb<PlayerPublicActivity[]>(KEYS.ACTIVITIES, []);
        const updatedActivities = currentActivities.map(a => {
          if (successfulActivityIds.has(a.id)) return { ...a, syncStatus: 'synced' as const };
          if (failedActivityIds.has(a.id)) return { ...a, syncStatus: 'error' as const };
          return s; // Wait, that's a bug in original code too? It should be `return a;`
        });
        await saveIdb(KEYS.ACTIVITIES, updatedActivities);
      }

      if (successfulZoneIds.size > 0 || failedZoneIds.size > 0) {
        const currentZones = await loadIdb<ZoneOperation[]>(KEYS.ZONE_OUTBOX, []);
        const updatedZones = currentZones.map(z => {
          if (successfulZoneIds.has(z.operationId)) return { ...z, syncStatus: 'synced' as const };
          if (failedZoneIds.has(z.operationId)) return { ...z, syncStatus: 'error' as const, retryCount: (z.retryCount || 0) + 1 };
          return z;
        });
        await saveIdb(KEYS.ZONE_OUTBOX, updatedZones);
      }

      // Invalidate zone cache so the next request pulls the consolidated data from Firestore
      if (successfulZoneIds.size > 0) {
        this.invalidateZonesCache();
      }

    } catch (error) {
      console.error('[SyncQueue] Erro crítico no loop de sincronização:', error);
    } finally {
      isSyncing = false;
    }
  },"""

pattern = re.compile(r'  async processSyncQueue\(\): Promise<void> \{.*?    \}\n  \},', re.DOTALL)
content = pattern.sub(replacement, content)
content = content.replace("return s; // Wait, that's a bug in original code too? It should be `return a;`", "return a;")

with open('src/services/db.ts', 'w') as f:
    f.write(content)

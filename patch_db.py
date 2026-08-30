import re

with open('src/services/db.ts', 'r') as f:
    content = f.read()

# Introduce isSyncing above DatabaseService
if "let isSyncing =" not in content:
    content = content.replace("export const DatabaseService = {", "let isSyncing = false;\n\nexport const DatabaseService = {")

# Replace processSyncQueue
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
      const initialSessions = await loadIdb<ActivitySession[]>(KEYS.SESSIONS, INITIAL_SESSION_HISTORY);
      const initialActivities = await loadIdb<PlayerPublicActivity[]>(KEYS.ACTIVITIES, INITIAL_ACTIVITIES as any);

      const pendingSessions = initialSessions.filter(s => s.syncStatus === 'pending' || s.syncStatus === 'error');
      const pendingActivities = initialActivities.filter(a => a.syncStatus === 'pending' || a.syncStatus === 'error');

      if (pendingSessions.length === 0 && pendingActivities.length === 0) {
        return; // Fila vazia
      }

      console.log(`[SyncQueue] Enviando ${pendingSessions.length} sessões e ${pendingActivities.length} atividades para o Firestore...`);

      const successfulSessionIds = new Set<string>();
      const failedSessionIds = new Set<string>();
      const successfulActivityIds = new Set<string>();
      const failedActivityIds = new Set<string>();

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

      // Re-lê o IndexedDB antes de salvar para evitar STALE WRITE
      const currentSessions = await loadIdb<ActivitySession[]>(KEYS.SESSIONS, INITIAL_SESSION_HISTORY);
      const currentActivities = await loadIdb<PlayerPublicActivity[]>(KEYS.ACTIVITIES, INITIAL_ACTIVITIES as any);
      
      let sessionsUpdated = false;
      let activitiesUpdated = false;

      for (const s of currentSessions) {
        if (successfulSessionIds.has(s.id)) {
          s.syncStatus = 'synced';
          sessionsUpdated = true;
        } else if (failedSessionIds.has(s.id)) {
          s.syncStatus = 'error';
          sessionsUpdated = true;
        }
      }

      for (const a of currentActivities) {
        if (successfulActivityIds.has(a.id)) {
          a.syncStatus = 'synced';
          activitiesUpdated = true;
        } else if (failedActivityIds.has(a.id)) {
          a.syncStatus = 'error';
          activitiesUpdated = true;
        }
      }

      if (sessionsUpdated) await saveIdb(KEYS.SESSIONS, currentSessions);
      if (activitiesUpdated) await saveIdb(KEYS.ACTIVITIES, currentActivities);

      console.log('[SyncQueue] Ciclo de sincronização concluído de forma segura!');
    } catch (e) {
      console.error('[SyncQueue] Erro crítico no processo de sincronização:', e);
    } finally {
      isSyncing = false;
    }
  },"""

# Use regex to match processSyncQueue
pattern = re.compile(r'  async processSyncQueue\(\): Promise<void> \{.*?    \} catch \(e\) \{\s*console\.error\(\'\[SyncQueue\] Erro crítico no processo de sincronização:\', e\);\s*\}\s*\},', re.DOTALL)
content = pattern.sub(replacement, content)

with open('src/services/db.ts', 'w') as f:
    f.write(content)


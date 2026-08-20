const fs = require('fs');
let content = fs.readFileSync('src/services/db.ts', 'utf8');

const syncMethods = `  // ============================================================================
  // SINCRONIZAÇÃO OFFLINE-FIRST (FILA DE ATIVIDADES)
  // ============================================================================
  async queueSessionForSync(session: ActivitySession, activity: PlayerPublicActivity): Promise<void> {
    // 1. Marca como pendente
    session.syncStatus = 'pending';
    activity.syncStatus = 'pending';
    
    // 2. Salva localmente (Garantia Offline)
    await this.saveSession(session);
    await this.saveActivity(activity);

    // 3. Tenta sincronizar imediatamente se houver rede
    if (navigator.onLine) {
      this.processSyncQueue().catch(console.error);
    }
  },

  async processSyncQueue(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Dispositivo offline: Sincronização em nuvem adiada na fila.');
      return;
    }

    try {
      const sessions = await loadIdb<ActivitySession[]>(KEYS.SESSIONS, INITIAL_SESSION_HISTORY);
      const activities = await loadIdb<PlayerPublicActivity[]>(KEYS.ACTIVITIES, INITIAL_ACTIVITIES as any);

      let sessionsUpdated = false;
      let activitiesUpdated = false;

      // Identifica itens na fila
      const pendingSessions = sessions.filter(s => s.syncStatus === 'pending');
      const pendingActivities = activities.filter(a => a.syncStatus === 'pending');

      if (pendingSessions.length === 0 && pendingActivities.length === 0) {
        return; // Fila vazia
      }

      console.log(\`[SyncQueue] Enviando \${pendingSessions.length} sessões e \${pendingActivities.length} atividades para o Firestore...\`);

      // 4. Simula o Request ao Backend/Firestore
      // Evita duplicatas pela estrutura do backend (idempotência pelo ID)
      await delay(1200); 

      // 5. Confirmação de Sucesso
      for (const s of pendingSessions) {
        s.syncStatus = 'synced';
        sessionsUpdated = true;
      }
      for (const a of pendingActivities) {
        a.syncStatus = 'synced';
        activitiesUpdated = true;
      }

      // 6. Atualiza estado local removendo da fila de pendentes
      if (sessionsUpdated) await saveIdb(KEYS.SESSIONS, sessions);
      if (activitiesUpdated) await saveIdb(KEYS.ACTIVITIES, activities);

      console.log('[SyncQueue] Sincronização concluída com sucesso!');
    } catch (e) {
      console.error('[SyncQueue] Falha na rede, mantendo atividades na fila local:', e);
    }
  },
  
  // Persistência de Jogador`;

content = content.replace(/\/\/ Persistência de Jogador/, syncMethods);
fs.writeFileSync('src/services/db.ts', content);

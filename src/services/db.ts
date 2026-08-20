import { get as idbGet, set as idbSet } from 'idb-keyval';
import { CacheManager } from './cache';
import { PaginatedResult } from '../types';
import { 
  UserProfile, 
  Zone, 
  ActivitySession, 
  AppNotification, 
  Achievement,
  LiveChallenge,
  PlayerSettings,
  TutorialState,
  Clan,
  PlayerPublicActivity
} from '../types';
import { 
  CURRENT_USER, 
  INITIAL_ZONES, 
  INITIAL_SESSION_HISTORY, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ACHIEVEMENTS,
  INITIAL_CLANS,
  MOCK_ROUTES,
  MOCK_CHALLENGES,
  INITIAL_DIRECT_CHALLENGES,
  INITIAL_EVENTS
} from '../data/mockData';
import { DEFAULT_PLAYER_SETTINGS } from '../data/settingsData';
import { INITIAL_ACTIVITIES } from '../data/activityData';

// Constantes de chaves do LocalStorage
const KEYS = {
  USER: 'urb_db_user',
  ZONES: 'urb_db_zones',
  SESSIONS: 'urb_db_sessions',
  NOTIFICATIONS: 'urb_db_notifications',
  ACHIEVEMENTS: 'urb_db_achievements',
  SETTINGS: 'urb_db_settings',
  TUTORIAL: 'urbanozeiro_tutorial',
  ACTIVITIES: 'urb_db_activities',
  CLANS: 'urb_db_clans',
  ROUTES: 'urb_db_routes',
  CHALLENGES: 'urb_db_challenges',
  DIRECT_CHALLENGES: 'urb_db_direct_challenges',
  EVENTS: 'urb_db_events'
};

// Simulador de delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


const loadLocal = <T>(key: string, mockFallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return mockFallback;
};

const saveLocal = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
};

const loadIdb = async <T>(key: string, mockFallback: T): Promise<T> => {
  try {
    const data = await idbGet<T>(key);
    if (data) return data;
  } catch (e) {
    console.error(e);
  }
  return mockFallback;
};

const saveIdb = async <T>(key: string, data: T): Promise<void> => {
  try {
    await idbSet(key, data);
  } catch (e) {
    console.error(e);
  }
};


export const DatabaseService = {
  // Inicialização pesada / Sincronização inicial
  async initializeApp(): Promise<{
    user: UserProfile;
    zones: Zone[];
    sessions: ActivitySession[];
    notifications: AppNotification[];
    achievements: Achievement[];
    settings: PlayerSettings;
    tutorial: TutorialState;
    activities: PlayerPublicActivity[];
    routes: any[];
    challenges: any[];
    directChallenges: any[];
    events: any[];
  }> {
    // Simula tempo de requisição ao Backend
    await delay(600);
    
    // Verifica conexão simulada (preparação para offline)
    if (!navigator.onLine) {
      console.warn("Dispositivo offline, carregando cache local.");
    }

    return {
      user: loadLocal<UserProfile>(KEYS.USER, CURRENT_USER),
      zones: await loadIdb<Zone[]>(KEYS.ZONES, INITIAL_ZONES),
      sessions: await loadIdb<ActivitySession[]>(KEYS.SESSIONS, INITIAL_SESSION_HISTORY),
      notifications: loadLocal<AppNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
      achievements: loadLocal<Achievement[]>(KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS),
      settings: loadLocal<PlayerSettings>(KEYS.SETTINGS, DEFAULT_PLAYER_SETTINGS),
      tutorial: loadLocal<TutorialState>(KEYS.TUTORIAL, { isCompleted: false, isSkipped: false, currentStep: 0 }),
      activities: await loadIdb<PlayerPublicActivity[]>(KEYS.ACTIVITIES, INITIAL_ACTIVITIES as any),
      routes: await loadIdb<any[]>(KEYS.ROUTES, MOCK_ROUTES),
      challenges: await loadIdb<any[]>(KEYS.CHALLENGES, MOCK_CHALLENGES),
      directChallenges: await loadIdb<any[]>(KEYS.DIRECT_CHALLENGES, INITIAL_DIRECT_CHALLENGES),
      events: await loadIdb<any[]>(KEYS.EVENTS, INITIAL_EVENTS)
    };
  },

    // ============================================================================
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

      console.log(`[SyncQueue] Enviando ${pendingSessions.length} sessões e ${pendingActivities.length} atividades para o Firestore...`);

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
  
  // Persistência de Jogador (XP, Nível, Perfil)
  async saveUser(user: UserProfile): Promise<void> {
    saveLocal(KEYS.USER, user);
  },

  // Persistência de Zonas (Concorrência simulada: lê o atual, aplica a mudança, salva)
  

  // ============================================================================
  // OTIMIZAÇÕES ARQUITETURAIS PARA FIRESTORE (Paginação e Caching Geográfico)
  // ============================================================================

  /**
   * Obtém zonas por viewport do mapa (simulando Geohash query).
   * Utiliza cache agressivo para evitar releituras desnecessárias ao arrastar o mapa.
   */
  async getZonesInRegion(bounds: any): Promise<Zone[]> {
    // Simulando leitura pesada
    await delay(300);
    
    // Na vida real: query Firestore onde geo_hash está dentro dos bounds.
    // Aqui usamos o mock inteiro como base, filtrando apenas as visíveis se a estrutura suportar
    // Para simplificar a estrutura mock, nós tentamos usar cache global.
    
    const cacheKey = 'urb_zones_all_cached';
    let cachedZones = CacheManager.get<Zone[]>(cacheKey);
    
    if (!cachedZones) {
      cachedZones = await loadIdb<Zone[]>(KEYS.ZONES, INITIAL_ZONES);
      // Cache válido por 10 minutos (pois são zonas base, que só mudam por ação explícita)
      CacheManager.set(cacheKey, cachedZones); 
    }
    
    // Simula filtragem por bounding box (Neste mock, apenas retorna todas as do mock que couberem)
    // Em produção, isso reduz de milhares de leituras para apenas 10-20.
    return cachedZones;
  },

  /**
   * Invalida o cache local de zonas
   */
  invalidateZonesCache(): void {
    CacheManager.invalidate('urb_zones_all_cached');
  },

  /**
   * Obtém o histórico de sessões com paginação
   */
  async getSessionsPaginated(userId: string, pageSize: number = 10, lastDocId?: string): Promise<PaginatedResult<ActivitySession>> {
    await delay(200);
    
    const allSessions = await loadIdb<ActivitySession[]>(KEYS.SESSIONS, INITIAL_SESSION_HISTORY);
    // Filtrar pelo usuário atual (mock)
    const userSessions = allSessions.filter(s => s.playerId === userId || s.playerId === 'usr_me');
    userSessions.sort((a, b) => (b.startedAt ? new Date(b.startedAt).getTime() : 0) - (a.startedAt ? new Date(a.startedAt).getTime() : 0));
    
    let startIndex = 0;
    if (lastDocId) {
      const lastIndex = userSessions.findIndex(s => s.id === lastDocId);
      if (lastIndex !== -1) {
        startIndex = lastIndex + 1;
      }
    }
    
    const paginatedSlice = userSessions.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < userSessions.length;
    
    return {
      data: paginatedSlice,
      lastDocId: paginatedSlice.length > 0 ? paginatedSlice[paginatedSlice.length - 1].id : undefined,
      hasMore
    };
  },

  async updateZoneList(zones: Zone[]): Promise<void> {
    await saveIdb(KEYS.ZONES, zones);
    this.invalidateZonesCache();
  },
  async updateZone(zoneId: string, updates: Partial<Zone>): Promise<Zone> {
    const zones = await loadIdb<Zone[]>(KEYS.ZONES, INITIAL_ZONES);
    const index = zones.findIndex(z => z.id === zoneId);
    if (index === -1) throw new Error("Zona não encontrada.");
    
    // Simula transação atômica
    const updatedZone = { ...zones[index], ...updates };
    zones[index] = updatedZone;
    await saveIdb(KEYS.ZONES, zones);
    this.invalidateZonesCache(); // Evita stale data
    
    return updatedZone;
  },

  // Persistência de Sessões (Histórico)
  async saveSession(session: ActivitySession): Promise<void> {
    const sessions = await loadIdb<ActivitySession[]>(KEYS.SESSIONS, INITIAL_SESSION_HISTORY);
    // Evitar duplicatas caso a sessão já exista (idempotência)
    if (!sessions.some(s => s.id === session.id)) {
      sessions.unshift(session);
      await saveIdb(KEYS.SESSIONS, sessions);
    }
  },

  // Notificações
  async saveNotifications(notifications: AppNotification[]): Promise<void> {
    saveLocal(KEYS.NOTIFICATIONS, notifications);
  },

  // Conquistas
  async saveAchievements(achievements: Achievement[]): Promise<void> {
    saveLocal(KEYS.ACHIEVEMENTS, achievements);
  },

  // Configurações
  async saveSettings(settings: PlayerSettings): Promise<void> {
    saveLocal(KEYS.SETTINGS, settings);
  },

  async updateActivitiesList(activities: PlayerPublicActivity[]): Promise<void> {
    await saveIdb(KEYS.ACTIVITIES, activities);
  },
  // Atividades (Feed)
  async saveActivity(activity: PlayerPublicActivity): Promise<void> {
    const activities = await loadIdb<PlayerPublicActivity[]>(KEYS.ACTIVITIES, INITIAL_ACTIVITIES as any);
    if (!activities.some(a => a.id === activity.id)) {
      activities.unshift(activity);
      await saveIdb(KEYS.ACTIVITIES, activities);
    }
  }
};

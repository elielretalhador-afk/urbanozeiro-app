// urb_cache_manager.ts
// Preparação para minimizar leituras no Firestore.
// Este serviço lida com armazenamento em memória (e opcionalmente SessionStorage)
// para evitar repetição de consultas a dados que não mudam frequentemente.

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export const CacheManager = {
  // Tempo padrão de vida do cache (em ms). Ex: 5 minutos
  DEFAULT_TTL: 5 * 60 * 1000,
  
  _memoryCache: new Map<string, CacheEntry<any>>(),

  /**
   * Obtém um dado do cache se ele existir e ainda for válido.
   */
  get<T>(key: string, ttl?: number): T | null {
    if (ttl === undefined) ttl = CacheManager.DEFAULT_TTL;
    const entry = CacheManager._memoryCache.get(key);
    if (!entry) return null;

    const isExpired = (Date.now() - entry.timestamp) > ttl;
    if (isExpired) {
      CacheManager._memoryCache.delete(key);
      return null;
    }

    return entry.data;
  },

  /**
   * Salva um dado no cache local de memória.
   */
  set<T>(key: string, data: T): void {
    CacheManager._memoryCache.set(key, {
      data,
      timestamp: Date.now()
    });
  },

  /**
   * Invalida (deleta) uma chave específica do cache (útil após mutações).
   */
  invalidate(key: string): void {
    CacheManager._memoryCache.delete(key);
  },

  /**
   * Limpa todo o cache (útil no logout).
   */
  clear(): void {
    CacheManager._memoryCache.clear();
  }
};

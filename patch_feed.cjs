const fs = require('fs');
let content = fs.readFileSync('src/services/feed.ts', 'utf8');

// Adiciona import do tipo PaginatedResult
content = content.replace(
  /import \{ (.*) \} from '\.\.\/types';/,
  `import { $1, PaginatedResult } from '../types';`
);

// Adiciona métodos de paginação
const paginatedMethods = `

  // ============================================================================
  // MÉTODOS OTIMIZADOS E PAGINADOS (Preparação para Firestore)
  // ============================================================================
  
  /**
   * Obtém o feed principal com paginação
   */
  async getFeedPaginated(
    currentUserId: string, 
    followingIds: string[], 
    pageSize: number = 10, 
    lastDocId?: string
  ): Promise<PaginatedResult<Activity>> {
    // Simulando latência de rede
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let allActivities = this.getFeed(currentUserId, followingIds);
    
    // Simula ordenação do Firestore por 'createdAt' DESC
    allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    let startIndex = 0;
    if (lastDocId) {
      const lastIndex = allActivities.findIndex(act => act.id === lastDocId);
      if (lastIndex !== -1) {
        startIndex = lastIndex + 1;
      }
    }
    
    const paginatedSlice = allActivities.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < allActivities.length;
    
    return {
      data: paginatedSlice,
      lastDocId: paginatedSlice.length > 0 ? paginatedSlice[paginatedSlice.length - 1].id : undefined,
      hasMore
    };
  },
  
  /**
   * Obtém feed de quem o usuário segue, com paginação
   */
  async getFollowingFeedPaginated(
    currentUserId: string, 
    followingIds: string[], 
    pageSize: number = 10, 
    lastDocId?: string
  ): Promise<PaginatedResult<Activity>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let allActivities = this.getFollowingFeed(currentUserId, followingIds);
    allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    let startIndex = 0;
    if (lastDocId) {
      const lastIndex = allActivities.findIndex(act => act.id === lastDocId);
      if (lastIndex !== -1) {
        startIndex = lastIndex + 1;
      }
    }
    
    const paginatedSlice = allActivities.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < allActivities.length;
    
    return {
      data: paginatedSlice,
      lastDocId: paginatedSlice.length > 0 ? paginatedSlice[paginatedSlice.length - 1].id : undefined,
      hasMore
    };
  },
`;

content = content.replace(
  /seedMockActivitiesIfEmpty/,
  `${paginatedMethods}\n  seedMockActivitiesIfEmpty`
);

fs.writeFileSync('src/services/feed.ts', content);
console.log('Patched feed.ts');

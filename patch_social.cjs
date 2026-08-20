const fs = require('fs');
let content = fs.readFileSync('src/services/social.ts', 'utf8');

// Adiciona import
content = content.replace(
  /import \{ SocialPlayer, RankPlayer \} from '\.\.\/types';/,
  `import { SocialPlayer, RankPlayer, PaginatedResult } from '../types';`
);

const paginationMethods = `

  // ============================================================================
  // OTIMIZAÇÕES ARQUITETURAIS PARA FIRESTORE (Paginação e Redução de Leituras)
  // ============================================================================
  
  /**
   * Obtém a lista de jogadores de forma paginada para evitar sobrecarga de memória
   * e alto custo de leitura no banco.
   */
  async getPlayersPaginated(currentUserId: string, pageSize: number = 10, lastDocId?: string): Promise<PaginatedResult<SocialPlayer>> {
    // Simula network
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Obteria apenas um chunk do Firestore na vida real.
    const allPlayers = await this.getAllPlayers(currentUserId);
    
    // Simula ordenação
    allPlayers.sort((a, b) => b.level - a.level);
    
    let startIndex = 0;
    if (lastDocId) {
      const lastIndex = allPlayers.findIndex(p => p.id === lastDocId);
      if (lastIndex !== -1) {
        startIndex = lastIndex + 1;
      }
    }
    
    const paginatedSlice = allPlayers.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < allPlayers.length;
    
    return {
      data: paginatedSlice,
      lastDocId: paginatedSlice.length > 0 ? paginatedSlice[paginatedSlice.length - 1].id : undefined,
      hasMore
    };
  },

  /**
   * Pega apenas a contagem total de jogadores sem baixar os documentos
   * (No Firestore, usaria "getCountFromServer" para não gastar leituras de doc)
   */
  async getPlayersCount(): Promise<number> {
    return 15; // Mock
  },
`;

content = content.replace(
  /async getAllPlayers/,
  `${paginationMethods}\n  async getAllPlayers`
);

fs.writeFileSync('src/services/social.ts', content);
console.log('Patched social.ts');

import { SocialPlayer, RankPlayer, PaginatedResult } from '../types';

const FOLLOWS_DB_KEY = 'urbanozeiro_social_follows';

export interface FollowRecord {
  followerId: string;
  followingId: string;
  createdAt: number;
}

export const SocialService = {
  getFollowsDB(): FollowRecord[] {
    try {
      const data = localStorage.getItem(FOLLOWS_DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveFollowsDB(db: FollowRecord[]) {
    localStorage.setItem(FOLLOWS_DB_KEY, JSON.stringify(db));
  },

  // Generates a determinist public profile based on auth DB
  generateSocialPlayer(uid: string, username: string, currentUserId: string): SocialPlayer {
    const numHash = uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 123;
    const level = (numHash % 30) + 1;
    const xp = level * 1000 + (numHash % 1000);
    
    const follows = this.getFollowsDB();
    const followersCount = follows.filter(f => f.followingId === uid).length;
    const followingCount = follows.filter(f => f.followerId === uid).length;
    const isFollowing = follows.some(f => f.followerId === currentUserId && f.followingId === uid);

    return {
      id: uid,
      authId: uid,
      name: username,
      nickname: username.toLowerCase().replace(/\s+/g, '_'),
      tag: `#${(numHash % 1000).toString().padStart(3, '0')}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
      level,
      xp,
      status: 'ONLINE',
      followersCount,
      followingCount,
      isFollowing,
      totalKm: (numHash % 500) + 10,
      achievementsCount: (numHash % 50) + 5,
      zonesControlled: (numHash % 5),
    };
  },

  

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

  async getAllPlayers(currentUserId: string): Promise<SocialPlayer[]> {
    const authDbStr = localStorage.getItem('urbanozeiro_auth_users');
    const authDb = authDbStr ? JSON.parse(authDbStr) : {};
    const results: SocialPlayer[] = [];
    for (const uid in authDb) {
      results.push(this.generateSocialPlayer(uid, authDb[uid].username, currentUserId));
    }
    return results;
  },

  async searchPublicPlayers(query: string, currentUserId: string): Promise<SocialPlayer[]> {
    const authDbStr = localStorage.getItem('urbanozeiro_auth_users');
    const authDb = authDbStr ? JSON.parse(authDbStr) : {};
    
    const results: SocialPlayer[] = [];
    const q = query.toLowerCase().trim();
    if (!q) return [];

    for (const uid in authDb) {
      const user = authDb[uid];
      if (user.username.toLowerCase().includes(q)) {
        results.push(this.generateSocialPlayer(uid, user.username, currentUserId));
      }
    }
    
    return results;
  },

  async getPublicProfile(userId: string, currentUserId: string): Promise<SocialPlayer | null> {
    const authDbStr = localStorage.getItem('urbanozeiro_auth_users');
    const authDb = authDbStr ? JSON.parse(authDbStr) : {};
    
    const user = authDb[userId];
    if (!user) return null;
    
    return this.generateSocialPlayer(userId, user.username, currentUserId);
  },

  async toggleFollow(currentUserId: string, targetUserId: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    if (currentUserId === targetUserId) throw new Error("Não pode seguir a si mesmo");
    
    const db = this.getFollowsDB();
    const existingIndex = db.findIndex(f => f.followerId === currentUserId && f.followingId === targetUserId);
    
    let isFollowing = false;
    if (existingIndex >= 0) {
      db.splice(existingIndex, 1);
    } else {
      db.push({
        followerId: currentUserId,
        followingId: targetUserId,
        createdAt: Date.now()
      });
      isFollowing = true;
    }
    this.saveFollowsDB(db);

    const newFollowersCount = db.filter(f => f.followingId === targetUserId).length;
    return { isFollowing, followersCount: newFollowersCount };
  },
  
  async getFollowers(userId: string, currentUserId: string): Promise<SocialPlayer[]> {
     const follows = this.getFollowsDB();
     const followerIds = follows.filter(f => f.followingId === userId).map(f => f.followerId);
     
     const authDbStr = localStorage.getItem('urbanozeiro_auth_users');
     const authDb = authDbStr ? JSON.parse(authDbStr) : {};
     
     return followerIds.map(fid => {
        const u = authDb[fid];
        const username = u ? u.username : `User_${fid.substring(0,4)}`;
        return this.generateSocialPlayer(fid, username, currentUserId);
     });
  },
  
  async getFollowing(userId: string, currentUserId: string): Promise<SocialPlayer[]> {
     const follows = this.getFollowsDB();
     const followingIds = follows.filter(f => f.followerId === userId).map(f => f.followingId);
     
     const authDbStr = localStorage.getItem('urbanozeiro_auth_users');
     const authDb = authDbStr ? JSON.parse(authDbStr) : {};
     
     return followingIds.map(fid => {
        const u = authDb[fid];
        const username = u ? u.username : `User_${fid.substring(0,4)}`;
        return this.generateSocialPlayer(fid, username, currentUserId);
     });
  }
};

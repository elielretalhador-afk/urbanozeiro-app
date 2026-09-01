import sys

with open('src/services/clan.ts', 'r') as f:
    content = f.read()

old_create = """    const docRef = await addDoc(clansRef, {
      name,
      icon,
      leaderId: userId,
      leaderName: userName,
      memberIds: [userId],
      memberCount: 1,
      createdAt: serverTimestamp(),
      members: [{
        id: userId,
        userId: userId,
        name: userName,
        role: 'lider'
      }]
    });"""

new_create = """
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    const defaultMissions = [
      {
        id: 'mission_1',
        type: 'EXPANSION',
        title: 'Expansão Territorial',
        description: 'Conquiste 5 Zonas neutras.',
        target: 5,
        progress: 0,
        rewardXp: 500,
        status: 'active',
        createdAt: now,
        expiresAt: now + oneWeek
      },
      {
        id: 'mission_2',
        type: 'WAR',
        title: 'Guerra de Clãs',
        description: 'Recupere 3 Zonas de clãs adversários.',
        target: 3,
        progress: 0,
        rewardXp: 800,
        status: 'active',
        createdAt: now,
        expiresAt: now + oneWeek
      },
      {
        id: 'mission_3',
        type: 'DOMINANCE',
        title: 'Domínio Absoluto',
        description: 'Mantenha ou conquiste 5 zonas (progressão geral).',
        target: 5,
        progress: 0,
        rewardXp: 600,
        status: 'active',
        createdAt: now,
        expiresAt: now + oneWeek
      }
    ];

    const docRef = await addDoc(clansRef, {
      name,
      icon,
      leaderId: userId,
      leaderName: userName,
      memberIds: [userId],
      memberCount: 1,
      missions: defaultMissions,
      createdAt: serverTimestamp(),
      members: [{
        id: userId,
        userId: userId,
        name: userName,
        role: 'lider'
      }]
    });"""

content = content.replace(old_create, new_create)

# We should also add seedMissions to ClanService
seed_func = """
  async seedMissions(clanId: string): Promise<void> {
    const clanRef = doc(db, 'clans', clanId);
    const clanSnap = await getDoc(clanRef);
    if (clanSnap.exists()) {
      const data = clanSnap.data();
      if (!data.missions || data.missions.length === 0) {
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const defaultMissions = [
          { id: 'm1', type: 'EXPANSION', title: 'Expansão Territorial', description: 'Conquiste 5 Zonas neutras.', target: 5, progress: 0, rewardXp: 500, status: 'active', createdAt: now, expiresAt: now + oneWeek },
          { id: 'm2', type: 'WAR', title: 'Guerra de Clãs', description: 'Recupere 3 Zonas adversárias.', target: 3, progress: 0, rewardXp: 800, status: 'active', createdAt: now, expiresAt: now + oneWeek },
          { id: 'm3', type: 'DOMINANCE', title: 'Domínio Absoluto', description: 'Ajude no domínio geral.', target: 5, progress: 0, rewardXp: 600, status: 'active', createdAt: now, expiresAt: now + oneWeek }
        ];
        await updateDoc(clanRef, { missions: defaultMissions });
      }
    }
  },
"""

content = content.replace("async getClan(clanId: string): Promise<Clan | null> {", seed_func + "\n  async getClan(clanId: string): Promise<Clan | null> {")

with open('src/services/clan.ts', 'w') as f:
    f.write(content)

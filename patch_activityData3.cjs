const fs = require('fs');
let content = fs.readFileSync('src/data/activityData.ts', 'utf8');

const newMockActivities = `
  {
    id: 'act_post_001',
    playerId: 'p_streetfox',
    playerNickname: 'StreetFox',
    playerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    playerTag: '#FOX99',
    playerLevel: 14,
    type: 'PHOTO_POST',
    visibility: 'PUBLIC',
    title: 'Sessão Matinal',
    description: 'A pista estava perfeita hoje! Muito sol e asfalto liso.',
    metadata: {
      image: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=800&auto=format&fit=crop&q=80'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    likesCount: 12,
    hasLiked: false,
    commentsCount: 3,
  },
  {
    id: 'act_post_002',
    playerId: 'usr_mock_001',
    playerNickname: 'Eliel',
    playerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    playerLevel: 5,
    type: 'TEXT_POST',
    visibility: 'PUBLIC',
    title: 'Dica do dia',
    description: 'Lembrem-se sempre de aquecer antes de sair para patinar. Evita muitas lesões bobas.',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    likesCount: 5,
    hasLiked: true,
    commentsCount: 0,
    isOwnActivity: true
  },
  {
    id: 'act_post_003',
    playerId: 'p_ninaroll',
    playerNickname: 'NinaRoll',
    playerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    playerLevel: 12,
    type: 'ROUTE_SHARED',
    visibility: 'PUBLIC',
    title: 'Rota Compartilhada',
    description: 'Fiz essa rota nova perto do parque, muito boa para treinar resistência.',
    metadata: {
      routeId: 'route_mock_01',
      routeName: 'Volta no Parque',
      distance: 5.2,
      difficulty: 'MÉDIO',
      trackPreview: [[-23.5505, -46.6333], [-23.5510, -46.6340]]
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    likesCount: 22,
    hasLiked: false,
    commentsCount: 5,
  },
`;

content = content.replace(
  /export const INITIAL_ACTIVITIES: Activity\[\] = \[/,
  `export const INITIAL_ACTIVITIES: Activity[] = [\n${newMockActivities}`
);

fs.writeFileSync('src/data/activityData.ts', content);

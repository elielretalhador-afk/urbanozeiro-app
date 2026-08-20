const fs = require('fs');
let content = fs.readFileSync('src/services/db.ts', 'utf8');

// Update imports
content = content.replace(
  /INITIAL_CLANS\n\} from '\.\.\/data\/mockData';/,
  `INITIAL_CLANS,\n  MOCK_ROUTES,\n  MOCK_CHALLENGES,\n  INITIAL_DIRECT_CHALLENGES,\n  INITIAL_EVENTS\n} from '../data/mockData';`
);

// Add keys
content = content.replace(
  /CLANS: 'urb_db_clans' \/\/ Mantido para não quebrar compatibilidade/,
  `CLANS: 'urb_db_clans',\n  ROUTES: 'urb_db_routes',\n  CHALLENGES: 'urb_db_challenges',\n  DIRECT_CHALLENGES: 'urb_db_direct_challenges',\n  EVENTS: 'urb_db_events'`
);

// Update initializeApp signature
content = content.replace(
  /tutorial: TutorialState;\n    activities: PlayerPublicActivity\[\];\n  \}>/,
  `tutorial: TutorialState;\n    activities: PlayerPublicActivity[];\n    routes: any[];\n    challenges: any[];\n    directChallenges: any[];\n    events: any[];\n  }>`
);

// Update initializeApp returns
content = content.replace(
  /activities: await loadIdb<PlayerPublicActivity\[\]>\(KEYS\.ACTIVITIES, INITIAL_ACTIVITIES as any\)\n    \};/,
  `activities: await loadIdb<PlayerPublicActivity[]>(KEYS.ACTIVITIES, INITIAL_ACTIVITIES as any),\n      routes: await loadIdb<any[]>(KEYS.ROUTES, MOCK_ROUTES),\n      challenges: await loadIdb<any[]>(KEYS.CHALLENGES, MOCK_CHALLENGES),\n      directChallenges: await loadIdb<any[]>(KEYS.DIRECT_CHALLENGES, INITIAL_DIRECT_CHALLENGES),\n      events: await loadIdb<any[]>(KEYS.EVENTS, INITIAL_EVENTS)\n    };`
);

fs.writeFileSync('src/services/db.ts', content);

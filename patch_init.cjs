const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace isDbReady initial state
content = content.replace(
  /const \[isDbReady, setIsDbReady\] = useState<boolean>\(true\);/,
  `const [isDbReady, setIsDbReady] = useState<boolean>(false);`
);

// We should inject an initialization effect.
const initEffect = `
  useEffect(() => {
    DatabaseService.initializeApp().then(data => {
      setUser(data.user);
      setZones(data.zones);
      setSessionHistory(data.sessions);
      setActivities(data.activities);
      setChallenges(data.challenges);
      setDirectChallenges(data.directChallenges);
      setEvents(data.events);
      if (typeof setAchievements !== 'undefined') setAchievements(data.achievements);
      if (typeof setNotifications !== 'undefined') setNotifications(data.notifications);
      setIsDbReady(true);
    }).catch(err => {
      console.error(err);
      setDbError(err.message || 'Error initializing DB');
    });
  }, []);
`;

// Inject this effect after isDbReady definition
content = content.replace(
  /const \[dbError, setDbError\] = useState<any>\(null\);/,
  `const [dbError, setDbError] = useState<any>(null);\n${initEffect}`
);

// Also remove the old zones loader effect
const oldZonesEffect = /useEffect\(\(\) => \{\n\s*\/\/ PREPARAÇÃO FIRESTORE:[\s\S]*?loadInitialZones\(\);\n\s*\}, \[\]\);/m;
content = content.replace(oldZonesEffect, '');

// Also remove the old sessionHistory loader effect
const oldSessionsEffect = /useEffect\(\(\) => \{\n\s*\/\/ PREPARAÇÃO FIRESTORE:\n\s*\/\/ Evita carregar o histórico inteiro[\s\S]*?loadInitialSessions\(\);\n\s*\}, \[user\]\);/m;
content = content.replace(oldSessionsEffect, '');

// Fix user initial state since we load it async now
content = content.replace(
  /const \[user, setUser\] = useState<UserProfile>\(\(\) => \{[\s\S]*?return CURRENT_USER;\n\s*\}\);/m,
  `const [user, setUser] = useState<UserProfile>(CURRENT_USER);`
);

fs.writeFileSync('src/App.tsx', content);

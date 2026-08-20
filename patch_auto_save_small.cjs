const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const autoSaves = `
  useEffect(() => {
    if (isDbReady && notifications.length > 0) {
      DatabaseService.saveNotifications(notifications).catch(console.error);
    }
  }, [notifications, isDbReady]);

  useEffect(() => {
    if (isDbReady && achievements && achievements.length > 0) {
      DatabaseService.saveAchievements(achievements).catch(console.error);
    }
  }, [achievements, isDbReady]);
`;

content = content.replace(
  /const \[notifications, setNotifications\] = useState<any\[\]>\(INITIAL_NOTIFICATIONS \|\| \[\]\);/,
  `const [notifications, setNotifications] = useState<any[]>([]);\n${autoSaves}`
);

fs.writeFileSync('src/App.tsx', content);

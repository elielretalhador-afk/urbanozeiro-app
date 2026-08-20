const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const autoSaveActivities = `
  useEffect(() => {
    if (isDbReady && activities.length > 0) {
      DatabaseService.updateActivitiesList(activities).catch(console.error);
    }
  }, [activities, isDbReady]);
`;

content = content.replace(
  /const \[activities, setActivities\] = useState<any\[\]>\(INITIAL_ACTIVITIES \|\| \[\]\);/,
  `const [activities, setActivities] = useState<any[]>([]);\n${autoSaveActivities}`
);

fs.writeFileSync('src/App.tsx', content);

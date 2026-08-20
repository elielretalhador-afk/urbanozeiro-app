const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const missingStatesAndFunctions4 = `
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>(INITIAL_ACTIVITIES || []);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [activityFeedInitialFilter, setActivityFeedInitialFilter] = useState<any>('TODAS');

  const loadMoreActivities = async () => {};
`;

content = content.replace(
  /\/\/ Sincronismo mantido internamente pelo db\.ts\./,
  `// Sincronismo mantido internamente pelo db.ts.\n${missingStatesAndFunctions4}`
);

fs.writeFileSync('src/App.tsx', content);

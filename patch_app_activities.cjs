const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Use FeedService to load and seed activities
content = content.replace(
  /const \[activities, setActivities\] = useState<Activity\[\]>\(\(\) => \{[\s\S]*?return INITIAL_ACTIVITIES;\n  \}\);/,
  `const [activities, setActivities] = useState<Activity[]>([]);`
);

// Add import
if (!content.includes('import { FeedService }')) {
  content = content.replace(
    /import \{ SocialService \} from "\.\/services\/social";/,
    `import { SocialService } from "./services/social";\nimport { FeedService } from "./services/feed";`
  );
}

// Ensure activities are loaded dynamically
content = content.replace(
  /SocialService\.getAllPlayers\(user\.id\)\.then\(players => setSocialPlayers\(players\)\);/,
  `SocialService.getAllPlayers(user.id).then(players => setSocialPlayers(players));\n      FeedService.seedMockActivitiesIfEmpty(user);\n      setActivities(FeedService.getActivitiesDB());`
);

// Inject into handleEndSession
content = content.replace(
  /setSessionHistory\(\(prev\) => \[finishedSession, \.\.\.prev\]\);/,
  `setSessionHistory((prev) => [finishedSession, ...prev]);\n\n    const newActivity = FeedService.createSkateSessionActivity(finishedSession, user);\n    setActivities(prev => [newActivity, ...prev]);`
);

// Inject onRedoRoute
const redoRouteCode = `
          onRedoRoute={(activityId, metadata) => {
             if (metadata?.trackPreview && metadata.trackPreview.length > 0) {
                // Future: Prepare a route from trackPreview and start
                showToast("Rota carregada no mapa para iniciar futura sessão.");
                setIsActivityFeedOpen(false);
                // Simulation of finding the session to redo
                const refSession = sessionHistory.find(s => s.id === metadata.relatedId || s.id === activityId);
                if (refSession) {
                   setRedoReferenceSession(refSession);
                   setIsRedoMode(true);
                   setActiveTab('mapa');
                }
             }
          }}
`;

content = content.replace(
  /friendIds=\{socialPlayers\.filter\(\(p\) => p\.isFriend\)\.map\(\(p\) => p\.id\)\}/,
  `${redoRouteCode.trim()}\n          friendIds={socialPlayers.filter((p) => p.isFriend).map((p) => p.id)}`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx for Activity Feed');

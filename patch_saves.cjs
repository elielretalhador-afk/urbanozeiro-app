const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /setActivities\(prev => \[newActivity, \.\.\.prev\]\);/,
  `setActivities(prev => [newActivity, ...prev]);\n    DatabaseService.saveSession(finishedSession).catch(console.error);\n    DatabaseService.saveActivity(newActivity).catch(console.error);`
);

fs.writeFileSync('src/App.tsx', content);

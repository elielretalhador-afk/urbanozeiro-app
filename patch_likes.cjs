const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /return act;\n\s*\}\)\);/m,
  `return act;\n    });\n    // Salvar atualização no IndexedDB em background\n    DatabaseService.updateActivitiesList(activities);\n`
);

content = content.replace(
  /setActivities\(prev => \[newAct, \.\.\.prev\]\);/,
  `setActivities(prev => [newAct, ...prev]);\n                        DatabaseService.saveActivity(newAct).catch(console.error);`
);

fs.writeFileSync('src/App.tsx', content);

const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /DatabaseService\.saveSession\(finishedSession\)\.catch\(console\.error\);\n\s*DatabaseService\.saveActivity\(newActivity as any\)\.catch\(console\.error\);/,
  `DatabaseService.queueSessionForSync(finishedSession, newActivity as any).catch(console.error);`
);

fs.writeFileSync('src/App.tsx', content);

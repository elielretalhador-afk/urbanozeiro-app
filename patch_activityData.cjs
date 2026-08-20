const fs = require('fs');
let content = fs.readFileSync('src/data/activityData.ts', 'utf8');

content = content.replace(
  /case 'SEGUINDO':\n\s*return isFollowing && !isOwner;/,
  `case 'SEGUINDO':\n        return isFollowing || isOwner;`
);

fs.writeFileSync('src/data/activityData.ts', content);
console.log('Patched SEGUINDO filter');

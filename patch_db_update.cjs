const fs = require('fs');
let content = fs.readFileSync('src/services/db.ts', 'utf8');

content = content.replace(
  /\/\/ Atividades \(Feed\)/,
  `async updateActivitiesList(activities: PlayerPublicActivity[]): Promise<void> {\n    await saveIdb(KEYS.ACTIVITIES, activities);\n  },\n  // Atividades (Feed)`
);

fs.writeFileSync('src/services/db.ts', content);

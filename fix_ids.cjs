const fs = require('fs');
let content = fs.readFileSync('src/components/CreateZoneModal.tsx', 'utf8');

content = content.replace(
  /id: \`zone_\$\{Date\.now\(\)\}\`,/,
  `id: shapeType === 'segment' ? \`seg_\$\{Date.now()\}\` : \`zone_\$\{Date.now()\}\`,`
);

fs.writeFileSync('src/components/CreateZoneModal.tsx', content);
console.log('Fixed Ids');

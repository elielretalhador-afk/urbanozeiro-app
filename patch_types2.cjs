const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

content = content.replace(
  /export interface PlayerPublicActivity \{/,
  `export interface PlayerPublicActivity {\n  syncStatus?: 'pending' | 'synced' | 'error';`
);

fs.writeFileSync('src/types/index.ts', content);

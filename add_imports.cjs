const fs = require('fs');
let content = fs.readFileSync('src/services/db.ts', 'utf8');

content = `import { CacheManager } from './cache';\nimport { PaginatedResult } from '../types';\n` + content;

fs.writeFileSync('src/services/db.ts', content);
console.log('Added imports to db.ts');

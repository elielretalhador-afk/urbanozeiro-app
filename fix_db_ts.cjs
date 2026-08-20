const fs = require('fs');
let content = fs.readFileSync('src/services/db.ts', 'utf8');

// The error is about missing CacheManager import (I did try to import it, maybe it failed or got placed wrong)
if (!content.includes("import { CacheManager }")) {
  content = content.replace(
    /import \{ (.*) \} from '\.\.\/types';/,
    `import { $1, PaginatedResult } from '../types';\nimport { CacheManager } from './cache';`
  );
}

// Check if PaginatedResult is missing
if (!content.includes("PaginatedResult") && content.includes("import {")) {
   content = content.replace(
    /import \{ (.*) \} from '\.\.\/types';/,
    `import { $1, PaginatedResult } from '../types';`
  );
}

// Fix sorting issue with startedAt which might be null or something
content = content.replace(
  /new Date\(b.startedAt\)\.getTime\(\) - new Date\(a\.startedAt\)\.getTime\(\)/,
  `(b.startedAt ? new Date(b.startedAt).getTime() : 0) - (a.startedAt ? new Date(a.startedAt).getTime() : 0)`
);

fs.writeFileSync('src/services/db.ts', content);
console.log('Fixed db.ts type errors');

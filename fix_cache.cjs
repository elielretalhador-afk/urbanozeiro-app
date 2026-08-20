const fs = require('fs');
let content = fs.readFileSync('src/services/cache.ts', 'utf8');

content = content.replace(
  /get<T>\(key: string, ttl: number = this\.DEFAULT_TTL\): T \| null \{/,
  `get<T>(key: string, ttl?: number): T | null {
    if (ttl === undefined) ttl = CacheManager.DEFAULT_TTL;`
);

content = content.replace(/this\./g, 'CacheManager.');

fs.writeFileSync('src/services/cache.ts', content);
console.log('Fixed cache.ts');

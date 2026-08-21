const fs = require('fs');
let content = fs.readFileSync('src/services/chat.ts', 'utf8');
content = content.replace(/\\\$/g, '$');
content = content.replace(/\\`/g, '`');
fs.writeFileSync('src/services/chat.ts', content, 'utf8');

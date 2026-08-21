const fs = require('fs');
let content = fs.readFileSync('src/components/ChatModal.tsx', 'utf8');
content = content.replace(/\\\$/g, '$');
content = content.replace(/\\`/g, '`');
fs.writeFileSync('src/components/ChatModal.tsx', content, 'utf8');

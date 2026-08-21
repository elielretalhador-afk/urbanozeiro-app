const fs = require('fs');
let content = fs.readFileSync('src/components/PublicProfileModal.tsx', 'utf8');
content = content.replace('Radio,\n, MessageSquare', 'Radio,\nMessageSquare');
fs.writeFileSync('src/components/PublicProfileModal.tsx', content, 'utf8');

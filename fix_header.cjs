const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Wallet button removal
content = content.replace(/\{onOpenWallet && \([\s\S]*?<\/button>\s*\)\}/g, '');

fs.writeFileSync('src/components/Header.tsx', content, 'utf8');
console.log('Fixed Header features');

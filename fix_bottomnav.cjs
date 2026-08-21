const fs = require('fs');
let content = fs.readFileSync('src/components/BottomNav.tsx', 'utf8');
content = content.replace(/if \(tab\.id === 'feed' && onOpenFeed\) \{[\s\S]*?\} else \{[\s\S]*?onChangeTab\(tab\.id as TabType\);[\s\S]*?\}/, 'onChangeTab(tab.id as TabType);');
fs.writeFileSync('src/components/BottomNav.tsx', content, 'utf8');
console.log('Fixed BottomNav');

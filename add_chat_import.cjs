const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import { ChatModal }')) {
  content = content.replace(
    'import { SocialHubModal, SocialTabType } from \'./components/SocialHubModal\';',
    'import { SocialHubModal, SocialTabType } from \'./components/SocialHubModal\';\nimport { ChatModal } from \'./components/ChatModal\';'
  );
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx ChatModal import fixed');

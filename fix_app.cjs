const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import { ChatModal }')) {
  content = content.replace(
    'import { SocialHubModal } from \'./components/SocialHubModal\';',
    'import { SocialHubModal } from \'./components/SocialHubModal\';\nimport { ChatModal } from \'./components/ChatModal\';'
  );
}

// Fix onMessage type implicitly any
content = content.replace(
  'onMessage={(id) => {',
  'onMessage={(id: string) => {'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx fixed');

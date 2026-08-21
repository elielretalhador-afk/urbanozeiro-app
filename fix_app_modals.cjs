const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regexes = [
  /\{\/\* Modal: Central de Progressão e Inventário \*\/\}[\s\S]*?<ProgressionHubModal[\s\S]*?\/>/,
  /\{\/\* Modal: Celebração de Level Up \*\/\}[\s\S]*?<LevelUpModal[\s\S]*?\/>/,
  /\{\/\* Modal: Central de Conquistas, Medalhas & Títulos \(Estrutura de Honra\) \*\/\}[\s\S]*?<AchievementsModal[\s\S]*?\/>/,
  /\{\/\* Modal: Celebração de Conquista Desbloqueada \*\/\}[\s\S]*?<AchievementUnlockedModal[\s\S]*?\/>/,
  /\{\/\* Modal: Carteira Virtual & Economia Interna \(Moedas do Urbanozeiro\) \*\/\}[\s\S]*?<VirtualWalletModal[\s\S]*?\/>/
];

regexes.forEach(regex => {
  content = content.replace(regex, '');
});

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed Modals in App.tsx');

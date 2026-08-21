const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/setActiveTab\('rotas'\)/g, "setActiveTab('feed')");
content = content.replace(/activeTab === 'rotas'/g, "activeTab === 'feed'");

// 2703, 2869
content = content.replace(/setIsActivityFeedOpen\([\s\S]*?\);/g, '');

// Season Hub modal was probably not removed because the regex was too greedy or failed. Let's find and remove it.
const seasonRegex = /\{\/\* Modal: Central de Temporadas \(Temporada Ativa, Ranking, Prêmios & Histórico\) \*\/\}\s*<SeasonHubModal[\s\S]*?\/>/;
content = content.replace(seasonRegex, '');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed App ts');

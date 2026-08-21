const fs = require('fs');

let perfil = fs.readFileSync('src/components/PerfilView.tsx', 'utf8');
perfil = perfil.replace(/\{onOpenSeasonHub && \([\s\S]*?<\/button>\s*\)\}/g, '');
fs.writeFileSync('src/components/PerfilView.tsx', perfil, 'utf8');

let ranking = fs.readFileSync('src/components/RankingView.tsx', 'utf8');
ranking = ranking.replace(/onClick=\{.*?onOpenSeasonHub\('visao_geral'\)\}/g, '');
// Wait, the ranking view might have a button specifically for the season hub. Let's see RankingView.tsx
fs.writeFileSync('src/components/RankingView.tsx', ranking, 'utf8');
console.log('Fixed Seasons');

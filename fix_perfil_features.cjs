const fs = require('fs');
let content = fs.readFileSync('src/components/PerfilView.tsx', 'utf8');

// The achievements tabs in PerfilView
// We can just find the sections for these tabs and remove them.
content = content.replace(/\{tab === 'honrarias' && \([\s\S]*?\}\)/, '');

// Also remove the "honrarias" tab button
content = content.replace(/\{ id: 'honrarias', label: 'HONRARIAS' \},/g, '');

// Wallet button removal
content = content.replace(/\{onOpenWallet && \([\s\S]*?<\/button>\s*\)\}/g, '');

// Levels/Progression section?
// In PerfilView, the user's level is usually shown. "recompensas por nível" is removed. We can leave the Level number since it's an RPG mechanic, but hide the Progression modal.
content = content.replace(/onClick=\{onOpenProgression\}/g, '');

fs.writeFileSync('src/components/PerfilView.tsx', content, 'utf8');
console.log('Fixed Perfil features');

const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const handleToggleFollow = \(id: string\) => \{ showToast\('Status de seguir atualizado\.'\); \};/,
  `const handleToggleFollow = (id: string) => { 
    setSocialRelationships(prev => {
      const existing = prev.find(r => r.targetPlayerId === id);
      if (existing && existing.isFollowing) {
        showToast('Deixou de seguir o jogador.');
        return prev.map(r => r.targetPlayerId === id ? { ...r, isFollowing: false } : r);
      } else if (existing) {
        showToast('Começou a seguir o jogador.');
        return prev.map(r => r.targetPlayerId === id ? { ...r, isFollowing: true } : r);
      } else {
        showToast('Começou a seguir o jogador.');
        return [...prev, { targetPlayerId: id, status: 'NONE', isFollowing: true, isBlocked: false }];
      }
    });
  };`
);

fs.writeFileSync('src/App.tsx', content);

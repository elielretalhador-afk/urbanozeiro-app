const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const handleToggleActivityLike = \(id: string\) => \{ showToast\('Curtida atualizada\.'\); \};/,
  `const handleToggleActivityLike = (id: string) => { 
    setActivities(prev => prev.map(act => {
      if (act.id === id) {
        const isLiked = !act.hasLiked;
        return {
          ...act,
          hasLiked: isLiked,
          likesCount: (act.likesCount || 0) + (isLiked ? 1 : -1)
        };
      }
      return act;
    }));
  };`
);

fs.writeFileSync('src/App.tsx', content);

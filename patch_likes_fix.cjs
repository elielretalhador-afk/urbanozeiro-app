const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const handleToggleActivityLike = \(id: string\) => \{\s*setActivities\(prev => \{\s*const updated = prev\.map.*?return act;\s*\}\);\s*\/\/ Salvar atualização no IndexedDB em background\s*DatabaseService\.updateActivitiesList\(activities\);\s*\}\);/sm;

content = content.replace(
  /const handleToggleActivityLike = \(id: string\) => \{\s*setActivities\(prev => prev\.map\(act => \{\s*if \(act\.id === id\) \{\s*const isLiked = !act\.hasLiked;\s*return \{\s*\.\.\.act,\s*hasLiked: isLiked,\s*likesCount: \(act\.likesCount \|\| 0\) \+ \(isLiked \? 1 : -1\)\s*\};\s*\}\s*return act;\s*\}\);\s*\/\/ Salvar atualização no IndexedDB em background\s*DatabaseService\.updateActivitiesList\(activities\);\s*\}\);/sm,
  `const handleToggleActivityLike = (id: string) => {
    setActivities(prev => {
      const updated = prev.map(act => {
        if (act.id === id) {
          const isLiked = !act.hasLiked;
          return {
            ...act,
            hasLiked: isLiked,
            likesCount: (act.likesCount || 0) + (isLiked ? 1 : -1)
          };
        }
        return act;
      });
      DatabaseService.updateActivitiesList(updated).catch(console.error);
      return updated;
    });
  };`
);

fs.writeFileSync('src/App.tsx', content);

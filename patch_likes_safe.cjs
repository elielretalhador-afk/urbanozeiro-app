const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `const handleToggleActivityLike = (id: string) => { 
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
  };`;

const regex = /const handleToggleActivityLike = \(id: string\) => \{ \n\s*setActivities\(prev => prev\.map\(act => \{\n\s*if \(act\.id === id\) \{\n\s*const isLiked = !act\.hasLiked;\n\s*return \{\n\s*\.\.\.act,\n\s*hasLiked: isLiked,\n\s*likesCount: \(act\.likesCount \|\| 0\) \+ \(isLiked \? 1 : -1\)\n\s*\};\n\s*\}\n\s*return act;\n\s*\}\)\);\n\s*\};/m;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);

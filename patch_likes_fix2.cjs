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

// Use a simple replace function to avoid regex complications
const lines = content.split('\\n');
let startIndex = -1;
let endIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const handleToggleActivityLike =')) {
    startIndex = i;
  }
  if (startIndex !== -1 && lines[i].includes('DatabaseService.updateActivitiesList(activities);')) {
    endIndex = i + 1; // including the closing brace
    break;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  lines.splice(startIndex, endIndex - startIndex + 1, replacement);
  fs.writeFileSync('src/App.tsx', lines.join('\\n'));
}


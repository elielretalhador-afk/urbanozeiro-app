const fs = require('fs');
let content = fs.readFileSync('src/data/activityData.ts', 'utf8');

content = content.replace(
  /case 'SESSION_COMPLETED':/,
  `case 'TEXT_POST': return '📝';
    case 'PHOTO_POST': return '📸';
    case 'ROUTE_SHARED': return '🗺️';
    case 'SESSION_COMPLETED':`
);

content = content.replace(
  /case 'SESSION_COMPLETED':\s*case 'ROUTE_COMPLETED':\s*return \{\s*badgeBg: 'bg-emerald-500\/10',\s*badgeText: 'text-emerald-400',\s*borderColor: 'border-emerald-500\/30',\s*accentColor: 'text-emerald-400',\s*\};/,
  `case 'TEXT_POST':
    case 'PHOTO_POST':
      return {
        badgeBg: 'bg-blue-500/10',
        badgeText: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        accentColor: 'text-blue-400',
      };
    case 'ROUTE_SHARED':
      return {
        badgeBg: 'bg-indigo-500/10',
        badgeText: 'text-indigo-400',
        borderColor: 'border-indigo-500/30',
        accentColor: 'text-indigo-400',
      };
    case 'SESSION_COMPLETED':
    case 'ROUTE_COMPLETED':
      return {
        badgeBg: 'bg-emerald-500/10',
        badgeText: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
        accentColor: 'text-emerald-400',
      };`
);

fs.writeFileSync('src/data/activityData.ts', content);

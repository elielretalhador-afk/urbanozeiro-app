const fs = require('fs');
let content = fs.readFileSync('src/components/FeedView.tsx', 'utf8');

content = content.replace(
  '  onOpenAchievements?: () => void;\n}',
  `  onOpenAchievements?: () => void;
  onRedoRoute?: (activityId: string, metadata: any) => void;
  friendIds?: string[];
  followingIds?: string[];
  blockedIds?: string[];
}`
);

// Also remove the local definitions of friendIds, followingIds, blockedIds from FeedView
content = content.replace(/  const friendIds = currentUser\.friends \|\| \[\];\n/g, '');
content = content.replace(/  const followingIds = currentUser\.following \|\| \[\];\n/g, '');
content = content.replace(/  const blockedIds = currentUser\.blockedPlayers \|\| \[\];\n/g, '');

// And add them to the component destructuring
content = content.replace(
  '  onOpenAchievements,\n}) => {',
  `  onOpenAchievements,
  onRedoRoute,
  friendIds = [],
  followingIds = [],
  blockedIds = [],
}) => {`
);

fs.writeFileSync('src/components/FeedView.tsx', content, 'utf8');
console.log('Fixed props');

const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /<PublicProfileModal\s+player=\{selectedPublicPlayer\}/,
  `<PublicProfileModal
          player={selectedPublicPlayer}
          isFollowing={selectedPublicPlayer ? socialRelationships.some(r => r.targetPlayerId === selectedPublicPlayer.id && r.isFollowing) : false}`
);

fs.writeFileSync('src/App.tsx', content);

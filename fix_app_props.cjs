const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /isFollowing=\{selectedPublicPlayer\?.id \? socialPlayers.find\(\(p\) => p\.id === selectedPublicPlayer\.id\)\?.isFollowing : false\}/,
  `isFollowing={selectedPublicPlayer ? selectedPublicPlayer.isFollowing : false}`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed isFollowing prop");

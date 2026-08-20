const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /\s*isFollowing=\{selectedPublicPlayer \? \(selectedPublicPlayer as any\)\.isFollowing : false\}/,
  ''
);

fs.writeFileSync('src/App.tsx', content);

const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/const \(\(coords: any\) => \{\}\) = \(id: string\) => \{\};/, 'const handleFocusLiveChallengeParticipant = (id: string | [number, number]) => {};');

content = content.replace(/onCenterMap=\{\(\(coords: any\) => \{\}\)\}/, 'onCenterMap={handleFocusLiveChallengeParticipant}');

fs.writeFileSync('src/App.tsx', content);

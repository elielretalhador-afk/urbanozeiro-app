const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const injectCode = `
    // --- INJECT ACTIVITY FEED ---
    const isWinner = winner?.isCurrentUser || false;
    const newChallengeAct = FeedService.createChallengeActivity(finalChallenge, userRef.current, isWinner);
    setActivities(prev => [newChallengeAct, ...prev]);
    // ----------------------------
`;

content = content.replace(
  /setCompletedLiveChallengeData\(finalChallenge\);\n\s*setIsLiveChallengeResultOpen\(true\);/,
  `setCompletedLiveChallengeData(finalChallenge);\n    setIsLiveChallengeResultOpen(true);\n${injectCode}`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx with Challenge Feed Event');

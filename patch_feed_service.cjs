const fs = require('fs');
let content = fs.readFileSync('src/services/feed.ts', 'utf8');

// Add createChallengeWonActivity
const addChallenge = `
  createChallengeActivity(challenge: any, user: UserProfile, isWinner: boolean): Activity {
    const oppName = challenge.loser?.nickname || 'Adversário';
    const wonText = isWinner ? 'venceu' : 'participou de';
    const typeText = isWinner ? 'CHALLENGE_WON' : 'CHALLENGE_COMPLETED';
    
    return this.createActivity({
      playerId: user.id,
      authId: user.authId,
      playerNickname: user.nickname,
      playerAvatar: user.avatar,
      playerTag: user.tag,
      playerLevel: user.level,
      type: typeText,
      visibility: 'PUBLIC',
      title: 'Desafio',
      description: \`\${user.nickname} \${wonText} um duelo contra \${oppName} em \${challenge.routeName}.\`,
      metadata: {
        opponentNickname: oppName,
        challengeType: 'X1',
        rewardXP: isWinner ? (challenge.xpReward || 350) : 0,
        distanceKm: challenge.routeDistanceKm,
        trackPreview: challenge.routePath,
      },
      relatedId: challenge.id,
      isOwnActivity: true,
    });
  },
`;

content = content.replace(
  /createZoneConqueredActivity\(zoneName: string/,
  `${addChallenge.trim()}\n\n  createZoneConqueredActivity(zoneName: string`
);

fs.writeFileSync('src/services/feed.ts', content);
console.log('Added createChallengeActivity to feed.ts');

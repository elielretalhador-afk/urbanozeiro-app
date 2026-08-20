const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add states
content = content.replace(
  /const \[selectedPublicPlayer, setSelectedPublicPlayer\] = useState<RankPlayer \| SocialPlayer \| null>\(null\);/,
  `const [selectedPublicPlayer, setSelectedPublicPlayer] = useState<RankPlayer | SocialPlayer | null>(null);\n  const [isFollowListModalOpen, setIsFollowListModalOpen] = useState(false);\n  const [followListMode, setFollowListMode] = useState<'followers' | 'following'>('followers');`
);

// Fix TS error for isFollowing
content = content.replace(
  /isFollowing=\{selectedPublicPlayer \? selectedPublicPlayer.isFollowing : false\}/,
  `isFollowing={selectedPublicPlayer ? (selectedPublicPlayer as any).isFollowing : false}`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx states');

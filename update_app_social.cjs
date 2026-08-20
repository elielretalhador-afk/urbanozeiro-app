const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace socialPlayers initialization
content = content.replace(
  /const \[socialPlayers, setSocialPlayers\] = useState<SocialPlayer\[\]>\(\(\) => \{[\s\S]*?return INITIAL_SOCIAL_PLAYERS;\s*\}\);/,
  `const [socialPlayers, setSocialPlayers] = useState<SocialPlayer[]>([]);`
);

// We need to add an import for SocialService if not exists
if (!content.includes('import { SocialService }')) {
  content = content.replace(
    /import \{ AuthService \} from "\.\/services\/auth";/,
    `import { AuthService } from "./services/auth";\nimport { SocialService } from "./services/social";`
  );
}

// Add useEffect to load social players
// We can find where `useEffect(() => { userRef.current = user;` is and append there, or create a new useEffect.
content = content.replace(
  /useEffect\(\(\) => \{\n    userRef.current = user;/,
  `useEffect(() => {\n    if (user && user.id) {\n      SocialService.getAllPlayers(user.id).then(players => setSocialPlayers(players));\n    }\n  }, [user.id]);\n\n  useEffect(() => {\n    userRef.current = user;`
);

// We also need to fix handleToggleFollow
const newHandleToggleFollow = `
  const handleToggleFollow = async (playerId: string) => {
    try {
      const { isFollowing, followersCount } = await SocialService.toggleFollow(user.id, playerId);
      
      setSocialPlayers((prev) =>
        prev.map((p) => {
          if (p.id !== playerId) return p;
          return {
            ...p,
            isFollowing,
            followersCount,
          };
        })
      );
      
      if (selectedPublicPlayer && selectedPublicPlayer.id === playerId) {
        setSelectedPublicPlayer(prev => prev ? { ...prev, isFollowing, followersCount } : null);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };
`;

content = content.replace(
  /const handleToggleFollow = \(playerId: string\) => \{[\s\S]*?followersCount: Math.max\(0, \(p.followersCount \|\| 100\) \+ countDiff\),\n        \};\n      \}\)\n    \);\n  \};/,
  newHandleToggleFollow.trim()
);


fs.writeFileSync('src/App.tsx', content);
console.log('Updated App.tsx');

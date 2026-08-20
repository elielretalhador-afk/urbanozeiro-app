const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Import FollowListModal
if (!content.includes('FollowListModal')) {
  content = content.replace(
    /import \{ PublicProfileModal \} from '\.\/components\/PublicProfileModal';/,
    `import { PublicProfileModal } from './components/PublicProfileModal';\nimport { FollowListModal } from './components/FollowListModal';`
  );
}

// Add state
if (!content.includes('isFollowListModalOpen')) {
  content = content.replace(
    /const \[isPublicProfileOpen, setIsPublicProfileOpen\] = useState<boolean>\(false\);/,
    `const [isPublicProfileOpen, setIsPublicProfileOpen] = useState<boolean>(false);\n  const [isFollowListModalOpen, setIsFollowListModalOpen] = useState(false);\n  const [followListMode, setFollowListMode] = useState<'followers' | 'following'>('followers');`
  );
}

// Update PublicProfileModal props in App.tsx
content = content.replace(
  /<PublicProfileModal\n\s*player=\{selectedPublicPlayer\}/,
  `<PublicProfileModal\n          player={selectedPublicPlayer}\n          onOpenFollowers={() => {\n            setFollowListMode('followers');\n            setIsFollowListModalOpen(true);\n          }}\n          onOpenFollowing={() => {\n            setFollowListMode('following');\n            setIsFollowListModalOpen(true);\n          }}`
);

// Add FollowListModal component
const followModalJsx = `
        {selectedPublicPlayer && (
          <FollowListModal
            isOpen={isFollowListModalOpen}
            onClose={() => setIsFollowListModalOpen(false)}
            title={followListMode === 'followers' ? 'Seguidores' : 'Seguindo'}
            userId={selectedPublicPlayer.id}
            currentUserId={user.id}
            mode={followListMode}
            onSelectPlayer={(p) => {
              setIsFollowListModalOpen(false);
              setSelectedPublicPlayer(p);
            }}
            onToggleFollow={handleToggleFollow}
          />
        )}
`;

if (!content.includes('<FollowListModal')) {
  content = content.replace(
    /\{isActivityFeedOpen && \(/,
    `${followModalJsx.trim()}\n\n        {isActivityFeedOpen && (`
  );
}

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx with FollowListModal');

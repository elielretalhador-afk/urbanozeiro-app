const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

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

content = content.replace(
  /isBlocked=\{selectedPublicPlayer\?.id \? blockedPlayerIds.includes\(selectedPublicPlayer.id\) : false\}\n\s*\/>/,
  `isBlocked={selectedPublicPlayer?.id ? blockedPlayerIds.includes(selectedPublicPlayer.id) : false}\n        />\n${followModalJsx}`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx FollowListModal');

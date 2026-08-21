const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('ChatModal')) {
  content = content.replace(
    'import { SocialHubModal } from \'./components/SocialHubModal\';',
    'import { SocialHubModal } from \'./components/SocialHubModal\';\nimport { ChatModal } from \'./components/ChatModal\';'
  );
  
  content = content.replace(
    'const [isSocialHubOpen, setIsSocialHubOpen] = useState(false);',
    'const [isSocialHubOpen, setIsSocialHubOpen] = useState(false);\n  const [isChatModalOpen, setIsChatModalOpen] = useState(false);\n  const [chatTargetUser, setChatTargetUser] = useState<any>(null);\n\n  const loadSocialData = async () => {\n    if (user && user.id) {\n      const players = await SocialService.getAllPlayers(user.id);\n      setSocialPlayers(players);\n    }\n  };\n'
  );

  content = content.replace(
    'SocialService.getAllPlayers(user.id).then(players => setSocialPlayers(players));',
    'loadSocialData();'
  );

  content = content.replace(
    'onOpenReportModal={handleOpenReportModal}',
    'onOpenReportModal={handleOpenReportModal}\n          onMessage={(id) => {\n            const target = socialPlayers.find(p => p.id === id);\n            if (target) {\n              setChatTargetUser(target);\n              setIsChatModalOpen(true);\n            }\n          }}'
  );

  content = content.replace(
    '{/* Bottom Fixed Navigation Bar */}',
    `{/* Modal: Chat */}
        {chatTargetUser && (
          <ChatModal
            isOpen={isChatModalOpen}
            onClose={() => {
              setIsChatModalOpen(false);
              setChatTargetUser(null);
            }}
            currentUser={user}
            targetUser={chatTargetUser}
          />
        )}
        {/* Bottom Fixed Navigation Bar */}`
  );
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx patched with ChatModal and loadSocialData');

import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I need to revert that broken block.
broken_block = """        <ClanLeaderboardModal
          isOpen={isClanLeaderboardModalOpen}
          onClose={() => setIsClanLeaderboardModalOpen(false)}
          clans={clans}
          onSelectClan={(clan) => {
            setIsClanLeaderboardModalOpen(false);
            setSelectedClanProfile(clan);
          }}
          onCreateClanClick={() => setIsCreateClanModalOpen(true)}
        /> */}"""

fixed_block = """        <ClanLeaderboardModal
          isOpen={isClanLeaderboardModalOpen}
          onClose={() => setIsClanLeaderboardModalOpen(false)}
          clans={clans}
          onSelectClan={(clan) => {
            setIsClanLeaderboardModalOpen(false);
            setSelectedClanProfile(clan);
          }}
          onCreateClanClick={() => setIsCreateClanModalOpen(true)}
        />"""

content = content.replace(broken_block, fixed_block)

with open('src/App.tsx', 'w') as f:
    f.write(content)

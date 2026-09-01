import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("onOpenJoinClan={() => setIsJoinClanModalOpen(true)}", "onOpenJoinClan={() => setIsClanLeaderboardModalOpen(true)}")
content = content.replace("<JoinClanModal", "{/* <JoinClanModal")
content = content.replace("onCreateClanClick={() => setIsCreateClanModalOpen(true)}\n        />", "onCreateClanClick={() => setIsCreateClanModalOpen(true)}\n        /> */}")

with open('src/App.tsx', 'w') as f:
    f.write(content)

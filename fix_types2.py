import sys

with open('src/types/index.ts', 'r') as f:
    content = f.read()

content = content.replace("actionType?: 'open_zone'", "actionType?: 'open_clan_profile' | 'open_zone'")
content = content.replace("| 'friend_accept';", "| 'friend_accept' | 'cla';")

with open('src/types/index.ts', 'w') as f:
    f.write(content)

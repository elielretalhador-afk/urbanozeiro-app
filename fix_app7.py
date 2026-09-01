import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "await SocialService.sendFriendRequest(user.id, id);",
    "await SocialService.sendFriendRequest(user.authId as string, id);"
)
content = content.replace(
    "await SocialService.acceptFriendRequest(id, user.id);",
    "await SocialService.acceptFriendRequest(id, user.authId as string);"
)
content = content.replace(
    "await SocialService.rejectFriendRequest(id, user.id);",
    "await SocialService.rejectFriendRequest(id, user.authId as string);"
)
content = content.replace(
    "await SocialService.rejectFriendRequest(user.id, id);",
    "await SocialService.rejectFriendRequest(user.authId as string, id);"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("<MapView\\n              user={currentUserProfile}", "<MapView\\n              user={currentUserProfile}\\n              userClanId={userClan?.id}")
content = content.replace("<MapView\n              user={currentUserProfile}", "<MapView\n              user={currentUserProfile}\n              userClanId={userClan?.id}")

with open('src/App.tsx', 'w') as f:
    f.write(content)

import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("if (user && user.authId) {", "if (user && user.authId && authState === 'AUTHENTICATED') {")
content = content.replace("if (user?.authId) {\n      const unsub = EconomyService.subscribeToProfileCosmetics", "if (user?.authId && authState === 'AUTHENTICATED') {\n      const unsub = EconomyService.subscribeToProfileCosmetics")
content = content.replace("if (user?.authId) {\n       const unsub = EconomyService.subscribeToWallet", "if (user?.authId && authState === 'AUTHENTICATED') {\n       const unsub = EconomyService.subscribeToWallet")
content = content.replace("if (user && user.authId) {\n      const players = await SocialService.getAllPlayers", "if (user && user.authId && authState === 'AUTHENTICATED') {\n      const players = await SocialService.getAllPlayers")

with open('src/App.tsx', 'w') as f:
    f.write(content)

import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("if (user && user.id) {\n      const players = await SocialService.getAllPlayers(user.id);", "if (user && user.authId) {\n      const players = await SocialService.getAllPlayers(user.authId);")
content = content.replace("const myClan = await ClanService.getMyClan(user.authId || user.id);", "const myClan = await ClanService.getMyClan(user.authId);")

with open('src/App.tsx', 'w') as f:
    f.write(content)

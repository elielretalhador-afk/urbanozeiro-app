import sys

with open('src/services/clan.ts', 'r') as f:
    content = f.read()

old_invite = """    await SocialService.sendNotification(
      targetUserId, 
      inviterId, 
      'cla', // fallback type se precisar
      `convidou você para o clã ${clanName}`
    );"""

new_invite = """    await SocialService.sendNotification(
      targetUserId, 
      inviterId, 
      'cla',
      `convidou você para o clã ${clanName}`,
      'open_clan_profile',
      { clanId }
    );"""

content = content.replace(old_invite, new_invite)

with open('src/services/clan.ts', 'w') as f:
    f.write(content)

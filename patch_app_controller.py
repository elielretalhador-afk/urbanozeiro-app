import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_controller = """                        const controllerData = {
                          id: currentUserProfile.id || 'usr_me',
                          name: currentUserProfile.name,
                          nickname: currentUserProfile.nickname,
                          avatar: currentUserProfile.avatar,
                          level: currentUserProfile.level,
                          clan: currentUserProfile.crew || 'Sem Clã',
                          crew: currentUserProfile.crew || 'Sem Clã',
                        };"""

new_controller = """                        const controllerData = {
                          id: currentUserProfile.id || 'usr_me',
                          name: currentUserProfile.name,
                          nickname: currentUserProfile.nickname,
                          avatar: currentUserProfile.avatar,
                          level: currentUserProfile.level,
                          clan: userClan?.name || currentUserProfile.crew || 'Sem Clã',
                          crew: currentUserProfile.crew || 'Sem Clã',
                          clanId: userClan?.id || undefined,
                          clanName: userClan?.name || undefined,
                          clanIcon: userClan?.icon || userClan?.symbol || undefined,
                        };"""

content = content.replace(old_controller, new_controller)

old_controller2 = """      const controllerData = {
        id: currentUserProfile.id || 'usr_me',
        name: currentUserProfile.name,
        nickname: currentUserProfile.nickname,
        avatar: currentUserProfile.avatar,
        level: currentUserProfile.level,
        clan: currentUserProfile.crew || 'Sem Clã',
        crew: currentUserProfile.crew || 'Sem Clã',
      };"""

new_controller2 = """      const controllerData = {
        id: currentUserProfile.id || 'usr_me',
        name: currentUserProfile.name,
        nickname: currentUserProfile.nickname,
        avatar: currentUserProfile.avatar,
        level: currentUserProfile.level,
        clan: userClan?.name || currentUserProfile.crew || 'Sem Clã',
        crew: currentUserProfile.crew || 'Sem Clã',
        clanId: userClan?.id || undefined,
        clanName: userClan?.name || undefined,
        clanIcon: userClan?.icon || userClan?.symbol || undefined,
      };"""

content = content.replace(old_controller2, new_controller2)

with open('src/App.tsx', 'w') as f:
    f.write(content)

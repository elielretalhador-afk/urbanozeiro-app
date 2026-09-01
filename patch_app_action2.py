import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_action_handler = """    } else if (notification.actionType === 'open_social_hub') {
      handleOpenSocialHub(notification.actionPayload?.tab || 'feed');"""

new_action_handler = """    } else if (notification.actionType === 'open_clan_profile') {
      const cId = notification.actionPayload?.clanId;
      if (cId) {
        const clan = clans.find(c => c.id === cId);
        if (clan) setSelectedClanProfile(clan);
        else ClanService.getClan(cId).then(fetchedClan => { if(fetchedClan) setSelectedClanProfile(fetchedClan); });
      }
    } else if (notification.actionType === 'open_social_hub') {"""

content = content.replace(old_action_handler, new_action_handler)

with open('src/App.tsx', 'w') as f:
    f.write(content)

import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_code = """    } else if (notification.actionType === 'open_profile') {
      setActiveTab('perfil');
    } else if (notification.actionType === 'open_routes') {"""

new_code = """    } else if (notification.actionType === 'open_profile') {
      if (notification.actionPayload?.playerId) {
        setSelectedPublicPlayer({ id: notification.actionPayload.playerId });
      } else {
        setActiveTab('perfil');
      }
    } else if (notification.actionType === 'open_social_hub') {
      handleOpenSocialHub(notification.actionPayload?.tab || 'feed');
    } else if (notification.actionType === 'open_routes') {"""

content = content.replace(old_code, new_code)

with open('src/App.tsx', 'w') as f:
    f.write(content)

import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("loadInitialFeed(user.id);", "loadInitialFeed(user.authId);")
content = content.replace("NotificationService.initPushNotifications(user.authId || user.id);", "NotificationService.initPushNotifications(user.authId);")
content = content.replace("NotificationService.getPreferences(user.authId || user.id).then(prefs => {", "NotificationService.getPreferences(user.authId).then(prefs => {")

with open('src/App.tsx', 'w') as f:
    f.write(content)

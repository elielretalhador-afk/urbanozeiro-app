import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "authId: null,",
    "authId: undefined,"
)

content = content.replace(
    "loadInitialFeed(user.authId);",
    "loadInitialFeed(user.authId as string);"
)

content = content.replace(
    "NotificationService.initPushNotifications(user.authId);",
    "NotificationService.initPushNotifications(user.authId as string);"
)

content = content.replace(
    "NotificationService.getPreferences(user.authId).then(prefs => {",
    "NotificationService.getPreferences(user.authId as string).then(prefs => {"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

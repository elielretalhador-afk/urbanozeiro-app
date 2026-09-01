with open('src/App.tsx', 'r') as f:
    content = f.read()

target = "      NotificationService.initPushNotifications(user.authId || user.id);"
replacement = """      NotificationService.initPushNotifications(user.authId || user.id);
      NotificationService.getPreferences(user.authId || user.id).then(prefs => {
        setPlayerSettings((prev: any) => ({ ...prev, notifications: { ...prev.notifications, ...prefs } }));
      });"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)

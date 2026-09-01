import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
if "import { NotificationService }" not in content:
    content = content.replace("import { SocialService } from './services/social';", "import { SocialService } from './services/social';\nimport { NotificationService } from './services/notificationService';")

# Add initPushNotifications
init_call = """
      loadInitialFeed(user.id);
      
      // Init Push Notifications
      NotificationService.initPushNotifications(user.authId || user.id);
"""
content = content.replace("      loadInitialFeed(user.id);", init_call)

with open('src/App.tsx', 'w') as f:
    f.write(content)

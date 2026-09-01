with open('src/App.tsx', 'r') as f:
    content = f.read()

if "import { NotificationService } from './services/notificationService';" not in content:
    content = content.replace('import { SocialService } from "./services/social";', 'import { SocialService } from "./services/social";\nimport { NotificationService } from "./services/notificationService";')

with open('src/App.tsx', 'w') as f:
    f.write(content)

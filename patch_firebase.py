import re

with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

# Replace imports
content = content.replace("import { getAuth } from 'firebase/auth';", "import { getAuth } from 'firebase/auth';\nimport { getMessaging, isSupported } from 'firebase/messaging';")

# Export messaging
if "export const messaging" not in content:
    addition = """
export let messaging: any = null;
isSupported().then(supported => {
  if (supported) {
    messaging = getMessaging(app);
  }
});
"""
    content += addition

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)

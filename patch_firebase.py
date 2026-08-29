import re

with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

# Replace initializeFirestore with getFirestore
content = content.replace("import { initializeFirestore }", "import { getFirestore }")
content = content.replace(
    'export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, "ai-studio-urbanozeiro-675f17be-1d5e-4948-8a36-ce5490765ddc");',
    'export const db = getFirestore(app, "ai-studio-urbanozeiro-675f17be-1d5e-4948-8a36-ce5490765ddc");'
)

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)
print("firebase.ts patched")

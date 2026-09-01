import sys

with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

content = content.replace("import { getStorage } from 'firebase/storage';", "import { getStorage } from 'firebase/storage';\nimport { getFunctions } from 'firebase/functions';")
content = content + "\nexport const functions = getFunctions(app, 'us-central1');\n"

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)

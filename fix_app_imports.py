import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { auth, db } from './lib/firebase';", "import { auth, db, functions } from './lib/firebase';")
content = content.replace("import { doc, onSnapshot } from 'firebase/firestore';", "import { doc, onSnapshot } from 'firebase/firestore';\nimport { httpsCallable } from 'firebase/functions';")

# fix e parameter
content = content.replace("}).catch(e => console.error(\"Falha na Season:\", e));", "}).catch((e: any) => console.error(\"Falha na Season:\", e));")
content = content.replace("} catch (e) {", "} catch (e: any) {")

with open('src/App.tsx', 'w') as f:
    f.write(content)

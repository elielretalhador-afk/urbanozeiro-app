const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

content = content.replace("import { getFirestore } from 'firebase/firestore';", "import { initializeFirestore } from 'firebase/firestore';");
content = content.replace(
  'export const db = getFirestore(app, "ai-studio-urbanozeiro-675f17be-1d5e-4948-8a36-ce5490765ddc");',
  'export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, "ai-studio-urbanozeiro-675f17be-1d5e-4948-8a36-ce5490765ddc");'
);

fs.writeFileSync('src/lib/firebase.ts', content, 'utf8');
console.log('Firebase patched for long polling');

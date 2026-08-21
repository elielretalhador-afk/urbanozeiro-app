const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = "import { auth } from './lib/firebase';\nimport { onAuthStateChanged } from 'firebase/auth';\nimport { fetchFeed } from './lib/feedService';\n" + content;

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx imports fixed');

const fs = require('fs');
const content = fs.readFileSync('src/services/auth.ts', 'utf8');
console.log(content.includes('signInWithRedirect'));

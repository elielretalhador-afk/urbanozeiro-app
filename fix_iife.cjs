const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace('      })(posToUse); // IIFE to encapsulate original logic', '      } // close IIFE function\n      })(posToUse);');
fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed IIFE');

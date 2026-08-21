const fs = require('fs');
let lines = fs.readFileSync('src/components/PerfilView.tsx', 'utf8').split('\n');

// 1. Fix line 193: it has `      {/* Discreet Seasonal Banner */}` and then nothing, and then `</div>`
// I'll just remove the orphaned `</div>` around line 195.
let content = fs.readFileSync('src/components/PerfilView.tsx', 'utf8');
content = content.replace(/\{\/\* Discreet Seasonal Banner \*\/\}\s*<\/div>/, '');

fs.writeFileSync('src/components/PerfilView.tsx', content, 'utf8');
console.log('Fixed orphaned div');

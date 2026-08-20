const fs = require('fs');
let content = fs.readFileSync('src/components/CreateZoneModal.tsx', 'utf8');

content = content.replace(
  /<\/div>\s*\{\/\* 4\. Cor da Zona \* \*\/\}/,
  `</div>
          )}
          {/* 4. Cor da Zona * */}`
);

fs.writeFileSync('src/components/CreateZoneModal.tsx', content);
console.log('Fixed CreateZoneModal.tsx');

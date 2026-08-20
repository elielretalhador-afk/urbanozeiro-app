const fs = require('fs');
let content = fs.readFileSync('src/components/CreateZoneModal.tsx', 'utf8');

// Hide radius selector if not circle
content = content.replace(
  /\{\/\* 3\. Raio do Território \* \*\/\}/,
  `{/* 3. Raio do Território * */}
          {shapeType === 'circle' && (`
);

content = content.replace(
  /<\/div>\s*\{\/\* 4\. Identidade Visual \* \*\/\}/,
  `</div>
          </div>
          )}
          {/* 4. Identidade Visual * */}`
);

fs.writeFileSync('src/components/CreateZoneModal.tsx', content);
console.log('Patched CreateZoneModal.tsx again');

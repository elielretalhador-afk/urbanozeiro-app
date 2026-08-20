const fs = require('fs');
let content = fs.readFileSync('src/components/CreateZoneModal.tsx', 'utf8');

// Add props
content = content.replace(
  /pickedCoords: \[number, number\] \| null;/,
  `pickedCoords: [number, number] | null;\n  shapeType?: 'circle' | 'segment' | 'zone';\n  drawnPath?: [number, number][];`
);

content = content.replace(
  /pickedCoords,/,
  `pickedCoords,\n  shapeType = 'circle',\n  drawnPath,`
);

// Update handleSubmit
content = content.replace(
  /const coordsToUse: \[number, number\] = pickedCoords[\s\S]*?: \[safeBaseLat, safeBaseLng\];/,
  `const coordsToUse: [number, number] = pickedCoords
      ? [pickedCoords[0], pickedCoords[1]]
      : (drawnPath && drawnPath.length > 0 ? drawnPath[0] : [safeBaseLat, safeBaseLng]);`
);

content = content.replace(
  /createdAt: new Date\(\)\.toISOString\(\),/,
  `createdAt: new Date().toISOString(),\n      shape: shapeType,\n      path: drawnPath || [],\n      creatorId: currentUser.id || 'usr_me',\n      ownerId: currentUser.id || 'usr_me',\n      points: 100,`
);

// Hide radius selector if not circle
content = content.replace(
  /\{\/\* 3\. Raio de Abrangência \*\/\}/,
  `{/* 3. Raio de Abrangência */}
          {shapeType === 'circle' && (`
);

content = content.replace(
  /\{allowedRadii\.map\(\(r\)/,
  `{allowedRadii.map((r)`
);

// We need to close the conditional for radius
content = content.replace(
  /<\/div>\s*\{\/\* 4\. Identidade Visual \* \*\/\}/,
  `</div>
          </div>
          )}
          {/* 4. Identidade Visual * */}`
);

fs.writeFileSync('src/components/CreateZoneModal.tsx', content);
console.log('Patched CreateZoneModal.tsx');

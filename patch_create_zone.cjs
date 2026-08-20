const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `const handleCreateZone = (newZone: Zone) => {
    setZones((prev) => {
      const updated = [newZone, ...prev];
      DatabaseService.updateZoneList(updated).catch(console.error);
      return updated;
    });
    setSelectedZone(newZone);
    showToast(\`🏁 Nova Zona Livre "\${newZone.name}" registrada no mapa!\`);
  };`;

const regex = /const handleCreateZone = \(newZone: Zone\) => \{\n\s*setZones\(\(prev\) => \[newZone, \.\.\.prev\]\);\n\s*setSelectedZone\(newZone\);\n\s*showToast\(\`🏁 Nova Zona Livre "\$\{newZone\.name\}" registrada no mapa!\`\);\n\s*\};/m;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);

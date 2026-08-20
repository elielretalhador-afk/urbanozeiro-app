const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const autoSaveEffect = `
  useEffect(() => {
    if (isDbReady && zones.length > 0) {
      DatabaseService.updateZoneList(zones).catch(console.error);
    }
  }, [zones, isDbReady]);
`;

content = content.replace(
  /const \[zones, setZones\] = useState<Zone\[\]>\(\[\]\);/,
  `const [zones, setZones] = useState<Zone[]>([]);\n${autoSaveEffect}`
);

fs.writeFileSync('src/App.tsx', content);

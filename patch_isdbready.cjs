const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Move isDbReady definition up
const isDbReadyDef = `  const [isDbReady, setIsDbReady] = useState<boolean>(false);`;
const isDbErrorDef = `  const [dbError, setDbError] = useState<any>(null);`;
content = content.replace(isDbReadyDef, '');
content = content.replace(isDbErrorDef, '');

content = content.replace(
  /export default function App\(\) \{/,
  `export default function App() {\n${isDbReadyDef}\n${isDbErrorDef}`
);

// Fix TS error for saveActivity
content = content.replace(
  /DatabaseService\.saveActivity\(newActivity\)\.catch\(console\.error\);/,
  `DatabaseService.saveActivity(newActivity as any).catch(console.error);`
);

fs.writeFileSync('src/App.tsx', content);

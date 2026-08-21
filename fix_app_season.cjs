const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove isSeasonHubOpen state
content = content.replace(/const \[isSeasonHubOpen, setIsSeasonHubOpen\] = useState\(false\);\n/, '');

// Remove handleOpenSeasonHub
content = content.replace(/const handleOpenSeasonHub = \(tab\?: any\) => \{[\s\S]*?\};\n/, '');

// Remove SeasonHubModal rendering
content = content.replace(/\{\/\* Modal: Central de Temporadas[\s\S]*?SeasonHubModal[\s\S]*?\/>\s*\}/, '');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed Season Hub in App');

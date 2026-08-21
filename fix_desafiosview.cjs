const fs = require('fs');
let content = fs.readFileSync('src/components/DesafiosView.tsx', 'utf8');

// Remove MISSÕES URBANAS button
content = content.replace(/<button[\s\S]*?id="tab-toggle-desafios-urbanos"[\s\S]*?<\/button>/, '');

// Adjust grid columns from 3 to 2
content = content.replace(/grid-cols-3/, 'grid-cols-2');

// If initial mode is 'urbanos', change to 'diretos'
content = content.replace(/initialTab = 'urbanos'/g, "initialTab = 'diretos'");
content = content.replace(/const \[activeMode, setActiveMode\] = useState<'urbanos' \| 'diretos' \| 'eventos'>\(initialTab\);/, "const [activeMode, setActiveMode] = useState<'urbanos' | 'diretos' | 'eventos'>('diretos');");

// Remove MissionsHub rendering
content = content.replace(/\{activeMode === 'urbanos' && \([\s\S]*?MissionsHub[\s\S]*?\)\}/, '');

fs.writeFileSync('src/components/DesafiosView.tsx', content, 'utf8');
console.log('Fixed DesafiosView');

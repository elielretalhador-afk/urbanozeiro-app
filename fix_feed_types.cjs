const fs = require('fs');
let content = fs.readFileSync('src/components/FeedView.tsx', 'utf8');

// Fix ActivityFilterType
content = content.replace(/'AMIGOS'/g, "'MEUS_AMIGOS'");

// Fix initialFilter prop
content = content.replace('  blockedIds?: string[];\n}', '  blockedIds?: string[];\n  initialFilter?: ActivityFilterType;\n}');
content = content.replace('  blockedIds = [],\n}) => {', '  blockedIds = [],\n  initialFilter = "TODAS",\n}) => {');

// Use initialFilter
content = content.replace(/const \[activeFilter, setActiveFilter\] = useState<ActivityFilterType>\('TODAS'\);/, 'const [activeFilter, setActiveFilter] = useState<ActivityFilterType>(initialFilter || "TODAS");');

// Fix playerName to playerNickname
content = content.replace(/act\.playerName/g, 'act.playerNickname');

// Also App.tsx passes initialTab instead of initialFilter? The error said: "Property 'initialFilter' does not exist on type". Wait, earlier error said `initialTab={activeSocialTab}` in App.tsx line 2705?
// Let's check App.tsx around line 2774 to see what it passes.

fs.writeFileSync('src/components/FeedView.tsx', content, 'utf8');
console.log('Fixed FeedView types');

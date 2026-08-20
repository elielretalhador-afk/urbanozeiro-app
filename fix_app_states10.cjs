const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/const allZoneActivitiesRef = useRef<Map<string, any>>\(new Map\(\)\);/, 'const allZoneActivitiesRef = useRef<any[]>([]);');
content = content.replace(/activeZoneActivitiesRef\.current = \[\];/, 'activeZoneActivitiesRef.current.clear();');
content = content.replace(/setPendingZonePrompt\(\(curr\) => \(/, 'setPendingZonePrompt((curr: any) => (');

fs.writeFileSync('src/App.tsx', content);

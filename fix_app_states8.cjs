const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/const promptedZonesRef = useRef<any\[\]>\(\[\]\);/, 'const promptedZonesRef = useRef<Set<string>>(new Set());');
content = content.replace(/const captureAttemptsRef = useRef<any\[\]>\(\[\]\);/, 'const captureAttemptsRef = useRef<Map<string, any>>(new Map());');
content = content.replace(/const sessionVisitedZonesRef = useRef<Map<string, any>>\(new Map\(\)\);/g, 'const sessionVisitedZonesRef = useRef<Map<string, SessionZoneVisit>>(new Map());');

fs.writeFileSync('src/App.tsx', content);

const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The conquest definitive block:
// if (attempt.distanceInsideZone >= attempt.minDistanceMeters) {
//     attempt.status = 'completed';

const injectCode = `
                        // --- INJECT ACTIVITY FEED ---
                        const newAct = FeedService.createZoneConqueredActivity(
                           z.name,
                           z.id,
                           currentUserProfile,
                           z.dominance || 100
                        );
                        setActivities(prev => [newAct, ...prev]);
                        // ----------------------------
`;

// There are two places where attempt.status = 'completed'; occurs: 
// One in the real GPS and one in the test simulator

// In GPS tracker
content = content.replace(
  /attempt\.status = 'completed';\n\s*attempt\.active = false;\n\s*const currentUserProfile = userRef\.current;/,
  `attempt.status = 'completed';\n                        attempt.active = false;\n                        const currentUserProfile = userRef.current;\n${injectCode}`
);

// In simulator
content = content.replace(
  /attempt\.status = 'completed';\n\s*attempt\.active = false;\n\s*const nowIso = new Date\(now\)\.toISOString\(\);/,
  `attempt.status = 'completed';\n      attempt.active = false;\n      const nowIso = new Date(now).toISOString();\n${injectCode}`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched Zone Captures in App.tsx');

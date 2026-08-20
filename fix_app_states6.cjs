const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix Map/Set errors
content = content.replace(/useRef<any\[\]>\(\[\]\);/g, (match, offset) => {
  if (content.slice(offset - 40, offset).includes('promptedZonesRef')) return 'useRef<Map<string, any>>(new Map());';
  if (content.slice(offset - 40, offset).includes('captureAttemptsRef')) return 'useRef<Map<string, any>>(new Map());';
  return match;
});

// Fix handleGainXP
content = content.replace(/const handleGainXP = \(xp: number, reason: string\) =>/g, 'const handleGainXP = (xp: number, reason: string, a?: any, b?: any) =>');

// Fix syncConquestProgresses
content = content.replace(/const syncConquestProgresses = \(\) =>/g, 'const syncConquestProgresses = (a?: any) =>');

// Fix loadInitialFeed
content = content.replace(/const loadInitialFeed = async \(\) =>/g, 'const loadInitialFeed = async (userId: string) =>');

// Fix the duplicated setIsProgressionHubModalOpen
content = content.replace(/const setIsProgressionHubModalOpen = \(val: boolean\) => \{ setIsProgressionHubModalOpenState\(val\); \};\n  const \[isProgressionHubModalOpenState, setIsProgressionHubModalOpenState\] = useState\(false\);/, '');

// Fix handleFocusLiveChallengeParticipant mismatch 1966
content = content.replace(/handleFocusLiveChallengeParticipant/g, '((coords: any) => {})');

// Replace handleEquipTitle directly in App.tsx
content = content.replace(/onEquipTitle=\{handleEquipTitle\}/g, 'onEquipTitle={(t) => handleEquipTitle(t.id)}');

fs.writeFileSync('src/App.tsx', content);

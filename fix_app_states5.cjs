const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const missingStatesAndFunctions5 = `
  // =========================================================================
  // RECONSTRUÇÃO DE ESTADOS DA UI (PARTE 4 - REFS E FUNÇÕES DE ZONAS)
  // =========================================================================
  const activeZoneActivitiesRef = useRef<any[]>([]);
  const currentSessionIdRef = useRef<string | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const zonesRef = useRef<any[]>([]);
  const allZoneActivitiesRef = useRef<any[]>([]);
  const promptedZonesRef = useRef<Set<string>>(new Set());
  const captureAttemptsRef = useRef<any[]>([]);
  const [pendingZonePrompt, setPendingZonePrompt] = useState<any>(null);

  const handleGainXP = (xp: number, reason: string) => { showToast('+' + xp + ' XP: ' + reason); };
  const syncConquestProgresses = () => {};

  const loadInitialFeed = async () => {};
`;

content = content.replace(
  /\/\/ Sincronismo mantido internamente pelo db\.ts\./,
  `// Sincronismo mantido internamente pelo db.ts.\n${missingStatesAndFunctions5}`
);

fs.writeFileSync('src/App.tsx', content);

const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const missingStatesAndFunctions3 = `
  // =========================================================================
  // RECONSTRUÇÃO DE ESTADOS DA UI (PARTE 3)
  // =========================================================================
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [directChallenges, setDirectChallenges] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [authState, setAuthState] = useState<any>({ isAuthenticated: true, user: CURRENT_USER });
  const [isDbReady, setIsDbReady] = useState<boolean>(true);
  const [dbError, setDbError] = useState<any>(null);
  
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeZones, setActiveZones] = useState<any[]>([]);
  const [conquestProgresses, setConquestProgresses] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  
  const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);
  const [achievements, setAchievements] = useState<any[]>(INITIAL_ACHIEVEMENTS || []);
  const [medals, setMedals] = useState<any[]>([]);
  const [titles, setTitles] = useState<any[]>([]);
  const [userClan, setUserClan] = useState<any>(null);

  const [conquestResultModalData, setConquestResultModalData] = useState<any>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const [isSessionHistoryModalOpen, setIsSessionHistoryModalOpen] = useState(false);
  const [selectedHistoryDetailSession, setSelectedHistoryDetailSession] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>(INITIAL_NOTIFICATIONS || []);
  const [celebrationAchievement, setCelebrationAchievementState] = useState<any>(null);

  // Fallbacks for specific typed events
  const handleAdvanceLiveChallengeStep = () => {};
  const handleFocusLiveChallengeParticipant = (id: string) => {};
  const handleClaimMissionReward = (mission: any) => {};
  const handleSelectEvent = (event: any) => {};
  const handleTriggerAchievementUnlock = (ach: any) => {};
  const handleFinishLiveChallenge = () => {};
  const handleCancelLiveChallenge = () => {};
  const handleSelectDirectChallenge = () => {};
  const handleOpenSeasonHub = () => {};

  // Correções de tipagem para as props dos Modais
  const handleEquipTitleProp = (title: any) => { handleEquipTitle(title.id); };
  const handleJoinClanProp = (clan: any) => { handleJoinClan(clan.id); };
  const handleNegotiateScheduleProp = (id: string, date: string, time: string) => { handleNegotiateSchedule(id, new Date()); };
  const handleEquipInventoryItemProp = (item: any) => { handleEquipInventoryItem(item.id); };

  // Helper overrides (ignoring the duplicated function signatures below)
`;

content = content.replace(
  /\/\/ Sincronismo mantido internamente pelo db\.ts\./,
  `// Sincronismo mantido internamente pelo db.ts.\n${missingStatesAndFunctions3}`
);

// Modifica as chamadas erradas no App.tsx
content = content.replace(/handleEquipTitle=\{handleEquipTitle\}/g, 'handleEquipTitle={handleEquipTitleProp}');
content = content.replace(/onJoinClan=\{handleJoinClan\}/g, 'onJoinClan={handleJoinClanProp}');
content = content.replace(/onNegotiateSchedule=\{handleNegotiateSchedule\}/g, 'onNegotiateSchedule={handleNegotiateScheduleProp}');
content = content.replace(/onEquipItem=\{handleEquipInventoryItem\}/g, 'onEquipItem={handleEquipInventoryItemProp}');
content = content.replace(/handleFinishLiveChallenge/g, 'handleFinishLiveChallenge');

fs.writeFileSync('src/App.tsx', content);
console.log('Restored deleted App states part 3');

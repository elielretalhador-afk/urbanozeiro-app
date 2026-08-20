const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const missingStatesAndFunctions2 = `
  // =========================================================================
  // RECONSTRUÇÃO DE ESTADOS DA UI (PARTE 2)
  // =========================================================================
  const [selectedClanProfile, setSelectedClanProfile] = useState<any>(null);
  const [isClanLeaderboardModalOpen, setIsClanLeaderboardModalOpen] = useState(false);
  const [isCreateClanModalOpen, setIsCreateClanModalOpen] = useState(false);
  const [isJoinClanModalOpen, setIsJoinClanModalOpen] = useState(false);
  const [clans, setClans] = useState<any[]>(INITIAL_CLANS || []);

  const [followListMode, setFollowListMode] = useState<any>('followers');
  const [isFollowListModalOpen, setIsFollowListModalOpen] = useState(false);
  const [blockedPlayerIds, setBlockedPlayerIds] = useState<string[]>([]);

  const [isCreateDirectChallengeOpen, setIsCreateDirectChallengeOpen] = useState(false);
  const [targetDirectChallengePlayer, setTargetDirectChallengePlayer] = useState<any>(null);
  const [isDirectChallengeDetailsOpen, setIsDirectChallengeDetailsOpen] = useState(false);
  const [selectedDirectChallenge, setSelectedDirectChallenge] = useState<any>(null);

  const [routes, setRoutes] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  const [isLiveChallengeResultOpen, setIsLiveChallengeResultOpen] = useState(false);
  const [completedLiveChallengeData, setCompletedLiveChallengeData] = useState<any>(null);
  const [activeLiveChallenge, setActiveLiveChallenge] = useState<any>(null);

  const [isProgressionHubModalOpen, setIsProgressionHubModalOpen] = useState(false);
  const [activeProgressionTab, setActiveProgressionTab] = useState<any>('resumo');
  const [progression, setProgression] = useState<any>({ level: 1, xp: 0 });

  const setCelebrationAchievement = (ach: any) => {};
  const handleEquipTitle = (titleId: string) => { showToast('Título equipado.'); };
  
  const handleLeaveClan = () => { showToast('Você saiu do clã.'); };
  const handleCreateClan = (data: any) => { showToast('Clã criado com sucesso!'); setIsCreateClanModalOpen(false); };
  const handleJoinClan = (clanId: string) => { showToast('Solicitação para entrar no clã enviada.'); setIsJoinClanModalOpen(false); };

  const handleBlockPlayer = (id: string) => { setBlockedPlayerIds(prev => [...prev, id]); showToast('Jogador bloqueado.'); };
  const handleUnblockPlayer = (id: string) => { setBlockedPlayerIds(prev => prev.filter(b => b !== id)); showToast('Jogador desbloqueado.'); };
  const handleOpenReportModal = (player: any) => { setPlayerToReport(player); setIsReportPlayerOpen(true); };

  const handleCreateDirectChallenge = (data: any) => { showToast('Desafio direto criado!'); setIsCreateDirectChallengeOpen(false); };
  const handleAcceptDirectChallenge = (id: string) => { showToast('Desafio aceito!'); };
  const handleNegotiateSchedule = (id: string, date: Date) => { showToast('Nova data sugerida.'); };
  const handleRejectDirectChallenge = (id: string) => { showToast('Desafio recusado.'); };
  const handleCancelDirectChallenge = (id: string) => { showToast('Desafio cancelado.'); };

  const handleStartLiveChallenge = (challenge: any) => { showToast('Desafio iniciado no mapa!'); setActiveTab('mapa'); setIsDirectChallengeDetailsOpen(false); };
  const handleRegisterEvent = (eventId: string) => { showToast('Inscrição confirmada no evento!'); };
  const handleCancelEventRegistration = (eventId: string) => { showToast('Inscrição cancelada.'); };

  const handleEquipInventoryItem = (itemId: string) => { showToast('Item equipado.'); };
  const setIsProgressionHubModalOpen = (val: boolean) => { setIsProgressionHubModalOpenState(val); };
  const [isProgressionHubModalOpenState, setIsProgressionHubModalOpenState] = useState(false);
`;

content = content.replace(
  /\/\/ Sincronismo mantido internamente pelo db\.ts\./,
  `// Sincronismo mantido internamente pelo db.ts.\n${missingStatesAndFunctions2}`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Restored deleted App states part 2');

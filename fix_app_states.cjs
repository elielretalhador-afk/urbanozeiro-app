const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const missingStatesAndFunctions = `

  // =========================================================================
  // RECONSTRUÇÃO DE ESTADOS DA UI (MODALS)
  // =========================================================================
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
  const [levelUpModalData, setLevelUpModalData] = useState<any>(null);

  const [isSocialHubOpen, setIsSocialHubOpen] = useState(false);
  const [socialPlayers, setSocialPlayers] = useState<any[]>([]);
  const [socialRelationships, setSocialRelationships] = useState<any[]>([]);
  const [socialActivities, setSocialActivities] = useState<any[]>([]);
  const [socialPrivacySettings, setSocialPrivacySettings] = useState<any>({});
  const [selectedPublicPlayer, setSelectedPublicPlayer] = useState<any>(null);
  const [activeSocialTab, setActiveSocialTab] = useState<any>('amigos');

  const [isReportPlayerOpen, setIsReportPlayerOpen] = useState(false);
  const [playerToReport, setPlayerToReport] = useState<any>(null);

  const [isSeasonHubOpen, setIsSeasonHubOpen] = useState(false);
  const [activeSeasonTab, setActiveSeasonTab] = useState<any>('temporada');

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [wallet, setWallet] = useState<any>({ coins: 0, history: [] });

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [accountStatus, setAccountStatus] = useState<any>({ isBanned: false, trustScore: 100 });
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [playerReports, setPlayerReports] = useState<any[]>([]);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [playerSettings, setPlayerSettings] = useState<any>(DEFAULT_PLAYER_SETTINGS);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [tutorialState, setTutorialState] = useState<any>({ currentStep: 0, isCompleted: false, isSkipped: false });

  const [isHelpSupportModalOpen, setIsHelpSupportModalOpen] = useState(false);

  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [activeHonorsTab, setActiveHonorsTab] = useState<any>('conquistas');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleTriggerLevelUpDemo = () => { setIsLevelUpModalOpen(true); };
  const handleOpenProgressionHub = (tab: any) => { setActiveHonorsTab(tab); setIsAchievementsModalOpen(true); };
  const handleOpenCreateDirectChallenge = (player: any) => { showToast('Criar desafio com ' + player.nickname); };
  
  const handleSendFriendRequest = (id: string) => { showToast('Solicitação de amizade enviada!'); };
  const handleAcceptFriendRequest = (id: string) => { showToast('Solicitação aceita!'); };
  const handleDeclineFriendRequest = (id: string) => { showToast('Solicitação recusada!'); };
  const handleCancelFriendRequest = (id: string) => { showToast('Solicitação cancelada.'); };
  const handleRemoveFriend = (id: string) => { showToast('Amigo removido.'); };
  const handleToggleFollow = (id: string) => { showToast('Status de seguir atualizado.'); };
  
  const handleToggleActivityLike = (id: string) => { showToast('Curtida atualizada.'); };
  const handleSubmitPlayerReport = (report: any) => { showToast('Denúncia enviada com sucesso!'); setIsReportPlayerOpen(false); };
  
  const handleEarnCoins = (amount: number, source: any, desc: string, relatedId?: string) => { setWallet((prev: any) => ({...prev, coins: prev.coins + amount})); };
  const handleSpendCoins = (amount: number, source: any, desc: string, relatedId?: string) => { 
    if (wallet.coins >= amount) { setWallet((prev: any) => ({...prev, coins: prev.coins - amount})); return true; } 
    return false; 
  };
  const handleSimulateAdReward = () => { handleEarnCoins(50, 'AD_REWARD', 'Anúncio Assistido'); showToast('Recompensa recebida!'); };
  
  const handleSimulateGpsAnomaly = () => { showToast('Anomalia de GPS detectada.'); };
  const handleSimulateDuplicateRewardCheck = () => { showToast('Verificação de recompensa duplicada.'); };
  const handleReportPlayer = (id: string) => { setIsReportPlayerOpen(true); setPlayerToReport({ id }); };
  
  const handleUpdatePlayerSettings = (settings: any) => { setPlayerSettings(settings); showToast('Configurações atualizadas!'); };
  const handleOpenSocialHub = (tab: any) => { setActiveSocialTab(tab); setIsSocialHubOpen(true); };
  const handleUpdateTutorial = (state: any) => { setTutorialState(state); };

`;

content = content.replace(
  /\/\/ Sincronismo mantido internamente pelo db\.ts\./,
  `// Sincronismo mantido internamente pelo db.ts.\n${missingStatesAndFunctions}`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Restored deleted App states');

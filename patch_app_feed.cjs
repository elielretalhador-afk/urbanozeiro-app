const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Adicionar states de paginação no Feed
content = content.replace(
  /const \[activityFeedInitialFilter, setActivityFeedInitialFilter\] = useState<ActivityFilterType>\('TODAS'\);/,
  `const [activityFeedInitialFilter, setActivityFeedInitialFilter] = useState<ActivityFilterType>('TODAS');
  const [feedHasMore, setFeedHasMore] = useState<boolean>(true);
  const [feedLastDocId, setFeedLastDocId] = useState<string | undefined>(undefined);
  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(false);`
);

// Atualizar o useEffect inicial para não carregar TODO o feed, e sim a página inicial se necessário
// Vamos remover setActivities(FeedService.getActivitiesDB()); do useEffect
content = content.replace(
  /setActivities\(FeedService\.getActivitiesDB\(\)\);/,
  `// setActivities(FeedService.getActivitiesDB()); // Removido para evitar carga total
      loadInitialFeed(user.id);`
);

// Vamos injetar a função loadInitialFeed
const feedFunctions = `
  const loadInitialFeed = async (userId: string) => {
    setIsLoadingFeed(true);
    try {
      // Usa paginação em vez de leitura completa
      const followingIds = socialPlayers.filter(p => p.isFollowing).map(p => p.id);
      const res = await FeedService.getFeedPaginated(userId, followingIds, 10);
      setActivities(res.data);
      setFeedLastDocId(res.lastDocId);
      setFeedHasMore(res.hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  const loadMoreActivities = async () => {
    if (isLoadingFeed || !feedHasMore || !user) return;
    setIsLoadingFeed(true);
    try {
      const followingIds = socialPlayers.filter(p => p.isFollowing).map(p => p.id);
      const res = await FeedService.getFeedPaginated(user.id, followingIds, 10, feedLastDocId);
      setActivities(prev => [...prev, ...res.data]);
      setFeedLastDocId(res.lastDocId);
      setFeedHasMore(res.hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingFeed(false);
    }
  };
`;

content = content.replace(
  /useEffect\(\(\) => \{\n    try \{\n      localStorage.setItem\('urbanozeiro_activities'/,
  `${feedFunctions}\n  useEffect(() => {
    try {
      localStorage.setItem('urbanozeiro_activities'`
);

// Otimizar leitura de ZONAS: carregar via DatabaseService.getZonesInRegion() no lugar de InitialZONES puro se possível
// Porem, no App.tsx ele pega 'zones' do initializeApp() no mount.
// Vamos manter o 'zones' sendo populado inicialmente (como fallback do initialize),
// mas a lógica para futuro Firebase está preparada no db.ts.

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx feed pagination');

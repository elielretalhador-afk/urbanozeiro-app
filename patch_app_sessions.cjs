const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const sessionStateCode = `
  // =========================================================================
  // HISTÓRICO DE SESSÕES (OTIMIZADO PARA PREVENÇÃO DE READS)
  // =========================================================================
  const [sessionHistory, setSessionHistory] = useState<ActivitySession[]>([]);

  useEffect(() => {
    // PREPARAÇÃO FIRESTORE:
    // Evita carregar o histórico inteiro do jogador no mount da aplicação.
    // Inicialmente carregamos apenas a primeira página para estatísticas básicas,
    // e o restante será carregado sob demanda.
    const loadInitialSessions = async () => {
      try {
        if (user) {
          const res = await DatabaseService.getSessionsPaginated(user.id, 10);
          setSessionHistory(res.data);
        }
      } catch (e) {
        console.error('Error loading sessions via Service', e);
        setSessionHistory(INITIAL_SESSION_HISTORY);
      }
    };
    if (user) {
      loadInitialSessions();
    }
  }, [user]);

  // Sincronismo mantido internamente pelo db.ts.
`;

content = content.replace(
  /const \[sessionHistory, setSessionHistory\] = useState<ActivitySession\[\]>\(\(\) => \{[\s\S]*?\}, \[sessionHistory\]\);/,
  sessionStateCode
);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx sessions');

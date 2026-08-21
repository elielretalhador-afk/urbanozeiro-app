const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const [authState, setAuthState] = useState<any>('LOADING');`;

const replacement = `  const [authState, setAuthState] = useState<any>('LOADING');
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await AuthService.getCurrentUser();
        if (session) {
          setAuthState('AUTHENTICATED');
        } else {
          setAuthState('UNAUTHENTICATED');
        }
      } catch (err) {
        setAuthState('UNAUTHENTICATED');
      }
    };
    initAuth();
  }, []);`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Added initAuth');

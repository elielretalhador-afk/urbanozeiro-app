const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const authCheck = `
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(prev => {
          if (prev.authId === firebaseUser.uid) return prev;
          const updated = { ...prev, authId: firebaseUser.uid };
          localStorage.setItem('urbanozeiro_user', JSON.stringify(updated));
          return updated;
        });
      } else {
        // If they are not in firebase but have a local token, clear it to force re-login
        if (localStorage.getItem('urbanozeiro_auth_token')) {
            localStorage.removeItem('urbanozeiro_auth_token');
            setAuthState('UNAUTHENTICATED');
        }
      }
    });
    return () => unsubscribe();
  }, []);
`;

content = content.replace(/  useEffect\(\(\) => \{\n    const unsubscribe = onAuthStateChanged\(auth, \(firebaseUser\) => \{[\s\S]*?return \(\) => unsubscribe\(\);\n  \}, \[\]\);/, authCheck);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx forced reauth patched');

const fs = require('fs');

let authTs = fs.readFileSync('src/services/auth.ts', 'utf8');

// Add Capacitor and signInWithRedirect imports
if (!authTs.includes('signInWithRedirect')) {
  authTs = authTs.replace(
    'signInWithPopup,',
    'signInWithPopup,\n  signInWithRedirect,\n  getRedirectResult,'
  );
}
if (!authTs.includes('@capacitor/core')) {
  authTs = "import { Capacitor } from '@capacitor/core';\n" + authTs;
}

// Replace loginWithGoogle
const newLoginWithGoogle = `
  async loginWithGoogle(): Promise<AuthUser | void> {
    const provider = new GoogleAuthProvider();
    
    if (Capacitor.isNativePlatform()) {
      await signInWithRedirect(auth, provider);
      return; // Execution stops here as the page will redirect
    } else {
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
          
      const username = fbUser.displayName || 'GooglePlayer';
      const email = fbUser.email || '';

      try {
        await setDoc(doc(db, 'users', fbUser.uid), {
          uid: fbUser.uid,
          username: username,
          email: email
        }, { merge: true });
      } catch (e) {}

      const sessionUser: AuthUser = {
        uid: fbUser.uid,
        username: username,
        email: email || undefined,
        accountVerified: true,
        authProvider: 'google'
      };
          
      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(sessionUser));
      return sessionUser;
    }
  },

  async handleRedirectResult(): Promise<AuthUser | null> {
    try {
      const result = await getRedirectResult(auth);
      if (!result || !result.user) return null;
      
      const fbUser = result.user;
      const username = fbUser.displayName || 'GooglePlayer';
      const email = fbUser.email || '';

      try {
        await setDoc(doc(db, 'users', fbUser.uid), {
          uid: fbUser.uid,
          username: username,
          email: email
        }, { merge: true });
      } catch (e) {}

      const sessionUser: AuthUser = {
        uid: fbUser.uid,
        username: username,
        email: email || undefined,
        accountVerified: true,
        authProvider: 'google'
      };
      
      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(sessionUser));
      return sessionUser;
    } catch (error) {
      console.error("Erro no getRedirectResult:", error);
      throw error;
    }
  },
`;

authTs = authTs.replace(/async loginWithGoogle\(\)[\s\S]*?requestPasswordReset/m, newLoginWithGoogle + '\n  async requestPasswordReset');

fs.writeFileSync('src/services/auth.ts', authTs, 'utf8');
console.log('auth.ts updated');

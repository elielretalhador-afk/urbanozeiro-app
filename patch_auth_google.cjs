const fs = require('fs');
let content = fs.readFileSync('src/services/auth.ts', 'utf8');

if (!content.includes('import { auth } from')) {
    content = "import { auth } from '../lib/firebase';\nimport { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';\n" + content;
}

const newLoginWithGoogle = `
  async loginWithGoogle(): Promise<AuthUser> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;

    const db = getUsersDB();
    let userRecord = Object.values(db).find(u => u.uid === fbUser.uid || u.email === fbUser.email);
    
    if (userRecord) {
      if (userRecord.authProvider !== 'google') {
        userRecord.authProvider = 'google';
        userRecord.accountVerified = true;
        userRecord.uid = fbUser.uid; // Align UID
        saveUsersDB(db);
      }
    } else {
      userRecord = {
        uid: fbUser.uid,
        username: fbUser.displayName || 'GooglePlayer',
        email: fbUser.email || undefined,
        accountVerified: true,
        authProvider: 'google'
      };
      db[fbUser.uid] = userRecord;
      saveUsersDB(db);
    }

    const sessionUser: AuthUser = {
      uid: userRecord.uid,
      username: userRecord.username,
      email: userRecord.email,
      phone: userRecord.phone,
      accountVerified: userRecord.accountVerified,
      authProvider: userRecord.authProvider
    };

    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },
`;

content = content.replace(/  async loginWithGoogle\(\): Promise<AuthUser> \{[\s\S]*?return sessionUser;\n  \},/m, newLoginWithGoogle);

// Also patch logout to signOut from firebase
content = content.replace(
  /  async logout\(\): Promise<void> \{\n    await delay\(300\);\n    localStorage\.removeItem\(AUTH_TOKEN_KEY\);\n  \},/,
  '  async logout(): Promise<void> {\n    await delay(300);\n    localStorage.removeItem(AUTH_TOKEN_KEY);\n    try { await signOut(auth); } catch(e) {}\n  },'
);

fs.writeFileSync('src/services/auth.ts', content, 'utf8');
console.log('AuthService patched for Google Login');

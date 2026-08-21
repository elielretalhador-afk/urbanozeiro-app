const fs = require('fs');
let content = fs.readFileSync('src/services/auth.ts', 'utf8');

// Replace everything with a Firebase-backed AuthService
const newContent = `import { auth } from '../lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';

// ==========================================
// SERVIÇO DE AUTENTICAÇÃO E IDENTIDADE
// ==========================================
export interface AuthUser {
  uid: string; // Equivalente ao playerId
  username: string;
  email?: string;
  phone?: string;
  accountVerified: boolean;
  authProvider: 'local' | 'google';
}

const AUTH_TOKEN_KEY = 'urbanozeiro_auth_token';

export const AuthService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const savedSession = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!savedSession) return null;
      
      const session = JSON.parse(savedSession) as AuthUser;
      return session;
    } catch {
      return null;
    }
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    
    const sessionUser: AuthUser = {
      uid: fbUser.uid,
      username: fbUser.displayName || email.split('@')[0],
      email: fbUser.email || undefined,
      accountVerified: true,
      authProvider: 'local'
    };
    
    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  async register(username: string, email: string, password: string): Promise<AuthUser> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    
    await updateProfile(fbUser, {
      displayName: username
    });
    
    const sessionUser: AuthUser = {
      uid: fbUser.uid,
      username: username,
      email: fbUser.email || undefined,
      accountVerified: true,
      authProvider: 'local'
    };
    
    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    try { await signOut(auth); } catch(e) {}
  },

  async loginWithGoogle(): Promise<AuthUser> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    
    const sessionUser: AuthUser = {
      uid: fbUser.uid,
      username: fbUser.displayName || 'GooglePlayer',
      email: fbUser.email || undefined,
      accountVerified: true,
      authProvider: 'google'
    };
    
    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  async requestPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }
};
`;

fs.writeFileSync('src/services/auth.ts', newContent, 'utf8');
console.log('AuthService replaced with Firebase implementation');

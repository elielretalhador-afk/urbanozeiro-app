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

interface LocalAuthRecord {
  uid: string;
  username: string;
  passwordHash?: string;
  email?: string;
  phone?: string;
  accountVerified: boolean;
  authProvider: 'local' | 'google';
  verificationCode?: string;
  resetCode?: string;
}

const AUTH_TOKEN_KEY = 'urbanozeiro_auth_token';
const USERS_DB_KEY = 'urbanozeiro_auth_users';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const getUsersDB = (): Record<string, LocalAuthRecord> => {
  try {
    const data = localStorage.getItem(USERS_DB_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveUsersDB = (db: Record<string, LocalAuthRecord>) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
};

export const AuthService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    await delay(300);
    try {
      const savedSession = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!savedSession) return null;
      
      const session = JSON.parse(savedSession) as AuthUser;
      const db = getUsersDB();
      const userRecord = db[session.uid];
      
      if (!userRecord) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        return null;
      }
      
      return {
        uid: userRecord.uid,
        username: userRecord.username,
        email: userRecord.email,
        phone: userRecord.phone,
        accountVerified: userRecord.accountVerified,
        authProvider: userRecord.authProvider
      };
    } catch {
      return null;
    }
  },

  async login(username: string, password: string): Promise<AuthUser> {
    await delay(800);
    const db = getUsersDB();
    
    // Find user by username
    const userRecord = Object.values(db).find(
      u => u.username.toLowerCase() === username.toLowerCase()
    );

    if (!userRecord) {
      throw new Error("Usuário ou senha incorretos.");
    }

    if (userRecord.authProvider === 'google' && !userRecord.passwordHash) {
      throw new Error("Conta conectada com Google. Utilize 'Continuar com Google'.");
    }

    const hashed = await hashPassword(password);
    if (userRecord.passwordHash !== hashed) {
      throw new Error("Usuário ou senha incorretos.");
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

  async register(username: string, password: string, contact: string): Promise<AuthUser> {
    await delay(1000);
    const db = getUsersDB();
    
    if (Object.values(db).some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error("Este nome de usuário já está em uso.");
    }

    const isEmail = contact.includes('@');
    const email = isEmail ? contact : undefined;
    const phone = !isEmail ? contact : undefined;

    if (email && Object.values(db).some(u => u.email === email)) {
      throw new Error("Este e-mail já está em uso.");
    }
    if (phone && Object.values(db).some(u => u.phone === phone)) {
      throw new Error("Este telefone já está em uso.");
    }

    const hashed = await hashPassword(password);
    const newUid = 'usr_' + crypto.randomUUID().replace(/-/g, '').substring(0, 16);
    
    const newUser: LocalAuthRecord = {
      uid: newUid,
      username,
      passwordHash: hashed,
      email,
      phone,
      accountVerified: false,
      authProvider: 'local',
      verificationCode: '123456' // Mock verification code
    };

    db[newUid] = newUser;
    saveUsersDB(db);

    const sessionUser: AuthUser = {
      uid: newUser.uid,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      accountVerified: newUser.accountVerified,
      authProvider: newUser.authProvider
    };

    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  async logout(): Promise<void> {
    await delay(300);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  async verifyAccount(code: string): Promise<void> {
    await delay(500);
    const session = await this.getCurrentUser();
    if (!session) throw new Error("Sessão inválida.");

    const db = getUsersDB();
    const user = db[session.uid];

    if (!user) throw new Error("Usuário não encontrado.");
    
    // Hardcoded bypass code for the mock
    if (code !== '123456' && code !== user.verificationCode) {
      throw new Error("Código inválido. Verifique e tente novamente.");
    }

    user.accountVerified = true;
    user.verificationCode = undefined;
    saveUsersDB(db);

    const updatedSession = { ...session, accountVerified: true };
    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(updatedSession));
  },

  async resendVerificationCode(): Promise<void> {
    await delay(800);
    const session = await this.getCurrentUser();
    if (!session) throw new Error("Sessão inválida.");
    // In a real app, integrate with email/SMS provider, and rate limit.
  },

  async loginWithGoogle(): Promise<AuthUser> {
    await delay(1200);
    // MOCK GOOGLE LOGIN
    const mockGoogleEmail = "google.user@example.com";
    const mockGoogleName = "GooglePlayer" + Math.floor(Math.random() * 1000);
    
    const db = getUsersDB();
    
    let userRecord = Object.values(db).find(u => u.email === mockGoogleEmail);

    if (userRecord) {
      // Account exists, associate if not already google, but here we just login
      if (userRecord.authProvider !== 'google') {
        userRecord.authProvider = 'google';
        userRecord.accountVerified = true;
        saveUsersDB(db);
      }
    } else {
      const newUid = 'usr_g_' + crypto.randomUUID().replace(/-/g, '').substring(0, 12);
      userRecord = {
        uid: newUid,
        username: mockGoogleName,
        email: mockGoogleEmail,
        accountVerified: true,
        authProvider: 'google'
      };
      db[newUid] = userRecord;
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

  async requestPasswordReset(contact: string): Promise<void> {
    await delay(800);
    const db = getUsersDB();
    const userRecord = Object.values(db).find(u => u.email === contact || u.phone === contact);
    if (!userRecord) {
      // Do not reveal if user exists, just return success
      return;
    }
    userRecord.resetCode = '999999';
    saveUsersDB(db);
  },

  async resetPassword(contact: string, code: string, newPassword: string): Promise<void> {
    await delay(800);
    const db = getUsersDB();
    const userRecord = Object.values(db).find(u => u.email === contact || u.phone === contact);
    
    if (!userRecord || (code !== '999999' && code !== userRecord.resetCode)) {
      throw new Error("Código inválido. Verifique e tente novamente.");
    }

    userRecord.passwordHash = await hashPassword(newPassword);
    userRecord.resetCode = undefined;
    saveUsersDB(db);
  }
};

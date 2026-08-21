const fs = require('fs');
let content = fs.readFileSync('src/components/AuthScreen.tsx', 'utf8');

const newAuthScreen = `import React, { useState } from 'react';
import { AuthService } from '../services/auth';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await AuthService.loginWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-full h-full bg-[#05070a]">
      <main className="relative flex flex-col items-center justify-center w-full h-full max-w-md md:max-w-lg bg-[#080B0E] border-x border-slate-800/40 p-6 overflow-y-auto">
        {/* LOGO */}
        <div className="mb-12 text-center shrink-0">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-cyan-400 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-[0_0_40px_rgba(0,255,102,0.3)] transform rotate-3">
            <span className="text-4xl font-black text-black tracking-tighter">U</span>
          </div>
          <h1 className="text-3xl font-black text-white font-display tracking-tight uppercase">
            Urbano<span className="text-emerald-400">zeiro</span>
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-2 tracking-wide uppercase font-mono-stat">
            Identidade de Jogador
          </p>
        </div>

        {error && (
          <div className="w-full max-w-sm mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <div className="w-full max-w-sm">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white text-black font-black uppercase tracking-wider text-sm py-4 rounded-xl hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
          >
            {isLoading ? (
               <div className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
            ) : (
               <>
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                   <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                   <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                   <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                   <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                 </svg>
                 <span>Continuar com Google</span>
               </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};
`;

fs.writeFileSync('src/components/AuthScreen.tsx', newAuthScreen, 'utf8');
console.log('AuthScreen updated to only use Google Login');

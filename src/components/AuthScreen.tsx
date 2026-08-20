import React, { useState } from 'react';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'verify_account' | 'reset_password';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contact, setContact] = useState(''); // email or phone
  const [verificationCode, setVerificationCode] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const { AuthService } = await import('../services/auth');
      
      if (mode === 'login') {
        const user = await AuthService.login(username, password);
        if (!user.accountVerified) {
          setMode('verify_account');
          setSuccessMsg('Verifique sua conta para continuar.');
        } else {
          onLoginSuccess();
        }
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error("As senhas não coincidem.");
        }
        await AuthService.register(username, password, contact);
        setMode('verify_account');
        setSuccessMsg('Conta criada! Informe o código (Mock: 123456) para verificar.');
      } else if (mode === 'verify_account') {
        await AuthService.verifyAccount(verificationCode);
        onLoginSuccess();
      } else if (mode === 'forgot') {
        await AuthService.requestPasswordReset(contact);
        setMode('reset_password');
        setSuccessMsg('Se o contato existir, um código (Mock: 999999) foi enviado.');
      } else if (mode === 'reset_password') {
        if (password !== confirmPassword) {
          throw new Error("As senhas não coincidem.");
        }
        await AuthService.resetPassword(contact, verificationCode, password);
        setMode('login');
        setSuccessMsg('Senha redefinida com sucesso! Faça login.');
      }
    } catch (err: any) {
      setError(err.message || 'Falha na operação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const { AuthService } = await import('../services/auth');
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
        <div className="mb-8 text-center shrink-0">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-cyan-400 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,102,0.3)] transform rotate-3">
            <span className="text-3xl font-black text-black tracking-tighter">U</span>
          </div>
          <h1 className="text-2xl font-black text-white font-display tracking-tight uppercase">
            Urbano<span className="text-emerald-400">zeiro</span>
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1 tracking-wide uppercase font-mono-stat">
            Identidade de Jogador
          </p>
        </div>

        {/* FORMS */}
        <form onSubmit={handleAuth} className="w-full max-w-sm flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold text-center">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center">
              {successMsg}
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Nome de Usuário</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="seu_username"
                className="w-full bg-[#111822] border border-slate-700/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          )}

          {(mode === 'register' || mode === 'forgot' || mode === 'reset_password') && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">E-mail ou Telefone</label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="email@exemplo.com ou 11999999999"
                className="w-full bg-[#111822] border border-slate-700/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          )}

          {(mode === 'verify_account' || mode === 'reset_password') && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Código de Verificação</label>
              <input
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                className="w-full bg-[#111822] border border-slate-700/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors text-center tracking-[0.5em] font-mono-stat"
              />
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'reset_password') && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111822] border border-slate-700/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          )}

          {(mode === 'register' || mode === 'reset_password') && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Confirmar Senha</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111822] border border-slate-700/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-black font-display uppercase tracking-wider text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,255,102,0.3)] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
            ) : (
              mode === 'login' ? 'ENTRAR NA ARENA' :
              mode === 'register' ? 'CRIAR IDENTIDADE' :
              mode === 'forgot' ? 'ENVIAR CÓDIGO' :
              mode === 'verify_account' ? 'VERIFICAR CONTA' :
              'REDEFINIR SENHA'
            )}
          </button>
        </form>

        {(mode === 'login' || mode === 'register') && (
          <div className="w-full max-w-sm mt-4">
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="shrink-0 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">OU</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full mt-2 bg-white text-black font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Continuar com Google</span>
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          {mode !== 'login' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className="text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors underline underline-offset-4"
            >
              Voltar para o Login
            </button>
          )}
          {mode === 'login' && (
            <>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                className="text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors underline underline-offset-4"
              >
                Não tem um perfil? Cadastre-se
              </button>
              <button
                type="button"
                onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                className="text-[10px] font-bold text-slate-500 hover:text-emerald-400 transition-colors"
              >
                ESQUECI MINHA SENHA
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

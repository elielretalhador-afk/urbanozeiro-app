const fs = require('fs');
let content = fs.readFileSync('src/components/SkaterHud.tsx', 'utf8');

// Add new props
content = content.replace(
  /onExitRedoMode\?: \(\) => void;/,
  `onExitRedoMode?: () => void;\n  onOpenRotas?: () => void;\n  onOpenDesafios?: () => void;`
);

content = content.replace(
  /onExitRedoMode,/,
  `onExitRedoMode,\n  onOpenRotas,\n  onOpenDesafios,`
);

// Replace the DEFAULT HUD BAR completely
const oldHudRegex = /\{!isSessionActive && !selectedZone && \(\!selectedChallenge \|\| isChallengeBannerMinimized\) && !selectedRoute && \([\s\S]*?\}\)/;

const newHudHtml = `{!isSessionActive && !selectedZone && (!selectedChallenge || isChallengeBannerMinimized) && !selectedRoute && (
        <div className="absolute bottom-3 inset-x-3 z-20 pointer-events-none">
          <div className="pointer-events-auto max-w-md mx-auto flex items-center justify-between gap-3 p-3 rounded-[32px] bg-[#090e15]/95 border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            
            {/* LEFT: ROTA */}
            {onOpenRotas && (
              <button
                type="button"
                onClick={onOpenRotas}
                className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-emerald-400/30 transition-all active:scale-95 shrink-0 min-w-[70px] cursor-pointer"
              >
                <Navigation className="w-5 h-5 text-emerald-400 mb-1" />
                <span className="text-[10px] font-black text-slate-300 uppercase font-mono-stat tracking-wider">Rota</span>
              </button>
            )}

            {/* CENTER: INICIAR PATINAÇÃO */}
            {onStartSession && (
              <button
                type="button"
                id="btn-start-skate-session"
                onClick={onStartSession}
                className="btn-game-primary flex-1 py-3 px-4 rounded-2xl text-black font-black text-sm uppercase font-display tracking-wider flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none active:scale-95 shadow-[0_0_20px_rgba(0,255,102,0.3)]"
              >
                <div className="flex items-center gap-1.5">
                  <Play className="w-4 h-4 fill-current stroke-[2.5]" />
                  <span className="text-sm tracking-wide">INICIAR PATINAÇÃO</span>
                </div>
                <span className="px-1.5 py-0.5 mt-0.5 rounded text-emerald-950 bg-emerald-400/40 text-[9px] font-mono-stat font-black tracking-tight leading-none border border-black/20">
                  GPS LIVE
                </span>
              </button>
            )}

            {/* RIGHT: DESAFIO */}
            {onOpenDesafios && (
              <button
                type="button"
                onClick={onOpenDesafios}
                className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-amber-400/30 transition-all active:scale-95 shrink-0 min-w-[70px] cursor-pointer"
              >
                <Swords className="w-5 h-5 text-amber-400 mb-1" />
                <span className="text-[10px] font-black text-slate-300 uppercase font-mono-stat tracking-wider">Desafio</span>
              </button>
            )}

          </div>
        </div>
      )}`;

content = content.replace(oldHudRegex, newHudHtml);

fs.writeFileSync('src/components/SkaterHud.tsx', content);
console.log('Patched SkaterHud.tsx');

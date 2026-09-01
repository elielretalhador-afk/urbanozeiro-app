import re

with open("src/components/SkaterHud.tsx", "r") as f:
    content = f.read()

# Replace the wrapper bg
old_wrapper = 'className="pointer-events-auto max-w-md mx-auto flex items-center justify-between gap-3 p-3 rounded-[32px] bg-[#090e15]/95 border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.9)] "'
new_wrapper = 'className="pointer-events-auto max-w-md mx-auto flex items-center justify-between gap-3 p-2.5 rounded-[32px] bg-[#1d4ed8]/95 border border-blue-400/30 shadow-[0_16px_40px_rgba(0,0,0,0.9)] "'
content = content.replace(old_wrapper, new_wrapper)

# Replace the Rota button icon
old_rota = '<Navigation className="w-5 h-5 text-emerald-400 mb-1" />'
new_rota = '<Navigation className="w-5 h-5 text-white mb-1" />'
content = content.replace(old_rota, new_rota)

# Replace the Desafio button icon
old_desafio = '<Swords className="w-5 h-5 text-amber-400 mb-1" />'
new_desafio = '<Swords className="w-5 h-5 text-white mb-1" />'
content = content.replace(old_desafio, new_desafio)

# Replace the Start Button
old_start = """            {/* CENTER: INICIAR PATINAÇÃO */}
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
            )}"""

new_start = """            {/* CENTER: INICIAR */}
            {onStartSession && (
              <button
                type="button"
                id="btn-start-skate-session"
                onClick={onStartSession}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#fce803] text-black font-black text-lg uppercase font-display tracking-widest flex items-center justify-center cursor-pointer select-none active:scale-95 shadow-[0_0_20px_rgba(252,232,3,0.4)] transition-all"
                style={{ borderBottom: '4px solid #c4b502' }}
              >
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 fill-current stroke-[3]" />
                  <span className="mt-0.5">INICIAR</span>
                </div>
              </button>
            )}"""
content = content.replace(old_start, new_start)

with open("src/components/SkaterHud.tsx", "w") as f:
    f.write(content)

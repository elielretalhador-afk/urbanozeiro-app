import sys

with open('src/components/ZoneConqueredModal.tsx', 'r') as f:
    content = f.read()

old_block = """        {/* Controller Badge Box */}
        <div className="w-full p-2.5 rounded-xl bg-[#0c1219] border border-yellow-500/30 flex items-center justify-between gap-2.5 mb-4 text-left">"""

new_block = """        {/* Clan War Info */}
        {clanWar && (
          <div className="w-full mb-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3 flex flex-col items-center">
             <div className="flex items-center gap-2 text-yellow-400 text-[10px] font-black uppercase mb-1">
                <Shield className="w-4 h-4" /> 
                {isOffline ? 'Conquista registrada. Sincronizando...' : '⚔️ TERRITÓRIO CONQUISTADO'}
             </div>
             <div className="text-white text-xs font-bold uppercase truncate">{zoneName} • {clanWar.clanName}</div>
             <div className="text-yellow-400 font-mono-stat font-black mt-1">+{clanWar.points} PONTOS PARA O CLÃ</div>
          </div>
        )}

        {/* Controller Badge Box */}
        <div className="w-full p-2.5 rounded-xl bg-[#0c1219] border border-yellow-500/30 flex items-center justify-between gap-2.5 mb-4 text-left">"""

content = content.replace(old_block, new_block)

with open('src/components/ZoneConqueredModal.tsx', 'w') as f:
    f.write(content)

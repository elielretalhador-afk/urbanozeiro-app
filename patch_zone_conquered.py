import sys

with open('src/components/ZoneConqueredModal.tsx', 'r') as f:
    content = f.read()

old_header = """  const { zone, zoneName, durationFormatted, distanceKmFormatted, xpEarned, player } = data;
  const zoneColor = zone.color || zone.accentColor || '#00FF66';

  return (
    <div"""

new_header = """  const { zone, zoneName, durationFormatted, distanceKmFormatted, xpEarned, player, clanWar } = data;
  const zoneColor = zone.color || zone.accentColor || '#00FF66';
  
  // Is it online/confirmed or offline? Wait, this is optimistic. We can say "Sincronizando..." if navigator is offline
  const isOffline = !navigator.onLine;

  return (
    <div"""
    
content = content.replace(old_header, new_header)

old_body = """        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6 relative z-10">"""

new_body = """        {/* Clan War Info */}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6 relative z-10">"""

content = content.replace(old_body, new_body)

with open('src/components/ZoneConqueredModal.tsx', 'w') as f:
    f.write(content)

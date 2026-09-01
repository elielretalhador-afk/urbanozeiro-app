import sys

with open('src/components/RankingView.tsx', 'r') as f:
    content = f.read()

old_stat = """                      <div className="text-xs font-bold text-yellow-400 flex items-center justify-end gap-1 font-mono-stat">
                        <Shield className="w-3.5 h-3.5" />
                        {clan.controlledZonesCount} {clan.controlledZonesCount === 1 ? 'ZONA' : 'ZONAS'}
                      </div>"""

new_stat = """                      <div className="text-xs font-bold text-yellow-400 flex items-center justify-end gap-1 font-mono-stat">
                        <Shield className="w-3.5 h-3.5" />
                        {clan.territoryScore || 0} PTS
                      </div>
                      <div className="text-[10px] font-bold text-cyan-300 mt-0.5 font-mono-stat text-right">
                        {clan.zonesControlledCount || 0} ZONAS
                      </div>"""

content = content.replace(old_stat, new_stat)

with open('src/components/RankingView.tsx', 'w') as f:
    f.write(content)

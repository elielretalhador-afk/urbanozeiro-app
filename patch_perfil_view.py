import sys
import re

with open('src/components/PerfilView.tsx', 'r') as f:
    content = f.read()

import_add = """import { SeasonService } from '../services/seasonService';\n"""
if "import { SeasonService" not in content:
    content = content.replace("import React ", import_add + "import React ")

state_add = """  const [seasonScore, setSeasonScore] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (user) {
      SeasonService.getActiveSeason().then(season => {
         if (season) {
            SeasonService.getTopPlayers(season.id).then(players => {
               const p = players.find(x => x.playerId === user.id);
               if (p) setSeasonScore(p.score);
               else setSeasonScore(0);
            });
         }
      });
    }
  }, [user]);
"""
content = re.sub(
    r"  const nextLevel = progression \? getNextLevelDefinition.*?;\n",
    r"  const nextLevel = progression ? getNextLevelDefinition(progression.level) : null;\n" + state_add,
    content
)

ui_add = """
          {/* TEMPORADA */}
          {seasonScore !== null && (
            <div onClick={() => onOpenSeasonHub?.('visao_geral')} className="p-4 bg-gradient-to-r from-yellow-400/10 to-amber-500/10 border border-yellow-400/20 rounded-2xl flex items-center justify-between cursor-pointer hover:border-yellow-400/40 transition-all">
               <div>
                 <h3 className="text-[10px] font-black text-yellow-400 uppercase font-display mb-0.5 flex items-center gap-1.5">
                   <Crown className="w-3.5 h-3.5" />
                   GUERRA DA TEMPORADA
                 </h3>
                 <p className="text-sm font-bold text-white font-mono-stat">Pontuação Atual: <span className="text-yellow-400">{seasonScore.toLocaleString()} pts</span></p>
               </div>
               <ArrowRight className="w-4 h-4 text-yellow-400 opacity-50" />
            </div>
          )}
"""

content = content.replace("          {/* Level Progress */}", ui_add + "          {/* Level Progress */}")

with open('src/components/PerfilView.tsx', 'w') as f:
    f.write(content)

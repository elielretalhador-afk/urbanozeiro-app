import sys
import re

with open('src/components/ClanProfileModal.tsx', 'r') as f:
    content = f.read()

import_add = """import { SeasonService } from '../services/seasonService';\n"""
if "import { SeasonService" not in content:
    content = content.replace("import { ClanService", import_add + "import { ClanService")

state_add = """  const [seasonScore, setSeasonScore] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (clan && isOpen) {
      SeasonService.getActiveSeason().then(season => {
         if (season) {
            SeasonService.getTopClans(season.id).then(clans => {
               const myClan = clans.find(c => c.clanId === clan.id);
               if (myClan) setSeasonScore(myClan.score);
               else setSeasonScore(0);
            });
         }
      });
    }
  }, [clan, isOpen]);
"""

content = re.sub(
    r"  const \[myInvites, setMyInvites\] = React\.useState<any\[\]>\(\[\]\);",
    r"  const [myInvites, setMyInvites] = React.useState<any[]>([]);\n" + state_add,
    content
)

ui_add = """
          {/* TEMPORADA */}
          {seasonScore !== null && (
            <div className="p-4 bg-gradient-to-r from-yellow-400/10 to-amber-500/10 border border-yellow-400/20 rounded-xl mb-4">
               <h3 className="text-xs font-black text-yellow-400 uppercase font-display mb-1 flex items-center gap-2">
                 <Crown className="w-4 h-4" />
                 GUERRA DA TEMPORADA
               </h3>
               <p className="text-sm font-bold text-white font-mono-stat">Pontuação Atual: <span className="text-yellow-400">{seasonScore.toLocaleString()} pts</span></p>
            </div>
          )}
"""

content = content.replace("          {/* Detalhes */}", ui_add + "          {/* Detalhes */}")

with open('src/components/ClanProfileModal.tsx', 'w') as f:
    f.write(content)

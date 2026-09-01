import sys
import re

with open('src/components/PublicProfileModal.tsx', 'r') as f:
    content = f.read()

import_add = """import { SeasonService } from '../services/seasonService';\n"""
if "import { SeasonService" not in content:
    content = content.replace("import { RankPlayer", import_add + "import { RankPlayer")

state_add = """  const [seasonScore, setSeasonScore] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (player && isOpen) {
      SeasonService.getActiveSeason().then(season => {
         if (season) {
            SeasonService.getTopPlayers(season.id).then(players => {
               const p = players.find(x => x.playerId === player.id);
               if (p) setSeasonScore(p.score);
               else setSeasonScore(0);
            });
         }
      });
    }
  }, [player, isOpen]);
"""
# Need to know if isOpen exists. If it doesn't, just `player`
state_add_safe = """  const [seasonScore, setSeasonScore] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (player) {
      SeasonService.getActiveSeason().then(season => {
         if (season) {
            SeasonService.getTopPlayers(season.id).then(players => {
               const p = players.find(x => x.playerId === player.id);
               if (p) setSeasonScore(p.score);
               else setSeasonScore(0);
            });
         }
      });
    }
  }, [player]);
"""

content = re.sub(
    r"  const \[activeTab, setActiveTab\] = useState<'geral'.*?;\n",
    r"  const [activeTab, setActiveTab] = useState<'geral' | 'conquistas' | 'estatisticas' | 'inventario'>('geral');\n" + state_add_safe,
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

content = content.replace("              {/* Stats Grid */}", ui_add + "              {/* Stats Grid */}")

with open('src/components/PublicProfileModal.tsx', 'w') as f:
    f.write(content)

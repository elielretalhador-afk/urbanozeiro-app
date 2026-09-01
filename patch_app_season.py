import sys
import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add state for season modal
state_injection = """  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [seasonModalTab, setSeasonModalTab] = useState<'visao_geral' | 'ranking' | 'recompensas' | 'historico'>('visao_geral');
"""
content = re.sub(
    r"  const \[isSessionHistoryModalOpen, setIsSessionHistoryModalOpen\] = useState\(false\);",
    state_injection + "  const [isSessionHistoryModalOpen, setIsSessionHistoryModalOpen] = useState(false);",
    content
)

# Update RankingView
ranking_update = """            <RankingView
              leaderboard={leaderboard}
              clans={clans}
              currentUser={user}
              onSelectClan={(clan) => setSelectedClanProfile(clan)}
              onSelectPlayer={(player) => setSelectedPublicPlayer(player)}
              onOpenSeasonHub={(tab) => {
                setSeasonModalTab(tab || 'visao_geral');
                setIsSeasonModalOpen(true);
              }}"""
content = re.sub(
    r"            <RankingView\n              leaderboard={leaderboard}\n              clans={clans}\n              currentUser={user}\n              onSelectClan=\{\(clan\) => setSelectedClanProfile\(clan\)\}\n              onSelectPlayer=\{\(player\) => setSelectedPublicPlayer\(player\)\}",
    ranking_update,
    content,
    flags=re.MULTILINE
)

# Render SeasonHubModal
modal_html = """      {/* MODAL DE TEMPORADA */}
      {isSeasonModalOpen && (
        <SeasonHubModal
          onClose={() => setIsSeasonModalOpen(false)}
          defaultTab={seasonModalTab}
          onOpenEvents={() => {
             setIsSeasonModalOpen(false);
             setActiveTab('desafios');
          }}
          onOpenMissions={() => {
             setIsSeasonModalOpen(false);
             setActiveTab('desafios');
          }}
          onOpenCollections={() => {
             setIsSeasonModalOpen(false);
             setActiveTab('perfil');
          }}
        />
      )}
"""
content = content.replace("      {/* Notificações */}", modal_html + "      {/* Notificações */}")

with open('src/App.tsx', 'w') as f:
    f.write(content)

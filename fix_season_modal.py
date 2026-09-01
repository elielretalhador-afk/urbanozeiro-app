import sys
import re

with open('src/components/SeasonHubModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { useEffect } from 'react';\n", "")

state_add = """  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [topPlayers, setTopPlayers] = useState<SeasonRankingEntry[]>([]);
  const [topClans, setTopClans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const season = await SeasonService.getActiveSeason();
        if (season) {
          setActiveSeason(season);
          const players = await SeasonService.getTopPlayers(season.id);
          const clans = await SeasonService.getTopClans(season.id);
          setTopPlayers(players);
          setTopClans(clans);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isOpen]);
"""

# inject right after `const [selectedSeasonId, setSelectedSeasonId] = useState<string>('season_01');`
content = content.replace("  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('season_01');", "  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('season_01');\n" + state_add)

with open('src/components/SeasonHubModal.tsx', 'w') as f:
    f.write(content)

import sys
import re

with open('src/components/SeasonHubModal.tsx', 'r') as f:
    content = f.read()

# Replace MOCK_SEASONS imports and usages
import_add = """import { SeasonService } from '../services/seasonService';
import { useEffect } from 'react';"""
content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';\n" + import_add)

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
  }, []);
"""

content = re.sub(r"  const \[activeTab, setActiveTab\] = useState<'visao_geral'.*?;\n", r"  const [activeTab, setActiveTab] = useState<'visao_geral' | 'ranking' | 'recompensas' | 'historico'>(defaultTab);\n" + state_add, content)

# update viewingSeason
content = content.replace("  const viewingSeason = MOCK_SEASONS.find((s) => s.id === selectedSeasonId) || MOCK_SEASONS[0];", "  const viewingSeason = activeSeason || MOCK_SEASONS[0];")

# update rendering
loading_block = """  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
         <div className="text-yellow-400 font-bold font-mono-stat animate-pulse">Carregando Temporada...</div>
      </div>
    );
  }
"""

content = re.sub(r"  return \(\n    <div className=\"fixed", loading_block + r"  return (\n    <div className=\"fixed", content)

with open('src/components/SeasonHubModal.tsx', 'w') as f:
    f.write(content)

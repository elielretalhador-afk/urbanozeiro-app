import sys

with open('src/components/RankingView.tsx', 'r') as f:
    content = f.read()

# I will add a button to open SeasonHub in the header or somewhere prominent.
button_html = """
      {/* Temporada Action */}
      <div className="px-4 pb-4">
        <button
          onClick={() => onOpenSeasonHub?.('visao_geral')}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase font-mono-stat tracking-wider flex items-center justify-between shadow-lg shadow-yellow-500/20 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5" />
            <span>Guerra da Temporada</span>
          </div>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
"""

content = content.replace("      {/* Search Header */}", button_html + "      {/* Search Header */}")

with open('src/components/RankingView.tsx', 'w') as f:
    f.write(content)

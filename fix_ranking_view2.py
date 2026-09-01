import sys

with open('src/components/RankingView.tsx', 'r') as f:
    content = f.read()

content = content.replace("clan.totalKm.toFixed", "(clan.totalKm || 0).toFixed")
content = content.replace("clan.xp.toLocaleString", "(clan.xp || 0).toLocaleString")

with open('src/components/RankingView.tsx', 'w') as f:
    f.write(content)

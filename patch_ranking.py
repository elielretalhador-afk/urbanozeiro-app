import sys

with open('src/components/RankingView.tsx', 'r') as f:
    content = f.read()

old_sort = "const sortedClans = [...clans].sort((a, b) => (a.rankPosition || 99) - (b.rankPosition || 99));"
new_sort = """const sortedClans = [...clans].sort((a, b) => {
    const scoreDiff = (b.territoryScore || 0) - (a.territoryScore || 0);
    if (scoreDiff !== 0) return scoreDiff;
    return (b.zonesControlledCount || 0) - (a.zonesControlledCount || 0);
  });"""
content = content.replace(old_sort, new_sort)

old_view_title = "/* CLÃS VIEW */"
new_view_title = "/* CLÃS VIEW */\n        <div className=\"mb-3 flex items-center justify-between\"><h2 className=\"text-sm font-black text-yellow-400 uppercase tracking-widest\">GUERRA TERRITORIAL</h2></div>"
content = content.replace(old_view_title, new_view_title)

old_2nd_stat = "{top3Clans[1].controlledZonesCount} ZONAS"
new_2nd_stat = "{top3Clans[1].territoryScore || 0} PTS<br/>{top3Clans[1].zonesControlledCount || 0} ZONAS"
content = content.replace(old_2nd_stat, new_2nd_stat)

old_1st_stat = "{top3Clans[0].controlledZonesCount} ZONAS"
new_1st_stat = "{top3Clans[0].territoryScore || 0} PTS<br/>{top3Clans[0].zonesControlledCount || 0} ZONAS"
content = content.replace(old_1st_stat, new_1st_stat)

old_3rd_stat = "{top3Clans[2].controlledZonesCount} ZONAS"
new_3rd_stat = "{top3Clans[2].territoryScore || 0} PTS<br/>{top3Clans[2].zonesControlledCount || 0} ZONAS"
content = content.replace(old_3rd_stat, new_3rd_stat)

with open('src/components/RankingView.tsx', 'w') as f:
    f.write(content.replace("<br/>", "<br/>\n                  "))

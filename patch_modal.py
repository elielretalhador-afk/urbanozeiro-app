import sys

with open('src/components/ZoneConqueredModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("const { zone, zoneName, durationFormatted, distanceKmFormatted, xpEarned, player, clanWar } = data;", "const { zone, zoneName, durationFormatted, distanceKmFormatted, xpEarned, player, clanWar, isPending } = data;")

content = content.replace('const isOffline = !navigator.onLine;', "const isOffline = !navigator.onLine;\n  const statusTitle = isPending ? 'Sincronizando Conquista...' : (isOffline ? 'Salvo Offline' : 'TERRITÓRIO CONQUISTADO!');")

content = content.replace('>TERRITÓRIO CONQUISTADO!<', '>{statusTitle}<')

content = content.replace('{xpEarned > 0 && (', '{!isPending && xpEarned > 0 && (')
content = content.replace('{clanWar && (', '{!isPending && clanWar && (')

with open('src/components/ZoneConqueredModal.tsx', 'w') as f:
    f.write(content)

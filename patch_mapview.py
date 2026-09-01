import sys

with open('src/components/MapView.tsx', 'r') as f:
    content = f.read()

content = content.replace("interface MapViewProps {", "interface MapViewProps {\n  userClanId?: string;")

old_color_logic = """      // Center Zone Pin Marker Icon
      const effectiveBorderColor = isContested ? '#f59e0b' : isFree ? '#fce803' : zoneColor;"""

new_color_logic = """      // Center Zone Pin Marker Icon
      let effectiveBorderColor = zoneColor;
      if (isContested) {
        effectiveBorderColor = '#f59e0b';
      } else if (isFree) {
        effectiveBorderColor = '#e5e7eb'; // Neutral light gray for neutral
      } else {
        const isAllied = controllerData?.clanId && userClanId && controllerData.clanId === userClanId;
        const isEnemy = controllerData?.clanId && (!userClanId || controllerData.clanId !== userClanId);
        if (isAllied) {
          effectiveBorderColor = '#2563eb'; // Royal Blue
        } else if (isEnemy) {
          effectiveBorderColor = '#475569'; // Slate for enemy (not red, neutral contrast)
        }
      }"""

content = content.replace(old_color_logic, new_color_logic)

with open('src/components/MapView.tsx', 'w') as f:
    f.write(content)

import sys

with open('src/components/MapView.tsx', 'r') as f:
    content = f.read()

content = content.replace("export const MapView: React.FC<MapViewProps> = ({\n  user,", "export const MapView: React.FC<MapViewProps> = ({\n  user,\n  userClanId,")

with open('src/components/MapView.tsx', 'w') as f:
    f.write(content)

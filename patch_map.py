import re

# 1. Update index.css
with open('src/index.css', 'r') as f:
    css_content = f.read()
css_content = re.sub(r'/\* CSS filter to turn standard OpenStreetMap tiles.*?\n\.leaflet-tile \{\n  filter: invert\(100%\) hue-rotate\(180deg\) brightness\(95%\) contrast\(90%\);\n\}', '', css_content, flags=re.DOTALL)
with open('src/index.css', 'w') as f:
    f.write(css_content)

# 2. Update MapView.tsx
with open('src/components/MapView.tsx', 'r') as f:
    map_content = f.read()
map_content = map_content.replace(
    "L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {",
    "L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {"
)
map_content = map_content.replace(
    "attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors',",
    "attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\">CARTO</a>',"
)
with open('src/components/MapView.tsx', 'w') as f:
    f.write(map_content)

# 3. Update SessionHistoryModal.tsx
with open('src/components/SessionHistoryModal.tsx', 'r') as f:
    session_content = f.read()
session_content = session_content.replace(
    "L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {",
    "L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {"
)
session_content = session_content.replace(
    "attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>',",
    "attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\">CARTO</a>',"
)
with open('src/components/SessionHistoryModal.tsx', 'w') as f:
    f.write(session_content)


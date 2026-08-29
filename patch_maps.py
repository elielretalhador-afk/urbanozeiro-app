import os

# 1. Update MapView.tsx
mapview_path = 'src/components/MapView.tsx'
with open(mapview_path, 'r') as f:
    mapview_content = f.read()

mapview_content = mapview_content.replace(
    "L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {",
    "L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {\n        className: 'map-tiles-dark-filter',"
)
mapview_content = mapview_content.replace(
    "attribution: '&copy; <a href=\"https://carto.com/\">CARTO</a> &copy; <a href=\"https://openstreetmap.org\">OSM</a>',",
    "attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors',"
)

with open(mapview_path, 'w') as f:
    f.write(mapview_content)

# 2. Update SessionHistoryModal.tsx
session_path = 'src/components/SessionHistoryModal.tsx'
with open(session_path, 'r') as f:
    session_content = f.read()

session_content = session_content.replace(
    "L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {",
    "L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {\n      className: 'map-tiles-dark-filter',\n      attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>',"
)

with open(session_path, 'w') as f:
    f.write(session_content)

# 3. Update index.css
css_path = 'src/index.css'
with open(css_path, 'a') as f:
    f.write("\n/* CSS filter to turn standard OpenStreetMap tiles into a Dark Mode map */\n")
    f.write(".map-tiles-dark-filter {\n")
    f.write("  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);\n")
    f.write("}\n")

print("Maps patched successfully!")

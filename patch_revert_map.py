import re

# 1. Update MapView.tsx
with open('src/components/MapView.tsx', 'r') as f:
    map_content = f.read()
map_content = map_content.replace(
    "L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {",
    "L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {"
)
map_content = map_content.replace(
    "attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\">CARTO</a>',",
    "attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors',"
)
with open('src/components/MapView.tsx', 'w') as f:
    f.write(map_content)

# 2. Update SessionHistoryModal.tsx
with open('src/components/SessionHistoryModal.tsx', 'r') as f:
    session_content = f.read()
session_content = session_content.replace(
    "L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {",
    "L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {"
)
session_content = session_content.replace(
    "attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\">CARTO</a>',",
    "attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>',"
)
with open('src/components/SessionHistoryModal.tsx', 'w') as f:
    f.write(session_content)

# 3. Update index.css
with open('src/index.css', 'a') as f:
    f.write("""
/* CSS filter to turn standard OpenStreetMap tiles into a Dark Mode map */
/* Optimized for mobile GPUs: applying to the pane instead of individual tiles */
.leaflet-tile-pane {
  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
  transform: translateZ(0);
  will-change: filter;
}
""")

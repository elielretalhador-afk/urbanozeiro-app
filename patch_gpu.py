import os

# 1. Update MapView.tsx
mapview_path = 'src/components/MapView.tsx'
with open(mapview_path, 'r') as f:
    mapview_content = f.read()

mapview_content = mapview_content.replace(
    "className: 'map-tiles-dark-filter',",
    "/* className removed to fix GPU artifact */"
)
with open(mapview_path, 'w') as f:
    f.write(mapview_content)

# 2. Update SessionHistoryModal.tsx
session_path = 'src/components/SessionHistoryModal.tsx'
with open(session_path, 'r') as f:
    session_content = f.read()

session_content = session_content.replace(
    "className: 'map-tiles-dark-filter',",
    "/* className removed to fix GPU artifact */"
)
with open(session_path, 'w') as f:
    f.write(session_content)

# 3. Update index.css
css_path = 'src/index.css'
with open(css_path, 'r') as f:
    css_content = f.read()

css_content = css_content.replace(
    ".map-tiles-dark-filter {\n  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);\n}",
    ".leaflet-tile-pane {\n  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  transform: translate3d(0,0,0);\n}"
)
with open(css_path, 'w') as f:
    f.write(css_content)

print("GPU fix applied!")

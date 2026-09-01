import re

with open("src/components/MapView.tsx", "r") as f:
    content = f.read()

old_ref = "  const zoneLayersRef = useRef<{ [id: string]: { layer: L.Layer; marker: L.Marker } }>({});"
new_ref = "  const zoneLayersRef = useRef<{ [id: string]: { layer: L.Layer; marker: L.Marker; glowLayer?: L.Layer } }>({});"

content = content.replace(old_ref, new_ref)

with open("src/components/MapView.tsx", "w") as f:
    f.write(content)

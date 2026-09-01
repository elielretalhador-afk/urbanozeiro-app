import re

with open("src/components/MapView.tsx", "r") as f:
    content = f.read()

old_rm = """        const { layer, marker } = zoneLayersRef.current[id];
        if (layer) map.removeLayer(layer);
        if (marker) map.removeLayer(marker);
        delete zoneLayersRef.current[id];"""

new_rm = """        const { layer, marker, glowLayer } = zoneLayersRef.current[id];
        if (layer) map.removeLayer(layer);
        if (marker) map.removeLayer(marker);
        if (glowLayer) map.removeLayer(glowLayer);
        delete zoneLayersRef.current[id];"""

content = content.replace(old_rm, new_rm)

with open("src/components/MapView.tsx", "w") as f:
    f.write(content)

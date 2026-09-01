import re

with open("src/components/MapView.tsx", "r") as f:
    content = f.read()

# Restore original Polyline behavior for segment, but just with better styling
bad_segment = """          if (zone.shape === 'segment' && zone.path && zone.path.length > 1) {
            const isActiveSegment = activeSegmentAttempt?.segmentId === zone.id;
            const segmentColor = isActiveSegment ? (activeSegmentAttempt.status === 'approaching' ? '#f59e0b' : '#f43f5e') : effectiveBorderColor;
            
            // Add subtle glow layer if active or selected
            if (isActiveSegment || isSelected) {
               L.polyline(zone.path as L.LatLngExpression[], {
                 color: segmentColor,
                 weight: isActiveSegment ? 12 : 8,
                 opacity: isActiveSegment ? 0.3 : 0.15,
                 className: 'transition-all duration-300',
               }).addTo(map);
            }

            layer = L.polyline(zone.path as L.LatLngExpression[], {
              color: segmentColor,
              weight: isActiveSegment ? 5 : (isSelected ? 3.5 : 2.5),
              opacity: isActiveSegment ? 1 : (isSelected ? 0.9 : 0.6),
              dashArray: isActiveSegment ? undefined : '5, 5',
              className: 'transition-all duration-300',
            }).addTo(map);
          } else if (zone.shape === 'zone' && zone.path && zone.path.length > 2) {"""

good_segment = """          let glowLayer: L.Layer | undefined = undefined;
          if (zone.shape === 'segment' && zone.path && zone.path.length > 1) {
            const isActiveSegment = activeSegmentAttempt?.segmentId === zone.id;
            const segmentColor = isActiveSegment ? (activeSegmentAttempt.status === 'approaching' ? '#f59e0b' : '#f43f5e') : effectiveBorderColor;
            
            if (isActiveSegment || isSelected) {
               glowLayer = L.polyline(zone.path as L.LatLngExpression[], {
                 color: segmentColor,
                 weight: isActiveSegment ? 14 : 8,
                 opacity: isActiveSegment ? 0.4 : 0.2,
                 className: 'transition-all duration-300',
               }).addTo(map);
            }

            layer = L.polyline(zone.path as L.LatLngExpression[], {
              color: segmentColor,
              weight: isActiveSegment ? 5 : (isSelected ? 3.5 : 2.5),
              opacity: isActiveSegment ? 1 : (isSelected ? 1 : 0.6),
              dashArray: isActiveSegment ? undefined : '5, 5',
              className: 'transition-all duration-300',
            }).addTo(map);
          } else if (zone.shape === 'zone' && zone.path && zone.path.length > 2) {"""

content = content.replace(bad_segment, good_segment)

# Extend tracking 1
content = content.replace(
    "zoneLayersRef.current[zone.id] = { layer, marker };",
    "zoneLayersRef.current[zone.id] = { layer, marker, glowLayer };"
)

# Extend tracking 2
track2_old = """        } else {
          // Update existing layer styling and icon
          const { layer, marker } = zoneLayersRef.current[zone.id];"""
track2_new = """        } else {
          // Update existing layer styling and icon
          const { layer, marker, glowLayer } = zoneLayersRef.current[zone.id];"""
content = content.replace(track2_old, track2_new)

# Add glow layer update logic
glow_update_old = """          if (layer) {
            if (layer instanceof L.Circle || layer instanceof L.Polygon || layer instanceof L.Polyline) {
              (layer as L.Path).setStyle({
                color: effectiveBorderColor,
                weight: isSelected ? 3.5 : isContested ? 2.5 : 2,"""
glow_update_new = """          if (layer) {
            if (layer instanceof L.Polyline && zone.shape === 'segment') {
              const isActiveSegment = activeSegmentAttempt?.segmentId === zone.id;
              const segmentColor = isActiveSegment ? (activeSegmentAttempt.status === 'approaching' ? '#f59e0b' : '#f43f5e') : effectiveBorderColor;
              (layer as L.Polyline).setStyle({
                color: segmentColor,
                weight: isActiveSegment ? 5 : (isSelected ? 3.5 : 2.5),
                opacity: isActiveSegment ? 1 : (isSelected ? 1 : 0.6),
                dashArray: isActiveSegment ? undefined : '5, 5',
              });
              if (glowLayer && glowLayer instanceof L.Polyline) {
                 if (isActiveSegment || isSelected) {
                    glowLayer.setStyle({
                       color: segmentColor,
                       weight: isActiveSegment ? 14 : 8,
                       opacity: isActiveSegment ? 0.4 : 0.2,
                    });
                 } else {
                    glowLayer.setStyle({ opacity: 0 });
                 }
              }
            } else if (layer instanceof L.Circle || layer instanceof L.Polygon || layer instanceof L.Polyline) {
              (layer as L.Path).setStyle({
                color: effectiveBorderColor,
                weight: isSelected ? 3.5 : isContested ? 2.5 : 2,"""
content = content.replace(glow_update_old, glow_update_new)

with open("src/components/MapView.tsx", "w") as f:
    f.write(content)

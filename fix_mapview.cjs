const fs = require('fs');
let content = fs.readFileSync('src/components/MapView.tsx', 'utf8');

const replacement = `        } else {
          // Update existing layer styling and icon
          const { layer, marker } = zoneLayersRef.current[zone.id];
          if (layer) {
            if (layer instanceof L.Circle || layer instanceof L.Polygon || layer instanceof L.Polyline) {
              (layer as L.Path).setStyle({
                color: effectiveBorderColor,
                weight: isSelected ? 3.5 : isContested ? 2.5 : 2,
                opacity: 0.85,
                fillOpacity: isSelected ? 0.26 : isContested ? 0.22 : 0.16,
                fillColor: effectiveBorderColor,
                dashArray: isContested ? '6, 6' : isFree ? '4, 4' : undefined,
              });
            }
            if (layer instanceof L.Circle) {
              layer.setRadius(zoneRadius);
              layer.setLatLng(centerTuple);
            } else if ((layer as any).setLatLngs && zone.path) {
              (layer as any).setLatLngs(zone.path);
            }
          }
          if (marker) {
            marker.setIcon(zoneIcon);
            marker.setLatLng(centerTuple);
          }
        }
      } catch (err) {`;

content = content.replace(
  /\} else \{\s*\/\/ Update existing layer styling and icon[\s\S]*?\} catch \(err\) \{/,
  replacement
);

fs.writeFileSync('src/components/MapView.tsx', content);
console.log('Fixed MapView.tsx');

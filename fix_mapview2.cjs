const fs = require('fs');
let content = fs.readFileSync('src/components/MapView.tsx', 'utf8');

const regex = /if \(\!zoneLayersRef\.current\[zone\.id\]\) \{[\s\S]*?\} else \{\s*\/\/ Update existing layer styling/m;

const replacement = `if (!zoneLayersRef.current[zone.id]) {
          let layer: L.Layer;
             
          if (zone.shape === 'segment' && zone.path && zone.path.length > 1) {
            layer = L.polyline(zone.path as L.LatLngExpression[], {
              color: effectiveBorderColor,
              weight: isSelected ? 4 : 3,
              opacity: 0.9,
              dashArray: isContested ? '8, 8' : isFree ? '6, 6' : undefined,
              className: 'transition-all duration-300',
            }).addTo(map);
          } else if (zone.shape === 'zone' && zone.path && zone.path.length > 2) {
            layer = L.polygon(zone.path as L.LatLngExpression[], {
              color: effectiveBorderColor,
              weight: isSelected ? 3.5 : isContested ? 2.5 : 2,
              opacity: 0.85,
              fillColor: effectiveBorderColor,
              fillOpacity: isSelected ? 0.26 : isContested ? 0.22 : 0.16,
              dashArray: isContested ? '6, 6' : isFree ? '4, 4' : undefined,
              className: 'transition-all duration-300',
            }).addTo(map);
          } else {
            layer = L.circle(centerTuple, {
              radius: zoneRadius,
              color: effectiveBorderColor,
              weight: isSelected ? 3.5 : isContested ? 2.5 : 2,
              opacity: 0.85,
              fillColor: effectiveBorderColor,
              fillOpacity: isSelected ? 0.26 : isContested ? 0.22 : 0.16,
              dashArray: isContested ? '6, 6' : isFree ? '4, 4' : undefined,
              className: 'transition-all duration-300',
            }).addTo(map);
          }

          layer.on('click', () => {
            onSelectZone(zone);
          });

          const marker = L.marker(centerTuple, { icon: zoneIcon }).addTo(map);

          marker.on('click', () => {
            onSelectZone(zone);
          });

          zoneLayersRef.current[zone.id] = { layer, marker };
        } else {
          // Update existing layer styling`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/MapView.tsx', content);
console.log('Fixed MapView again');

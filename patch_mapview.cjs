const fs = require('fs');
let content = fs.readFileSync('src/components/MapView.tsx', 'utf8');

// Add props
content = content.replace(
  /isCreatingZone\?: boolean;/,
  `isCreatingZone?: boolean;\n  drawnPath?: [number, number][];`
);

content = content.replace(
  /isCreatingZone,/,
  `isCreatingZone,\n  drawnPath = [],`
);

// Update zoneLayersRef to support polyline and polygon
content = content.replace(
  /zoneLayersRef = useRef<\{[^>]+>\}>\(\{\}\);/,
  `zoneLayersRef = useRef<{ [id: string]: { layer: L.Layer; marker: L.Marker } }>({});
  const drawingLayerRef = useRef<L.Polyline | L.Polygon | null>(null);`
);

// Update cleanup of old layers
content = content.replace(
  /const \{ circle, marker \} = zoneLayersRef\.current\[id\];\s*if \(circle\) map\.removeLayer\(circle\);\s*if \(marker\) map\.removeLayer\(marker\);/,
  `const { layer, marker } = zoneLayersRef.current[id];
        if (layer) map.removeLayer(layer);
        if (marker) map.removeLayer(marker);`
);

// Update drawing of zones
const oldDrawingStart = `if (!zoneLayersRef.current[zone.id]) {
          // Create Circular Territory Area
          const circle = L.circle(centerTuple, {`;
          
const newDrawingLogic = `if (!zoneLayersRef.current[zone.id]) {
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
            layer = L.circle(centerTuple, {`;

content = content.replace(oldDrawingStart, newDrawingLogic);

const oldDrawingEnd = `zoneLayersRef.current[zone.id] = { circle, marker };
        } else {
          // Update existing layer styling and icon
          const { circle, marker } = zoneLayersRef.current[zone.id];
          if (circle) {
            circle.setStyle({`;

const newDrawingEnd = `zoneLayersRef.current[zone.id] = { layer, marker };
        } else {
          // Update existing layer styling and icon
          const { layer, marker } = zoneLayersRef.current[zone.id];
          if (layer) {
            if (layer instanceof L.Circle || layer instanceof L.Polygon || layer instanceof L.Polyline) {
              (layer as L.Path).setStyle({`;

content = content.replace(oldDrawingEnd, newDrawingEnd);

content = content.replace(
  /circle\.setRadius\(zoneRadius\);/,
  `if (layer instanceof L.Circle) {
                layer.setRadius(zoneRadius);
              }`
);

// Add drawing mode logic
const addDrawingLogic = `
  // Render drawn path for drawing mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!isCreatingZone || drawnPath.length === 0) {
      if (drawingLayerRef.current) {
        map.removeLayer(drawingLayerRef.current);
        drawingLayerRef.current = null;
      }
      return;
    }

    if (drawingLayerRef.current) {
      map.removeLayer(drawingLayerRef.current);
    }
    
    // Check if it should be shown as polygon (closed) or polyline
    const isClosed = drawnPath.length >= 3 && (() => {
      const first = drawnPath[0];
      const last = drawnPath[drawnPath.length - 1];
      const R = 6371e3;
      const φ1 = first[0] * Math.PI/180;
      const φ2 = last[0] * Math.PI/180;
      const Δφ = (last[0]-first[0]) * Math.PI/180;
      const Δλ = (last[1]-first[1]) * Math.PI/180;
      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c < 60;
    })();

    if (isClosed) {
      drawingLayerRef.current = L.polygon(drawnPath as L.LatLngExpression[], {
        color: '#00ff66',
        weight: 3,
        opacity: 0.9,
        fillColor: '#00ff66',
        fillOpacity: 0.3,
        dashArray: '10, 10'
      }).addTo(map);
    } else {
      drawingLayerRef.current = L.polyline(drawnPath as L.LatLngExpression[], {
        color: '#00ff66',
        weight: 4,
        opacity: 0.9,
        dashArray: '10, 10'
      }).addTo(map);
    }
  }, [drawnPath, isCreatingZone]);
`;

content = content.replace(
  /\/\/ Render & Live Update Active Skating Activity GPS Track/,
  `${addDrawingLogic}\n  // Render & Live Update Active Skating Activity GPS Track`
);

fs.writeFileSync('src/components/MapView.tsx', content);
console.log('Patched MapView.tsx');

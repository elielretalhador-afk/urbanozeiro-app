const fs = require('fs');
let content = fs.readFileSync('src/components/MapView.tsx', 'utf8');

content = content.replace(
  /const zoneLayersRef = useRef<\{ \[id: string\]: \{ circle: L\.Circle; marker: L\.Marker \} \}>\(\{\}\);/,
  `const zoneLayersRef = useRef<{ [id: string]: { layer: L.Layer; marker: L.Marker } }>({});
  const drawingLayerRef = useRef<L.Layer | null>(null);`
);

fs.writeFileSync('src/components/MapView.tsx', content);
console.log('Fixed Refs');

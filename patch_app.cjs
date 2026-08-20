const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add state
content = content.replace(
  /const \[isCreateModalOpen, setIsCreateModalOpen\] = useState\(false\);/,
  `const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDrawingZone, setIsDrawingZone] = useState(false);
  const [drawnPath, setDrawnPath] = useState<[number, number][]>([]);
  const [drawnShapeType, setDrawnShapeType] = useState<'circle' | 'segment' | 'zone'>('circle');`
);

// Update handleOpenCreateZone
content = content.replace(
  /const handleOpenCreateZone = \(\) => \{\s*setIsCreateModalOpen\(true\);\s*\};/,
  `const handleOpenCreateZone = () => {
    setIsDrawingZone(true);
    setDrawnPath([]);
    setDrawnShapeType('circle');
    showToast('Toque no mapa para desenhar a área. Adicione no mínimo 2 pontos.');
  };`
);

// Update onPickCoordinateForNewZone
content = content.replace(
  /onPickCoordinateForNewZone=\{\(coords\) => \{\s*setPickedCoords\(coords\);\s*\}\}/,
  `onPickCoordinateForNewZone={(coords) => {
                if (isDrawingZone) {
                  setDrawnPath(prev => [...prev, coords]);
                } else {
                  setPickedCoords(coords);
                }
              }}
              isCreatingZone={isDrawingZone}
              drawnPath={drawnPath}`
);

// Add logic to finish drawing
const finishDrawingCode = `
  const handleFinishDrawing = () => {
    if (drawnPath.length < 2) {
      showToast('Adicione pelo menos 2 pontos para criar um segmento ou zona.');
      return;
    }
    
    // Check if closed (distance between first and last point < 50 meters)
    const first = drawnPath[0];
    const last = drawnPath[drawnPath.length - 1];
    
    // Simple rough distance check
    const R = 6371e3; // metres
    const φ1 = first[0] * Math.PI/180;
    const φ2 = last[0] * Math.PI/180;
    const Δφ = (last[0]-first[0]) * Math.PI/180;
    const Δλ = (last[1]-first[1]) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceMeters = R * c;

    // Tolerance of 60 meters to close the shape
    const isClosed = drawnPath.length >= 3 && distanceMeters < 60;
    const finalShapeType = isClosed ? 'zone' : 'segment';
    
    setDrawnShapeType(finalShapeType);
    setIsDrawingZone(false);
    
    showToast(isClosed ? 'ZONA CRIADA!' : 'SEGMENTO CRIADO!');
    setIsCreateModalOpen(true);
  };
`;

content = content.replace(
  /const handleOpenCreateZone = \(\) => \{/,
  `${finishDrawingCode}\n  const handleOpenCreateZone = () => {`
);

// Add the UI overlay for drawing mode
const overlayUI = `
            {/* Drawing Zone Overlay */}
            {isDrawingZone && (
              <div className="absolute top-20 inset-x-4 z-40 flex flex-col gap-2 bg-[#0d141d]/95 p-3 rounded-2xl border border-emerald-500 shadow-[0_0_20px_rgba(0,255,102,0.3)] backdrop-blur-md">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400 text-xs font-bold font-mono-stat uppercase">Modo de Desenho</span>
                  <span className="text-slate-300 text-xs font-mono-stat">{drawnPath.length} pontos</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => { setIsDrawingZone(false); setDrawnPath([]); }} className="flex-1 bg-red-500/20 text-red-400 border border-red-500/50 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">Cancelar</button>
                  <button onClick={handleFinishDrawing} disabled={drawnPath.length < 2} className="flex-1 bg-emerald-500 text-black py-2 rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-400">Confirmar</button>
                </div>
              </div>
            )}
`;

content = content.replace(
  /\{\/\* Floating Live Challenge HUD/,
  `${overlayUI}\n            {/* Floating Live Challenge HUD`
);

// Update CreateZoneModal props
content = content.replace(
  /<CreateZoneModal\s+isOpen=\{isCreateModalOpen\}\s+onClose=\{\(\) => \{\s*setIsCreateModalOpen\(false\);\s*setPickedCoords\(null\);\s*\}\}/,
  `<CreateZoneModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setPickedCoords(null);
            setDrawnPath([]);
            setIsDrawingZone(false);
          }}
          shapeType={drawnShapeType}
          drawnPath={drawnPath}`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx');

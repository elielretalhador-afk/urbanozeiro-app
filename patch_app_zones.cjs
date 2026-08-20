const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const zoneStateCode = `
  // =========================================================================
  // ESTADO DE ZONAS (OTIMIZADO PARA PREVENÇÃO DE READS)
  // =========================================================================
  const [zones, setZones] = useState<Zone[]>([]);
  
  useEffect(() => {
    // PREPARAÇÃO FIRESTORE:
    // Em vez de carregar todas as milhares de zonas do mundo no start do App,
    // apenas carregamos as zonas baseadas no Viewport do mapa (bounds).
    // Por enquanto, o mock global usa INITIAL_ZONES como fallback, 
    // mas a chamada passa pela camada de caching geográfico do DatabaseService.
    const loadInitialZones = async () => {
      try {
        const boundsMock = null; // Na vida real, Leaflet bounds
        const regionZones = await DatabaseService.getZonesInRegion(boundsMock);
        setZones(regionZones);
      } catch (e) {
        console.error('Error loading zones via Service', e);
        setZones(INITIAL_ZONES);
      }
    };
    loadInitialZones();
  }, []);

  // O sincronismo de mock com localStorage agora é feito pela camada Service (db.ts),
  // e o cliente apenas recebe o novo array quando necessário.
`;

content = content.replace(
  /\/\/ Zones State with LocalStorage Persistence[\s\S]*?\}, \[zones\]\);/,
  zoneStateCode
);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx zones');

import re

with open('src/services/db.ts', 'r') as f:
    content = f.read()

replacement = """  async getZonesInRegion(bounds: any): Promise<Zone[]> {
    const cacheKey = 'urb_zones_all_cached';
    let cachedZones = CacheManager.get<Zone[]>(cacheKey);
    
    if (navigator.onLine) {
      try {
        const zonesSnap = await getDocs(collection(db, 'zones'));
        const zones: Zone[] = [];
        zonesSnap.forEach(doc => {
          zones.push({ id: doc.id, ...doc.data() } as Zone);
        });
        
        CacheManager.set(cacheKey, zones);
        await saveIdb(KEYS.ZONES, zones); // Persist official zones to IDB
        return zones;
      } catch (error) {
        console.warn('Error fetching zones from Firestore:', error);
      }
    }
    
    if (cachedZones) {
      return cachedZones;
    }
    
    // If offline and no memory cache, load from IndexedDB. Do NOT use INITIAL_ZONES fallback for real users.
    const storedZones = await loadIdb<Zone[]>(KEYS.ZONES, []);
    CacheManager.set(cacheKey, storedZones);
    return storedZones;
  },"""

pattern = re.compile(r'  async getZonesInRegion\(bounds: any\): Promise<Zone\[\]> \{.*?return await loadIdb<Zone\[\]>\(KEYS\.ZONES, INITIAL_ZONES\);\n  \},', re.DOTALL)
content = pattern.sub(replacement, content)

with open('src/services/db.ts', 'w') as f:
    f.write(content)

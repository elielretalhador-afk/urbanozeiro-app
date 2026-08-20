const fs = require('fs');
let content = fs.readFileSync('src/services/db.ts', 'utf8');

content = content.replace(
  /async updateZone\(zoneId: string, updates: Partial<Zone>\): Promise<Zone> \{/,
  `async updateZoneList(zones: Zone[]): Promise<void> {\n    await saveIdb(KEYS.ZONES, zones);\n    this.invalidateZonesCache();\n  },\n  async updateZone(zoneId: string, updates: Partial<Zone>): Promise<Zone> {`
);

fs.writeFileSync('src/services/db.ts', content);

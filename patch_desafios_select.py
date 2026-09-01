import re

with open("src/App.tsx", "r") as f:
    content = f.read()

old_select = """              onSelectZoneOnMap={(zoneId) => {
                const found = zones.find((z) => z.id === zoneId);
                if (found) {
                  setSelectedZone(found);
                  setSelectedRoute(null);
                  setSelectedChallenge(null);
                  setActiveTab('mapa');
                  showToast(`📍 Zona selecionada: ${found.name}`);
                }
              }}"""

new_select = """              onSelectZoneOnMap={(zoneId) => {
                const found = zones.find((z) => z.id === zoneId);
                if (found) {
                  setSelectedZone(found);
                  setSelectedRoute(null);
                  setSelectedChallenge(null);
                  setActiveTab('mapa');
                  if (found.shape === 'segment') {
                    showToast(`⚡ Dirija-se ao início do Sprint: ${found.name}. O GPS detectará automaticamente.`);
                  } else {
                    showToast(`📍 Zona selecionada: ${found.name}`);
                  }
                }
              }}"""

content = content.replace(old_select, new_select)

# Also fix the SegmentDetailsModal callback
old_challenge = """                onChallenge={() => {
                  setSelectedZone(null);
                  showToast(`Modo Sprint ativado para ${selectedZone.name}! Dirija-se ao local.`);
                }}"""
new_challenge = """                onChallenge={() => {
                  const z = selectedZone;
                  setSelectedZone(null);
                  showToast(`⚡ Dirija-se ao início do Sprint: ${z.name}. O GPS detectará automaticamente.`);
                }}"""

content = content.replace(old_challenge, new_challenge)

with open("src/App.tsx", "w") as f:
    f.write(content)

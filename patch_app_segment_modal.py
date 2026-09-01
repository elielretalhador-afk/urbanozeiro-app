import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Import SegmentDetailsModal
if "import { SegmentDetailsModal" not in content:
    content = content.replace("import { ZoneDetailsModal } from './components/ZoneDetailsModal';", "import { ZoneDetailsModal } from './components/ZoneDetailsModal';\nimport { SegmentDetailsModal } from './components/SegmentDetailsModal';")

# Find the ZoneDetailsModal block
zone_modal = """            {/* Bottom Sheet Details for selected circular zone */}
            <ZoneDetailsModal
              zone={selectedZone}
              currentUser={user}
              userLocation={playerLocation}
              isSessionActive={isSessionActive}
              onClose={() => setSelectedZone(null)}
              onChallengeZone={handleChallengeZone}
            />"""

replacement = """            {/* Bottom Sheet Details for selected circular zone or segment */}
            {selectedZone?.shape === 'segment' ? (
              <SegmentDetailsModal
                segmentId={selectedZone.id}
                segmentData={selectedZone}
                onClose={() => setSelectedZone(null)}
                onChallenge={() => {
                  setSelectedZone(null);
                  showToast('🏁 Dirija-se ao início do segmento. O motor de velocidade o detectará automaticamente.');
                }}
              />
            ) : (
              <ZoneDetailsModal
                zone={selectedZone}
                currentUser={user}
                userLocation={playerLocation}
                isSessionActive={isSessionActive}
                onClose={() => setSelectedZone(null)}
                onChallengeZone={handleChallengeZone}
              />
            )}"""

content = content.replace(zone_modal, replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)


import sys
import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# REPLACE THE REAL CAPTURE BLOCK
old_real = r"""                        // Atualização otimista
                        setZones\(\(prev\) => prev.map\(\(item\) => \(item.id === z.id \? conqueredZone : item\)\)\);
                        setSelectedZone\(\(prev\) => \(prev\?.id === z.id \? conqueredZone : prev\)\);

                        // Fire & Forget Database Transaction
                        DatabaseService.queueZoneOperation\(zoneOperation\).catch\(e => \{
                          console.error\("Falha ao salvar conquista na Outbox:", e\);
                        \}\);

                        let clanPointsAwarded = 0;
                        let clanResultStr = '';
                        if \(userClan\) \{
                          if \(z.status === 'free'\) \{
                            clanPointsAwarded = 100;
                            clanResultStr = 'CAPTURED';
                          \} else if \(z.controller\?.clanId === userClan.id\) \{
                            clanPointsAwarded = 25;
                            clanResultStr = 'DEFENDED';
                          \} else \{
                            clanPointsAwarded = 150;
                            clanResultStr = 'CAPTURED';
                          \}
                        \}

                        setConquestResultModalData\(\{
                          zone: conqueredZone,
                          zoneName: z.name,
                          durationFormatted,
                          durationSeconds: durationSec,
                          distanceKmFormatted,
                          distanceMeters: attempt.distanceInsideZone,
                          xpEarned,
                          player: currentUserProfile,
                          trackPoints: attempt.trackPoints,
                          clanWar: userClan \? \{
                            points: clanPointsAwarded,
                            result: clanResultStr,
                            clanName: userClan.name,
                          \} : undefined
                        \}\);

                        setUser\(\(prev\) => \(\{
                          \.\.\.prev,
                          xp: \(prev.xp \|\| 0\) \+ xpEarned,
                        \}\)\);
                        if \(userClan\) \{
                           setClan\(\(prev\) => \(\{
                              \.\.\.prev!,
                              territoryScore: \(prev!.territoryScore \|\| 0\) \+ clanPointsAwarded
                           \}\)\);
                        \}"""

new_real = """                        // Fire & Forget Database Transaction
                        DatabaseService.queueZoneOperation(zoneOperation).catch(e => {
                          console.error("Falha ao salvar conquista na Outbox:", e);
                        });

                        showToast("Conquista enviada para validação do servidor...", "info");

                        setConquestResultModalData({
                          zone: z,
                          zoneName: z.name,
                          durationFormatted,
                          durationSeconds: durationSec,
                          distanceKmFormatted,
                          distanceMeters: attempt.distanceInsideZone,
                          xpEarned: 0,
                          player: currentUserProfile,
                          trackPoints: attempt.trackPoints,
                          isPending: true
                        });
                        
                        const unsub = onSnapshot(doc(db, 'zones', z.id, 'history', operationId), async (snap) => {
                            if (snap.exists()) {
                                const data = snap.data();
                                if (data.antiCheatStatus === 'approved') {
                                    showToast(`🏆 Zona ${z.name} confirmada!`);
                                    const refreshedZones = await DatabaseService.getZonesInRegion(null);
                                    setZones(refreshedZones);
                                    unsub();
                                } else if (data.antiCheatStatus === 'rejected') {
                                    showToast(`❌ Conquista rejeitada.`);
                                    unsub();
                                }
                            }
                        });"""

content = re.sub(old_real, new_real, content)

# REPLACE THE SIMULATE BLOCK
old_sim = r"""      z.dominance = 100;

      setZones\(\(prev\) => prev.map\(\(item\) => \(item.id === z.id \? conqueredZone : item\)\)\);
      setSelectedZone\(\(prev\) => \(prev\?.id === z.id \? conqueredZone : prev\)\);

      DatabaseService.queueZoneOperation\(zoneOperation\).catch\(e => \{
        console.error\("Falha ao salvar conquista simulada na Outbox:", e\);
      \}\);

      let clanPointsAwarded = 0;
      let clanResultStr = '';
      if \(userClan\) \{
        if \(z.status === 'free'\) \{
          clanPointsAwarded = 100;
          clanResultStr = 'CAPTURED';
        \} else if \(z.controller\?.clanId === userClan.id\) \{
          clanPointsAwarded = 25;
          clanResultStr = 'DEFENDED';
        \} else \{
          clanPointsAwarded = 150;
          clanResultStr = 'CAPTURED';
        \}
      \}

      setConquestResultModalData\(\{
        zone: conqueredZone,
        zoneName: z.name,
        durationFormatted: 'N/A',
        durationSeconds: 0,
        distanceKmFormatted: 'N/A',
        distanceMeters: 0,
        xpEarned,
        player: currentUserProfile,
        trackPoints: attempt.trackPoints,
        clanWar: userClan \? \{
          points: clanPointsAwarded,
          result: clanResultStr,
          clanName: userClan.name,
        \} : undefined
      \}\);

      setUser\(\(prev\) => \(\{
        \.\.\.prev,
        xp: \(prev.xp \|\| 0\) \+ xpEarned,
      \}\)\);
      if \(userClan\) \{
         setClan\(\(prev\) => \(\{
            \.\.\.prev!,
            territoryScore: \(prev!.territoryScore \|\| 0\) \+ clanPointsAwarded
         \}\)\);
      \}"""

new_sim = """      DatabaseService.queueZoneOperation(zoneOperation).catch(e => {
        console.error("Falha ao salvar conquista simulada na Outbox:", e);
      });

      showToast("Conquista simulada enviada para validação...", "info");

      setConquestResultModalData({
        zone: z,
        zoneName: z.name,
        durationFormatted: 'N/A',
        durationSeconds: 0,
        distanceKmFormatted: 'N/A',
        distanceMeters: 0,
        xpEarned: 0,
        player: currentUserProfile,
        trackPoints: attempt.trackPoints,
        isPending: true
      });
      
      const unsub = onSnapshot(doc(db, 'zones', z.id, 'history', operationId), async (snap) => {
          if (snap.exists()) {
              const data = snap.data();
              if (data.antiCheatStatus === 'approved') {
                  showToast(`🏆 Zona ${z.name} confirmada!`);
                  const refreshedZones = await DatabaseService.getZonesInRegion(null);
                  setZones(refreshedZones);
                  unsub();
              } else if (data.antiCheatStatus === 'rejected') {
                  showToast(`❌ Conquista rejeitada.`);
                  unsub();
              }
          }
      });"""

content = re.sub(old_sim, new_sim, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("App.tsx patched.")

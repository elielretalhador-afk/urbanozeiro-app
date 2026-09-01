import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """                        DatabaseService.queueSegmentOperation(operation).catch(console.error);

                        segmentAttemptRef.current = null;"""

replacement = """                        DatabaseService.queueSegmentOperation(operation).catch(console.error);

                        // FASE 2.6: Notificação de Recorde
                        const isNewRecord = !seg.bestRecord || timeSeconds < seg.bestRecord.timeSeconds;
                        if (isNewRecord) {
                          showToast(`🏆 NOVO RECORDE! Você conquistou o segmento com ${(timeSeconds).toFixed(2)}s e ${(avgSpeed).toFixed(1)} km/h.`);
                          // Optimistic update
                          seg.bestRecord = {
                            playerId: user.id,
                            playerName: user.name || user.nickname || 'Anônimo',
                            timeSeconds: timeSeconds,
                            averageSpeedKmH: avgSpeed,
                            date: new Date().toISOString()
                          };
                          setZones([...zonesRef.current]);
                        } else {
                          showToast(`Boa corrida! Tempo: ${(timeSeconds).toFixed(2)}s | Recorde atual: ${seg.bestRecord.timeSeconds}s`);
                        }

                        segmentAttemptRef.current = null;"""

content = content.replace(target, replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)


import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# 1. Add listener in useEffect
listener_effect = """  useEffect(() => {
    const handleOnline = () => {
      DatabaseService.processSyncQueue().catch(console.error);
    };
    window.addEventListener('online', handleOnline);
    handleOnline(); // Tenta no mount
    return () => window.removeEventListener('online', handleOnline);
  }, []);"""

listener_effect_replacement = """  useEffect(() => {
    const handleOnline = () => {
      DatabaseService.processSyncQueue().catch(console.error);
    };
    window.addEventListener('online', handleOnline);
    handleOnline(); // Tenta no mount
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // FASE 2.8: Listener real de servidor para Recordes de Segmento
  useEffect(() => {
    const handleSegmentRecordStatus = (e: any) => {
      const { isNewRecord, timeSeconds, averageSpeedKmH } = e.detail;
      if (isNewRecord) {
        showToast(`🏆 NOVO RECORDE! Você conquistou o segmento com ${timeSeconds.toFixed(2)}s e ${averageSpeedKmH.toFixed(1)} km/h.`);
        // Force refresh local zones to update map/lists
        DatabaseService.invalidateZonesCache();
        DatabaseService.getZonesInRegion(null).then(z => setZones(z));
      } else {
        showToast(`⏱ Tempo registrado no servidor: ${timeSeconds.toFixed(2)}s`);
      }
    };
    window.addEventListener('segment-record-status', handleSegmentRecordStatus);
    return () => window.removeEventListener('segment-record-status', handleSegmentRecordStatus);
  }, []);"""

content = content.replace(listener_effect, listener_effect_replacement)

# 2. Modify optimistic feedback
optimistic_block = """                        // FASE 2.6: Notificação de Recorde
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

neutral_block = """                        // FASE 2.8: Notificação neutra, a confirmação real do recorde vem via evento 'segment-record-status'
                        showToast(`🏁 Sprint concluído! Tempo: ${(timeSeconds).toFixed(2)}s. Sincronizando...`);

                        segmentAttemptRef.current = null;"""

content = content.replace(optimistic_block, neutral_block)

with open("src/App.tsx", "w") as f:
    f.write(content)

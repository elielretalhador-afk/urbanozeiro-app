const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /useEffect\(\(\) => \{\n\s*if \(sessionStatus !== 'IDLE' && sessionStatus !== 'COMPLETED'\) \{\n\s*const ongoingData = \{[\s\S]*?idbDel\('urb_db_ongoing_session'\)\.catch\(e => console\.warn\('Failed to delete ongoing session', e\)\);\n\s*\}\n\s*\}, \[sessionStatus, sessionDuration, activityTrack\]\);/m;

const optimizedSessionSave = `
  useEffect(() => {
    if (sessionStatus !== 'IDLE' && sessionStatus !== 'COMPLETED') {
      // Otimização: Só salva no IndexedDB a cada 10 segundos ou quando o track acumular novos pontos significativos
      // Para simplificar no React sem criar hooks customizados de debounce, faremos pelo modulo do tempo
      if (sessionDuration % 10 === 0) {
        const ongoingData = {
          status: sessionStatus,
          startTime: sessionStartTime,
          duration: sessionDuration,
          distanceKm: sessionDistanceKm,
          maxSpeedKmH: sessionMaxSpeedKmH,
          track: activityTrack,
          activeZones: Array.from(activeZoneActivitiesRef.current.entries()),
          visitedZones: Array.from(sessionVisitedZonesRef.current.entries())
        };
        idbSet('urb_db_ongoing_session', ongoingData).catch(e => console.warn('Failed to save ongoing session', e));
      }
    } else if (sessionStatus === 'IDLE' || sessionStatus === 'COMPLETED') {
      idbDel('urb_db_ongoing_session').catch(e => console.warn('Failed to delete ongoing session', e));
    }
  }, [sessionStatus, sessionDuration]); // Removed activityTrack to avoid triggering every single GPS point if we are tracking time anyway
`;

content = content.replace(regex, optimizedSessionSave);

fs.writeFileSync('src/App.tsx', content);

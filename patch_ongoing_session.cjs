const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /import \{ DatabaseService \} from "\.\/services\/db";/,
  `import { DatabaseService } from "./services/db";\nimport { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";`
);

const sessionRecovery = `
  // --- Recovery of Ongoing Session ---
  useEffect(() => {
    idbGet('urb_db_ongoing_session').then((data: any) => {
      if (data && data.status !== 'IDLE' && data.status !== 'COMPLETED') {
        setSessionStatus(data.status);
        setSessionStartTime(data.startTime);
        setSessionDuration(data.duration);
        setSessionDistanceKm(data.distanceKm);
        setSessionMaxSpeedKmH(data.maxSpeedKmH);
        setActivityTrack(data.track || []);
        
        // Restore zone states if we want, simplified here
        if (data.activeZones) {
          activeZoneActivitiesRef.current = new Map(data.activeZones);
        }
        if (data.visitedZones) {
          sessionVisitedZonesRef.current = new Map(data.visitedZones);
        }
      }
    }).catch(e => console.warn('Failed to load ongoing session', e));
  }, []);

  useEffect(() => {
    if (sessionStatus !== 'IDLE' && sessionStatus !== 'COMPLETED') {
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
    } else if (sessionStatus === 'IDLE' || sessionStatus === 'COMPLETED') {
      idbDel('urb_db_ongoing_session').catch(e => console.warn('Failed to delete ongoing session', e));
    }
  }, [sessionStatus, sessionDuration, activityTrack]);
  // ------------------------------------
`;

// Insert after the state definitions for session
content = content.replace(
  /const \[viewedHistoricalSession, setViewedHistoricalSession\] = useState<ActivitySession \| null>\(null\);/,
  `const [viewedHistoricalSession, setViewedHistoricalSession] = useState<ActivitySession | null>(null);\n${sessionRecovery}`
);

fs.writeFileSync('src/App.tsx', content);

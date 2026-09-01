import re

with open('src/services/db.ts', 'r') as f:
    content = f.read()

# Add import
import_str = "import { TelemetryService } from './telemetry';\n"
if "import { TelemetryService }" not in content:
    content = import_str + content

content = content.replace("console.error(`[SyncQueue] Falha ao enviar sessão ${s.id}:`, error); throw error;", 
"""console.error(`[SyncQueue] Falha ao enviar sessão ${s.id}:`, error);
          TelemetryService.logEvent({ eventName: 'outbox_sync_failure', category: 'SYNC', details: { type: 'session', id: s.id }, error });""")

content = content.replace("console.error(`[SyncQueue] Falha ao enviar atividade ${a.id}:`, error); throw error;", 
"""console.error(`[SyncQueue] Falha ao enviar atividade ${a.id}:`, error);
          TelemetryService.logEvent({ eventName: 'outbox_sync_failure', category: 'SYNC', details: { type: 'activity', id: a.id }, error });""")

content = content.replace("console.error(`[SyncQueue] Falha ao enviar zona ${op.operationId}:`, error); throw error;",
"""console.error(`[SyncQueue] Falha ao enviar zona ${op.operationId}:`, error);
          TelemetryService.logEvent({ eventName: 'outbox_sync_failure', category: 'SYNC', details: { type: 'zone', id: op.operationId }, error });""")

content = content.replace("console.error(`[SyncQueue] Falha ao enviar segmento ${op.operationId}:`, error); throw error;",
"""console.error(`[SyncQueue] Falha ao enviar segmento ${op.operationId}:`, error);
          TelemetryService.logEvent({ eventName: 'outbox_sync_failure', category: 'SYNC', details: { type: 'segment', id: op.operationId }, error });""")

# Add success telemetry at the end of the try block, right before isSyncing = false
content = content.replace("      isSyncing = false;\n    } catch (e) {",
"""      TelemetryService.logEvent({
        eventName: 'outbox_sync_success',
        category: 'SYNC',
        details: {
          sessions: successfulSessionIds.size,
          activities: successfulActivityIds.size,
          zones: successfulZoneIds.size,
          segments: successfulSegmentIds.size
        }
      });
      isSyncing = false;
    } catch (e) {""")

with open('src/services/db.ts', 'w') as f:
    f.write(content)

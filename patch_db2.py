import re

with open('src/services/db.ts', 'r') as f:
    content = f.read()

content = content.replace("      if (successfulZoneIds.size > 0) {\n        this.invalidateZonesCache();\n      }\n\n    } catch (error) {",
"""      if (successfulZoneIds.size > 0) {
        this.invalidateZonesCache();
      }
      TelemetryService.logEvent({
        eventName: 'outbox_sync_success',
        category: 'SYNC',
        details: {
          sessions: successfulSessionIds.size,
          activities: successfulActivityIds.size,
          zones: successfulZoneIds.size,
          segments: successfulSegmentIds.size
        }
      });
    } catch (error) {""")

content = content.replace("console.error('[SyncQueue] Erro crítico no loop de sincronização:', error);",
"""console.error('[SyncQueue] Erro crítico no loop de sincronização:', error);
      TelemetryService.logEvent({ eventName: 'outbox_sync_failure', category: 'SYNC', details: { type: 'critical_loop_error' }, error });""")


with open('src/services/db.ts', 'w') as f:
    f.write(content)

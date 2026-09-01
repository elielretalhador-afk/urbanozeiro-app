import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Revert the previous mistake
content = content.replace("setIsGpsActive(true);\n          TelemetryService.logEvent({ eventName: 'gps_recovered', category: 'GPS' });", "setIsGpsActive(true);")

# Better telemetry for activity states
content = content.replace("handleStartSession = () => {",
"""handleStartSession = () => {
    TelemetryService.logEvent({ eventName: 'activity_started', category: 'ACTIVITY' });""")

content = content.replace("setSessionStatus('COMPLETED');",
"""setSessionStatus('COMPLETED');
    TelemetryService.logEvent({ eventName: 'activity_finished', category: 'ACTIVITY', details: { distance: sessionDistanceKm } });""")

content = content.replace("setSessionStatus('PAUSED');",
"""setSessionStatus('PAUSED');
    TelemetryService.logEvent({ eventName: 'activity_paused', category: 'ACTIVITY' });""")

with open('src/App.tsx', 'w') as f:
    f.write(content)

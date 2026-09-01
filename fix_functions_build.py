import sys
import re

with open('functions/src/index.ts', 'r') as f:
    content = f.read()

content = content.replace("await autoAwardSeasonPoints('ZONE_CONQUEST', event.params.operationId, event.params.zoneId, historyData.playerId, currentZone.controller?.clanId || null);", "await autoAwardSeasonPoints('ZONE_CONQUEST', event.params.operationId, event.params.zoneId, historyData.playerId, playerClanId);")

content = content.replace("export const processSeasonEvent = functions.https.onCall(async (data: any, context: any) => {", "export const processSeasonEvent = functions.https.onCall(async (request: any) => {\n    const data = request.data;\n    const context = { auth: request.auth };")

content = content.replace("export const finalizeSeason = functions.https.onCall(async (data: any, context: any) => {", "export const finalizeSeason = functions.https.onCall(async (request: any) => {\n    const data = request.data;\n    const context = { auth: request.auth };")

with open('functions/src/index.ts', 'w') as f:
    f.write(content)

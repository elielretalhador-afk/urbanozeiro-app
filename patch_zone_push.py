import re

with open('functions/src/index.ts', 'r') as f:
    content = f.read()

# Add imports
import_statement = "import { checkPreferencesAndSendPush } from './notifications';\nimport * as admin"
content = content.replace("import * as admin", import_statement)

# Replace the block to store info for notification
old_block = """                        // Handle Enemy Zone count reduction
                        const enemyClanId = currentZone.controller?.clanId;
                        if (enemyClanId && enemyClanId !== playerClanId) {
                            const enemyClanRef = db.collection('clans').doc(enemyClanId);
                            const enemyClanDoc = await transaction.get(enemyClanRef);
                            if (enemyClanDoc.exists) {
                                const eClanData = enemyClanDoc.data();
                                transaction.update(enemyClanRef, {
                                    zonesControlledCount: Math.max(0, (eClanData.zonesControlledCount || 1) - 1)
                                });
                            }
                        }"""

new_block = """                        // Handle Enemy Zone count reduction
                        const enemyClanId = currentZone.controller?.clanId;
                        if (enemyClanId && enemyClanId !== playerClanId) {
                            const enemyClanRef = db.collection('clans').doc(enemyClanId);
                            const enemyClanDoc = await transaction.get(enemyClanRef);
                            if (enemyClanDoc.exists) {
                                const eClanData = enemyClanDoc.data();
                                transaction.update(enemyClanRef, {
                                    zonesControlledCount: Math.max(0, (eClanData.zonesControlledCount || 1) - 1)
                                });
                                // Schedule notification
                                (transaction as any)._pushNotification = {
                                    enemyClanData: eClanData,
                                    zoneName: currentZone.name,
                                    zoneId: zoneId
                                };
                            }
                        }"""

content = content.replace(old_block, new_block)

after_transaction_old = """    });
});"""

after_transaction_new = """        return (transaction as any)._pushNotification;
    });

    if (txResult && txResult.enemyClanData) {
       // Send push to enemy clan members
       const eClanData = txResult.enemyClanData;
       if (eClanData.memberIds && Array.isArray(eClanData.memberIds)) {
         for (const memberId of eClanData.memberIds) {
           await checkPreferencesAndSendPush(
             memberId,
             'notifyZoneConquest',
             '⚔️ Seu território foi tomado',
             `O clã adversário conquistou a zona ${txResult.zoneName}.`,
             { type: 'zone_lost', entityId: txResult.zoneId }
           );
         }
       }
    }

});"""

# Because after_transaction is generic, I'll search for the end of the transaction in onZoneConquestCreated
# Wait, this is safer using regex
content = re.sub(r'    \}\);\n\}\);(?=\n\nexport const processSeasonEvent)', '        return (transaction as any)._pushNotification;\n    });\n\n    if (txResult && txResult.enemyClanData) {\n       const eClanData = txResult.enemyClanData;\n       if (eClanData.memberIds && Array.isArray(eClanData.memberIds)) {\n         for (const memberId of eClanData.memberIds) {\n           await checkPreferencesAndSendPush(\n             memberId,\n             \'notifyZoneConquest\',\n             \'⚔️ Seu território foi tomado\',\n             `O clã adversário conquistou a zona ${txResult.zoneName}.`,\n             { type: \'zone_lost\', entityId: txResult.zoneId }\n           );\n         }\n       }\n    }\n});', content)

with open('functions/src/index.ts', 'w') as f:
    f.write(content)

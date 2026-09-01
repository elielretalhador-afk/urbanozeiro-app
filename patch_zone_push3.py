with open('functions/src/index.ts', 'r') as f:
    content = f.read()

end_transaction_block = """            transaction.update(zoneRef, updatedZoneData);
        }
    });"""

new_end_transaction_block = """            transaction.update(zoneRef, updatedZoneData);
        }
        return (transaction as any)._pushNotification;
    });

    if (txResult && txResult.enemyClanData) {
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
"""
content = content.replace(end_transaction_block, new_end_transaction_block)

with open('functions/src/index.ts', 'w') as f:
    f.write(content)

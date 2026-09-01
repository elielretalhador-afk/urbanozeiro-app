import sys

with open('src/services/db.ts', 'r') as f:
    content = f.read()

old_tx_logic = """      // Merge manually, respecting rules
      const mergedZone = { ...currentZone, ...updatedData };

      transaction.update(zoneRef, updatedData);

      // Save the trackpoints to a subcollection document for anti-cheat audit
      const proofRef = doc(db, 'zones', zoneId, 'history', operation.operationId);
      transaction.set(proofRef, {
        operationId: operation.operationId,
        playerId: operation.playerId,
        createdAt: operation.createdAt,
        trackPoints: trackPoints
      });

      return mergedZone;
    });"""

new_tx_logic = """      // Clan Wars territorial logic
      const newClanId = updatedData.controller?.clanId;
      const oldClanId = currentZone.controller?.clanId;
      
      let pointsAwarded = 0;
      let resultStr = 'CONTESTED';

      if (currentZone.status === 'free') {
        pointsAwarded = 100;
        resultStr = 'CAPTURED';
      } else if (oldClanId && newClanId && oldClanId === newClanId) {
        pointsAwarded = 25;
        resultStr = 'DEFENDED';
      } else {
        pointsAwarded = 150;
        resultStr = 'CAPTURED';
      }

      if (newClanId) {
         const winnerRef = doc(db, 'clans', newClanId);
         const winnerSnap = await transaction.get(winnerRef);
         if (winnerSnap.exists()) {
             const wData = winnerSnap.data();
             const newScore = (wData.territoryScore || 0) + pointsAwarded;
             const isNewCapture = (resultStr === 'CAPTURED' && oldClanId !== newClanId);
             transaction.update(winnerRef, {
                 territoryScore: newScore,
                 zonesControlledCount: (wData.zonesControlledCount || 0) + (isNewCapture ? 1 : 0)
             });
         }
      }

      if (oldClanId && newClanId !== oldClanId && resultStr === 'CAPTURED') {
         const loserRef = doc(db, 'clans', oldClanId);
         const loserSnap = await transaction.get(loserRef);
         if (loserSnap.exists()) {
             const lData = loserSnap.data();
             transaction.update(loserRef, {
                 zonesControlledCount: Math.max(0, (lData.zonesControlledCount || 0) - 1)
             });
         }
      }

      if (newClanId) {
        const battleRef = doc(db, 'clanBattles', operation.operationId);
        transaction.set(battleRef, {
          battleId: operation.operationId,
          zoneId: zoneId,
          attackerClanId: newClanId,
          defenderClanId: oldClanId || null,
          initiatingPlayerId: operation.playerId,
          result: resultStr,
          pointsAwarded: pointsAwarded,
          createdAt: operation.createdAt
        });
      }

      // Merge manually, respecting rules
      const mergedZone = { ...currentZone, ...updatedData };

      transaction.update(zoneRef, updatedData);

      // Save the trackpoints to a subcollection document for anti-cheat audit
      const proofRef = doc(db, 'zones', zoneId, 'history', operation.operationId);
      transaction.set(proofRef, {
        operationId: operation.operationId,
        playerId: operation.playerId,
        createdAt: operation.createdAt,
        trackPoints: trackPoints
      });

      return mergedZone;
    });"""

content = content.replace(old_tx_logic, new_tx_logic)

with open('src/services/db.ts', 'w') as f:
    f.write(content)

import sys

with open('functions/src/index.ts', 'r') as f:
    content = f.read()

# We need to replace the onZoneConquestCreated function

new_zone_func = """// ----------------------------------------------------------------------
// ZONE CONQUESTS AUDIT (PHASE 3.9 - SERVER AUTHORITATIVE)
// ----------------------------------------------------------------------
export const onZoneConquestCreated = functions.firestore.onDocumentCreated(
  'zones/{zoneId}/history/{operationId}',
  async (event: any) => {
    const snapshot = event.data;
    if (!snapshot) return;
    const historyData = snapshot.data();
    
    // Idempotency: Check if already processed
    if (historyData.antiCheatStatus) {
      return;
    }

    const zoneId = event.params.zoneId;
    const playerId = historyData.playerId;
    const trackPoints = historyData.trackPoints || [];
    const now = historyData.createdAt || Date.now();
    
    // 1. Audit Track
    const auditResult = auditTrack(trackPoints);
    let antiCheatStatus = auditResult.suspicious ? (auditResult.riskScore > 80 ? 'rejected' : 'suspicious') : 'approved';

    // 2. Server-Side Transaction
    await db.runTransaction(async (transaction: any) => {
        const zoneRef = db.collection('zones').doc(zoneId);
        const zoneDoc = await transaction.get(zoneRef);
        
        if (!zoneDoc.exists) {
            transaction.update(snapshot.ref, { antiCheatStatus: 'rejected', rejectionReason: 'zone_not_found' });
            return;
        }
        
        const currentZone = zoneDoc.data()!;
        
        // Load Player to get REAL clanId
        const playerRef = db.collection('users').doc(playerId);
        const playerDoc = await transaction.get(playerRef);
        let realClanId = null;
        let playerProfile = null;
        
        if (playerDoc.exists) {
             playerProfile = playerDoc.data();
             // Ensure the player is in the clan they claim, or find their clan.
             // We can query the clans collection if we need to, but runTransaction doesn't allow queries after reads easily if we want to write.
             // Let's do a fast query before the transaction? Or we can query inside if we don't care about extreme performance.
        }

        // Wait, we need to know the clanId securely.
        // It's better to fetch the clanId securely.
        transaction.update(snapshot.ref, {
            antiCheatStatus: antiCheatStatus,
            antiCheat: auditResult
        });
        
        if (antiCheatStatus !== 'approved' && antiCheatStatus !== 'suspicious') {
             // Do not grant rewards
             return;
        }

        // ... we will fill the rest
    });
  }
);
"""

# wait, we need to do it properly.

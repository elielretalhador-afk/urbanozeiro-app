import re

with open("src/services/db.ts", "r") as f:
    content = f.read()

# Make syncSegmentTransaction return a result object
sync_fn = """  async syncSegmentTransaction(operation: SegmentOperation): Promise<void> {
    const segmentRef = doc(db, 'segments', operation.segmentId);
    const attemptRef = doc(db, 'segments', operation.segmentId, 'attempts', operation.attemptId);

    await runTransaction(db, async (transaction) => {
      const segmentDoc = await transaction.get(segmentRef);
      // Even if segment metadata doesn't exist, we can still record attempts or initialize it.
      let currentRecord = null;
      if (segmentDoc.exists()) {
        const data = segmentDoc.data();
        currentRecord = data.bestRecord || null;
      }

      // Check idempotency for the attempt
      const attemptDoc = await transaction.get(attemptRef);
      if (attemptDoc.exists()) {
        // Already processed
        return;
      }

      // Record the attempt
      transaction.set(attemptRef, {
        operationId: operation.operationId,
        attemptId: operation.attemptId,
        playerId: operation.playerId,
        playerName: operation.playerName || 'Anônimo',
        createdAt: operation.createdAt,
        durationMs: operation.durationMs,
        timeSeconds: operation.timeSeconds,
        averageSpeedKmH: operation.averageSpeedKmH,
        maxSpeedKmH: operation.maxSpeedKmH,
        direction: operation.direction,
        trackPoints: operation.trackPoints
      });

      // Update best record if it's better or if there is no record
      if (segmentDoc.exists() && (!currentRecord || operation.timeSeconds < currentRecord.timeSeconds)) {
        transaction.update(segmentRef, {
          bestRecord: {
            playerId: operation.playerId,
            playerName: operation.playerName || 'Anônimo',
            timeSeconds: operation.timeSeconds,
            averageSpeedKmH: operation.averageSpeedKmH,
            date: new Date(operation.createdAt).toISOString()
          },
          updatedAt: new Date(operation.createdAt).toISOString()
        });
      }
    });
  },"""

sync_fn_replacement = """  async syncSegmentTransaction(operation: SegmentOperation): Promise<{ status: 'synced' | 'already_exists', isNewRecord: boolean }> {
    const segmentRef = doc(db, 'segments', operation.segmentId);
    const attemptRef = doc(db, 'segments', operation.segmentId, 'attempts', operation.attemptId);

    return await runTransaction(db, async (transaction) => {
      const segmentDoc = await transaction.get(segmentRef);
      // Even if segment metadata doesn't exist, we can still record attempts or initialize it.
      let currentRecord = null;
      if (segmentDoc.exists()) {
        const data = segmentDoc.data();
        currentRecord = data.bestRecord || null;
      }

      // Check idempotency for the attempt
      const attemptDoc = await transaction.get(attemptRef);
      if (attemptDoc.exists()) {
        // Already processed
        return { status: 'already_exists', isNewRecord: false };
      }

      // Record the attempt
      transaction.set(attemptRef, {
        operationId: operation.operationId,
        attemptId: operation.attemptId,
        playerId: operation.playerId,
        playerName: operation.playerName || 'Anônimo',
        createdAt: operation.createdAt,
        durationMs: operation.durationMs,
        timeSeconds: operation.timeSeconds,
        averageSpeedKmH: operation.averageSpeedKmH,
        maxSpeedKmH: operation.maxSpeedKmH,
        direction: operation.direction,
        trackPoints: operation.trackPoints
      });

      let isNewRecord = false;
      // Update best record if it's better or if there is no record
      if (segmentDoc.exists() && (!currentRecord || operation.timeSeconds < currentRecord.timeSeconds)) {
        isNewRecord = true;
        transaction.update(segmentRef, {
          bestRecord: {
            playerId: operation.playerId,
            playerName: operation.playerName || 'Anônimo',
            timeSeconds: operation.timeSeconds,
            averageSpeedKmH: operation.averageSpeedKmH,
            date: new Date(operation.createdAt).toISOString()
          },
          updatedAt: new Date(operation.createdAt).toISOString()
        });
      }

      return { status: 'synced', isNewRecord };
    });
  },"""

content = content.replace(sync_fn, sync_fn_replacement)

# Update processSyncQueue calling it
sync_loop = """      for (const op of pendingSegments) {
        try {
          await this.syncSegmentTransaction(op);
          successfulSegmentIds.add(op.operationId);
        } catch (error) {
          console.error(`[SyncQueue] Falha ao enviar segmento ${op.operationId}:`, error);
          failedSegmentIds.add(op.operationId);
        }
      }"""

sync_loop_replacement = """      for (const op of pendingSegments) {
        try {
          const result = await this.syncSegmentTransaction(op);
          successfulSegmentIds.add(op.operationId);
          if (result.status === 'synced') {
            window.dispatchEvent(new CustomEvent('segment-record-status', {
              detail: { isNewRecord: result.isNewRecord, timeSeconds: op.timeSeconds, averageSpeedKmH: op.averageSpeedKmH }
            }));
          }
        } catch (error) {
          console.error(`[SyncQueue] Falha ao enviar segmento ${op.operationId}:`, error);
          failedSegmentIds.add(op.operationId);
        }
      }"""

content = content.replace(sync_loop, sync_loop_replacement)

with open("src/services/db.ts", "w") as f:
    f.write(content)


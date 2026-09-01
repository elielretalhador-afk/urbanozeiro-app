"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onZoneConquestCreated = exports.onSegmentAttemptCreated = void 0;
const functions = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
const trackAudit_1 = require("./antiCheat/trackAudit");
const segmentMath_1 = require("./utils/segmentMath");
admin.initializeApp();
const db = admin.firestore();
// ----------------------------------------------------------------------
// SEGMENT ATTEMPTS AUDIT
// ----------------------------------------------------------------------
exports.onSegmentAttemptCreated = functions.firestore.onDocumentCreated('segments/{segmentId}/attempts/{attemptId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot)
        return;
    const attemptData = snapshot.data();
    // Idempotency: Check if already processed
    if (attemptData.antiCheatStatus) {
        return;
    }
    const segmentId = event.params.segmentId;
    const trackPoints = attemptData.trackPoints || [];
    const auditResult = (0, trackAudit_1.auditTrack)(trackPoints);
    // Optional: Cross-reference with segment path
    let pathStatus = 'unknown';
    if (auditResult.riskScore < 100) { // Don't bother if already completely invalid
        const segmentDoc = await db.collection('segments').doc(segmentId).get();
        if (segmentDoc.exists) {
            const segmentData = segmentDoc.data();
            const segmentPath = segmentData === null || segmentData === void 0 ? void 0 : segmentData.path;
            if (segmentPath && segmentPath.length >= 2) {
                // Check if they deviated significantly (simplistic check for now)
                let outOfBoundsCount = 0;
                for (const pt of trackPoints) {
                    const distToPathResult = (0, segmentMath_1.getDistanceToPath)([pt.latitude, pt.longitude], segmentPath);
                    if (!distToPathResult || distToPathResult.distanceMeters > 30) {
                        outOfBoundsCount++;
                    }
                }
                if (outOfBoundsCount > trackPoints.length * 0.3) {
                    auditResult.reasons.push('trajectory_out_of_bounds');
                    auditResult.riskScore += 30;
                }
                pathStatus = 'checked';
            }
        }
    }
    // Re-evaluate suspicious flag and cap score
    if (auditResult.riskScore > 100)
        auditResult.riskScore = 100;
    if (auditResult.riskScore > 20)
        auditResult.suspicious = true;
    const antiCheatStatus = auditResult.suspicious ? (auditResult.riskScore > 80 ? 'rejected' : 'suspicious') : 'approved';
    // FASE 3.8 - Update attempt and bestRecord atomically
    await db.runTransaction(async (transaction) => {
        const segRef = db.collection('segments').doc(segmentId);
        const segSnap = await transaction.get(segRef);
        transaction.update(snapshot.ref, {
            antiCheatStatus: antiCheatStatus,
            antiCheat: auditResult
        });
        if (!segSnap.exists)
            return;
        const currentData = segSnap.data();
        const currentBest = currentData === null || currentData === void 0 ? void 0 : currentData.bestRecord;
        // Only update bestRecord if the run is fully approved!
        if (antiCheatStatus === 'approved' && attemptData.timeSeconds) {
            const isNewRecord = !currentBest || attemptData.timeSeconds < currentBest.timeSeconds;
            if (isNewRecord) {
                transaction.update(segRef, {
                    bestRecord: {
                        playerId: attemptData.playerId,
                        playerName: attemptData.playerName || 'Anônimo',
                        timeSeconds: attemptData.timeSeconds,
                        averageSpeedKmH: attemptData.averageSpeedKmH || 0,
                        date: attemptData.createdAt ? new Date(attemptData.createdAt).toISOString() : new Date().toISOString()
                    },
                    updatedAt: new Date().toISOString()
                });
            }
        }
    });
});
// ----------------------------------------------------------------------
// ZONE CONQUESTS AUDIT
// ----------------------------------------------------------------------
exports.onZoneConquestCreated = functions.firestore.onDocumentCreated('zones/{zoneId}/history/{operationId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot)
        return;
    const historyData = snapshot.data();
    // Idempotency: Check if already processed
    if (historyData.antiCheatStatus) {
        return;
    }
    const trackPoints = historyData.trackPoints || [];
    const auditResult = (0, trackAudit_1.auditTrack)(trackPoints);
    // Because zone history doesn't strictly have a path, we only do cinematic audit.
    const antiCheatStatus = auditResult.suspicious ? (auditResult.riskScore > 80 ? 'rejected' : 'suspicious') : 'approved';
    // FASE 3.8 - Update history entry
    // NOTE: In the future, this audit will be used to revoke territory score if rejected!
    await snapshot.ref.update({
        antiCheatStatus: antiCheatStatus,
        antiCheat: auditResult
    });
});
//# sourceMappingURL=index.js.map
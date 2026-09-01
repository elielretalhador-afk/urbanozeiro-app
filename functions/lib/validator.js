"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_ALLOWED_ACCELERATION_KMH_S = exports.MAX_ALLOWED_SPEED_KMH = exports.MAX_CROSS_TRACK_DISTANCE_METERS = void 0;
exports.validateAttempt = validateAttempt;
const crypto = require("crypto");
const segmentMath_1 = require("./utils/segmentMath");
exports.MAX_CROSS_TRACK_DISTANCE_METERS = 30;
exports.MAX_ALLOWED_SPEED_KMH = 80;
exports.MAX_ALLOWED_ACCELERATION_KMH_S = 30;
function validateAttempt(trackPoints, segmentPath) {
    var _a, _b;
    const result = {
        status: 'rejected',
        suspicionScore: 0,
        validatedAt: Date.now()
    };
    if (!trackPoints || trackPoints.length < 2) {
        result.rejectionReason = 'invalid_track';
        return result;
    }
    for (let i = 1; i < trackPoints.length; i++) {
        if (trackPoints[i].timestamp < trackPoints[i - 1].timestamp) {
            result.rejectionReason = 'invalid_timestamp';
            return result;
        }
    }
    const firstPoint = trackPoints[0];
    const lastPoint = trackPoints[trackPoints.length - 1];
    const officialTimeSeconds = (lastPoint.timestamp - firstPoint.timestamp) / 1000;
    if (officialTimeSeconds <= 0) {
        result.rejectionReason = 'invalid_timestamp';
        return result;
    }
    const startDist = (0, segmentMath_1.distanceToSegmentStart)([firstPoint.latitude, firstPoint.longitude], segmentPath);
    const endDist = (0, segmentMath_1.distanceToSegmentEnd)([lastPoint.latitude, lastPoint.longitude], segmentPath);
    const distStartToStart = startDist !== null ? startDist : Infinity;
    const distStartToEnd = (_a = (0, segmentMath_1.distanceToSegmentEnd)([firstPoint.latitude, firstPoint.longitude], segmentPath)) !== null && _a !== void 0 ? _a : Infinity;
    if (distStartToStart > exports.MAX_CROSS_TRACK_DISTANCE_METERS && distStartToEnd > exports.MAX_CROSS_TRACK_DISTANCE_METERS) {
        result.rejectionReason = 'invalid_start';
        return result;
    }
    const distEndToEnd = endDist !== null ? endDist : Infinity;
    const distEndToStart = (_b = (0, segmentMath_1.distanceToSegmentStart)([lastPoint.latitude, lastPoint.longitude], segmentPath)) !== null && _b !== void 0 ? _b : Infinity;
    if (distEndToEnd > exports.MAX_CROSS_TRACK_DISTANCE_METERS && distEndToStart > exports.MAX_CROSS_TRACK_DISTANCE_METERS) {
        result.rejectionReason = 'invalid_finish';
        return result;
    }
    let officialDistanceMeters = 0;
    let officialMaxSpeedKmH = 0;
    let lastCalculatedSpeedKmH = 0;
    for (let i = 0; i < trackPoints.length; i++) {
        const pt = trackPoints[i];
        const distToPathResult = (0, segmentMath_1.getDistanceToPath)([pt.latitude, pt.longitude], segmentPath);
        if (!distToPathResult || distToPathResult.distanceMeters > exports.MAX_CROSS_TRACK_DISTANCE_METERS) {
            result.rejectionReason = 'trajectory_out_of_bounds';
            return result;
        }
        if (i > 0) {
            const prev = trackPoints[i - 1];
            const deltaMeters = (0, segmentMath_1.haversineDistanceMeters)([prev.latitude, prev.longitude], [pt.latitude, pt.longitude]);
            const deltaSeconds = (pt.timestamp - prev.timestamp) / 1000;
            officialDistanceMeters += deltaMeters;
            if (deltaSeconds > 0) {
                const speedMs = deltaMeters / deltaSeconds;
                const speedKmH = speedMs * 3.6;
                if (speedKmH > exports.MAX_ALLOWED_SPEED_KMH) {
                    result.rejectionReason = 'impossible_segment_velocity';
                    return result;
                }
                if (speedKmH > officialMaxSpeedKmH) {
                    officialMaxSpeedKmH = speedKmH;
                }
                const accelerationKmhS = (speedKmH - lastCalculatedSpeedKmH) / deltaSeconds;
                if (accelerationKmhS > exports.MAX_ALLOWED_ACCELERATION_KMH_S) {
                    result.suspicionScore += 50;
                    if (result.suspicionScore >= 100) {
                        result.rejectionReason = 'impossible_acceleration';
                        return result;
                    }
                }
                lastCalculatedSpeedKmH = speedKmH;
            }
        }
    }
    const hash = crypto.createHash('sha256');
    trackPoints.forEach(pt => {
        hash.update(`${pt.latitude.toFixed(6)},${pt.longitude.toFixed(6)},${pt.timestamp};`);
    });
    const trackHash = hash.digest('hex');
    const officialAverageSpeedKmH = officialTimeSeconds > 0 ? (officialDistanceMeters / officialTimeSeconds) * 3.6 : 0;
    if (officialAverageSpeedKmH > exports.MAX_ALLOWED_SPEED_KMH) {
        result.rejectionReason = 'impossible_segment_velocity';
        return result;
    }
    result.status = 'validated';
    result.officialTimeSeconds = officialTimeSeconds;
    result.officialDistanceMeters = officialDistanceMeters;
    result.officialAverageSpeedKmH = officialAverageSpeedKmH;
    result.officialMaxSpeedKmH = officialMaxSpeedKmH;
    result.trackHash = trackHash;
    return result;
}
//# sourceMappingURL=validator.js.map
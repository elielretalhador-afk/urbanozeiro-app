"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_BAD_ACCURACY_METERS = exports.TELEPORT_THRESHOLD_KMH = exports.MAX_REASONABLE_ACCELERATION_KMH_S = exports.MAX_REASONABLE_SPEED_KMH = void 0;
exports.auditTrack = auditTrack;
// Configurable Constants
exports.MAX_REASONABLE_SPEED_KMH = 65; // High speed for urban skating, above this is very suspicious
exports.MAX_REASONABLE_ACCELERATION_KMH_S = 15; // 0 to 15 km/h in 1 second is huge for a skater
exports.TELEPORT_THRESHOLD_KMH = 100; // If you teleport faster than 100km/h
exports.MAX_BAD_ACCURACY_METERS = 100;
function haversineDistanceMeters(coord1, coord2) {
    const R = 6371e3; // Earth's radius in meters
    const lat1 = (coord1[0] * Math.PI) / 180;
    const lat2 = (coord2[0] * Math.PI) / 180;
    const deltaLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
    const deltaLng = ((coord2[1] - coord1[1]) * Math.PI) / 180;
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(deltaLng / 2) *
            Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function auditTrack(trackPoints) {
    const result = {
        suspicious: false,
        riskScore: 0,
        reasons: []
    };
    if (!trackPoints || trackPoints.length < 2) {
        result.riskScore = 100;
        result.suspicious = true;
        result.reasons.push('insufficient_track_points');
        return result;
    }
    // Validate coordinates and timestamps
    for (const pt of trackPoints) {
        if (pt.latitude < -90 ||
            pt.latitude > 90 ||
            pt.longitude < -180 ||
            pt.longitude > 180 ||
            isNaN(pt.latitude) ||
            isNaN(pt.longitude) ||
            isNaN(pt.timestamp) ||
            pt.timestamp <= 0) {
            result.riskScore = 100;
            result.suspicious = true;
            result.reasons.push('invalid_coordinates_or_timestamp');
            return result;
        }
    }
    let totalJumps = 0;
    let totalBadAccuracy = 0;
    let maxSpeedKmH = 0;
    let maxAcceleration = 0;
    let lastCalculatedSpeedKmH = 0;
    for (let i = 1; i < trackPoints.length; i++) {
        const prev = trackPoints[i - 1];
        const pt = trackPoints[i];
        const deltaSeconds = (pt.timestamp - prev.timestamp) / 1000;
        if (deltaSeconds < 0) {
            result.riskScore = 100;
            result.suspicious = true;
            result.reasons.push('invalid_timestamp_sequence');
            return result;
        }
        // Allow multiple points in the same millisecond (e.g. synthetic data), but don't calculate speed for them to avoid infinity
        if (deltaSeconds === 0)
            continue;
        const deltaMeters = haversineDistanceMeters([prev.latitude, prev.longitude], [pt.latitude, pt.longitude]);
        const speedMs = deltaMeters / deltaSeconds;
        const speedKmH = speedMs * 3.6;
        if (speedKmH > maxSpeedKmH)
            maxSpeedKmH = speedKmH;
        const accelerationKmhS = Math.abs(speedKmH - lastCalculatedSpeedKmH) / deltaSeconds;
        if (accelerationKmhS > maxAcceleration)
            maxAcceleration = accelerationKmhS;
        if (speedKmH > exports.TELEPORT_THRESHOLD_KMH) {
            result.reasons.push('gps_teleportation');
            result.riskScore += 40;
        }
        else if (speedKmH > exports.MAX_REASONABLE_SPEED_KMH) {
            result.reasons.push('impossible_speed');
            result.riskScore += 30;
        }
        if (accelerationKmhS > exports.MAX_REASONABLE_ACCELERATION_KMH_S) {
            result.reasons.push('impossible_acceleration');
            result.riskScore += 20;
        }
        if (pt.accuracy && pt.accuracy > exports.MAX_BAD_ACCURACY_METERS) {
            totalBadAccuracy++;
        }
        // A jump is a combination of bad accuracy and very fast movement
        if (pt.accuracy && pt.accuracy > 50 && speedKmH > 40) {
            totalJumps++;
        }
        lastCalculatedSpeedKmH = speedKmH;
    }
    if (totalJumps > 2) {
        result.reasons.push('gps_jumps');
        result.riskScore += totalJumps * 10;
    }
    if (totalBadAccuracy > trackPoints.length * 0.5) {
        result.reasons.push('suspicious_accuracy');
        result.riskScore += 15;
    }
    // Deduplicate reasons
    result.reasons = Array.from(new Set(result.reasons));
    // Cap risk score
    if (result.riskScore > 100)
        result.riskScore = 100;
    if (result.riskScore > 20) {
        result.suspicious = true;
    }
    return result;
}
//# sourceMappingURL=trackAudit.js.map
import * as crypto from 'crypto';
import { getDistanceToPath, distanceToSegmentStart, distanceToSegmentEnd, haversineDistanceMeters } from './utils/segmentMath';

export const MAX_CROSS_TRACK_DISTANCE_METERS = 30;
export const MAX_ALLOWED_SPEED_KMH = 80;
export const MAX_ALLOWED_ACCELERATION_KMH_S = 30;

export interface TrackPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number;
  altitude?: number;
  accuracy?: number;
}

export interface ValidationResult {
  status: 'validated' | 'rejected';
  rejectionReason?: string;
  suspicionScore: number;
  officialTimeSeconds?: number;
  officialDistanceMeters?: number;
  officialAverageSpeedKmH?: number;
  officialMaxSpeedKmH?: number;
  trackHash?: string;
  validatedAt: number;
}

export function validateAttempt(
  trackPoints: TrackPoint[],
  segmentPath: [number, number][]
): ValidationResult {
  const result: ValidationResult = {
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

  const startDist = distanceToSegmentStart([firstPoint.latitude, firstPoint.longitude], segmentPath);
  const endDist = distanceToSegmentEnd([lastPoint.latitude, lastPoint.longitude], segmentPath);
  
  const distStartToStart = startDist !== null ? startDist : Infinity;
  const distStartToEnd = distanceToSegmentEnd([firstPoint.latitude, firstPoint.longitude], segmentPath) ?? Infinity;
  
  if (distStartToStart > MAX_CROSS_TRACK_DISTANCE_METERS && distStartToEnd > MAX_CROSS_TRACK_DISTANCE_METERS) {
    result.rejectionReason = 'invalid_start';
    return result;
  }
  
  const distEndToEnd = endDist !== null ? endDist : Infinity;
  const distEndToStart = distanceToSegmentStart([lastPoint.latitude, lastPoint.longitude], segmentPath) ?? Infinity;

  if (distEndToEnd > MAX_CROSS_TRACK_DISTANCE_METERS && distEndToStart > MAX_CROSS_TRACK_DISTANCE_METERS) {
    result.rejectionReason = 'invalid_finish';
    return result;
  }

  let officialDistanceMeters = 0;
  let officialMaxSpeedKmH = 0;
  let lastCalculatedSpeedKmH = 0;

  for (let i = 0; i < trackPoints.length; i++) {
    const pt = trackPoints[i];
    
    const distToPathResult = getDistanceToPath([pt.latitude, pt.longitude], segmentPath);
    if (!distToPathResult || distToPathResult.distanceMeters > MAX_CROSS_TRACK_DISTANCE_METERS) {
      result.rejectionReason = 'trajectory_out_of_bounds';
      return result;
    }

    if (i > 0) {
      const prev = trackPoints[i - 1];
      const deltaMeters = haversineDistanceMeters(
        [prev.latitude, prev.longitude],
        [pt.latitude, pt.longitude]
      );
      const deltaSeconds = (pt.timestamp - prev.timestamp) / 1000;
      officialDistanceMeters += deltaMeters;

      if (deltaSeconds > 0) {
        const speedMs = deltaMeters / deltaSeconds;
        const speedKmH = speedMs * 3.6;

        if (speedKmH > MAX_ALLOWED_SPEED_KMH) {
          result.rejectionReason = 'impossible_segment_velocity';
          return result;
        }

        if (speedKmH > officialMaxSpeedKmH) {
          officialMaxSpeedKmH = speedKmH;
        }

        const accelerationKmhS = (speedKmH - lastCalculatedSpeedKmH) / deltaSeconds;
        if (accelerationKmhS > MAX_ALLOWED_ACCELERATION_KMH_S) {
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

  if (officialAverageSpeedKmH > MAX_ALLOWED_SPEED_KMH) {
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

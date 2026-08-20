import { GPSPoint } from '../types';

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates
 */
export function calculateGpsDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates total cumulative distance along a sequential GPS track [lat, lng][]
 */
export function calculateTrackDistanceKm(path: [number, number][]): number {
  if (!path || path.length < 2) return 0;
  let totalKm = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalKm += calculateGpsDistanceKm(
      path[i][0],
      path[i][1],
      path[i + 1][0],
      path[i + 1][1]
    );
  }
  return Math.round(totalKm * 100) / 100;
}

/**
 * Checks if a GPS track is a closed loop / circuit (start and end within ~70m)
 */
export function isClosedCircuit(path: [number, number][]): boolean {
  if (!path || path.length < 3) return false;
  const start = path[0];
  const end = path[path.length - 1];
  const distKm = calculateGpsDistanceKm(start[0], start[1], end[0], end[1]);
  return distKm < 0.07; // less than 70 meters
}

/**
 * Helper to create a GPSPoint object with timestamp
 */
export function createGpsPoint(
  lat: number,
  lng: number,
  speedKmH: number = 0,
  altitude?: number
): GPSPoint {
  return {
    lat,
    lng,
    timestamp: Date.now(),
    speedKmH,
    altitude,
  };
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface PointToSegmentResult {
  distanceMeters: number;
  projection: [number, number];
  t: number;
}

export interface DistanceToPathResult extends PointToSegmentResult {
  segmentIndex: number;
}

const EARTH_RADIUS_M = 6371000;
const METERS_PER_DEGREE_LAT = 111320;

/**
 * Pure Haversine formula to calculate the distance between two coordinates in meters.
 */
export function haversineDistanceMeters(point1: [number, number], point2: [number, number]): number {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

/**
 * Calculates a bounding box encompassing the entire path, expanded by paddingMeters.
 */
export function getPathBoundingBox(path: [number, number][], paddingMeters: number): BoundingBox | null {
  if (!path || path.length === 0) return null;

  let minLat = path[0][0];
  let maxLat = path[0][0];
  let minLng = path[0][1];
  let maxLng = path[0][1];

  for (let i = 1; i < path.length; i++) {
    const [lat, lng] = path[i];
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  const latPadding = paddingMeters / METERS_PER_DEGREE_LAT;
  // Use the max absolute latitude to be safe on longitude padding (widest distance per degree is at equator, narrowest at poles, so divide by cos)
  const maxAbsLat = Math.max(Math.abs(minLat), Math.abs(maxLat));
  const lngPadding = paddingMeters / (METERS_PER_DEGREE_LAT * Math.cos(maxAbsLat * Math.PI / 180));

  return {
    minLat: minLat - latPadding,
    maxLat: maxLat + latPadding,
    minLng: minLng - lngPadding,
    maxLng: maxLng + lngPadding
  };
}

/**
 * Checks if a point lies inside a bounding box.
 */
export function isPointInsideBoundingBox(point: [number, number], box: BoundingBox): boolean {
  if (!box || !point) return false;
  const [lat, lng] = point;
  return lat >= box.minLat && lat <= box.maxLat && lng >= box.minLng && lng <= box.maxLng;
}

// Helper for local flat Cartesian dot product
function dotProduct(v1: [number, number], v2: [number, number]): number {
  return v1[0] * v2[0] + v1[1] * v2[1];
}

/**
 * Projects a point onto a line segment and calculates the distance in meters.
 * The projection is strictly bounded between lineStart (t=0) and lineEnd (t=1).
 */
export function distancePointToLineSegment(
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number]
): PointToSegmentResult {
  const latMid = ((lineStart[0] + lineEnd[0]) / 2) * Math.PI / 180;
  const lngMultiplier = Math.cos(latMid);

  // Convert to flat meters relative to lineStart
  const toMeters = (p: [number, number]): [number, number] => [
    (p[0] - lineStart[0]) * METERS_PER_DEGREE_LAT,
    (p[1] - lineStart[1]) * METERS_PER_DEGREE_LAT * lngMultiplier
  ];

  const vPoint = toMeters(point);
  const vEnd = toMeters(lineEnd);

  const c1 = dotProduct(vPoint, vEnd);
  const c2 = dotProduct(vEnd, vEnd);

  let t = 0;
  let projLat = lineStart[0];
  let projLng = lineStart[1];

  if (c2 === 0) {
    t = 0;
  } else if (c1 <= 0) {
    t = 0;
  } else if (c2 <= c1) {
    t = 1;
    projLat = lineEnd[0];
    projLng = lineEnd[1];
  } else {
    t = c1 / c2;
    projLat = lineStart[0] + t * (lineEnd[0] - lineStart[0]);
    projLng = lineStart[1] + t * (lineEnd[1] - lineStart[1]);
  }

  const projection: [number, number] = [projLat, projLng];
  const distanceMeters = haversineDistanceMeters(point, projection);

  return { distanceMeters, projection, t };
}

/**
 * Finds the closest segment in a complete path to the given point.
 */
export function getDistanceToPath(point: [number, number], path: [number, number][]): DistanceToPathResult | null {
  if (!path || path.length < 2) return null;

  let minDistance = Infinity;
  let bestResult: DistanceToPathResult | null = null;

  for (let i = 0; i < path.length - 1; i++) {
    const segStart = path[i];
    const segEnd = path[i + 1];

    const result = distancePointToLineSegment(point, segStart, segEnd);
    if (result.distanceMeters < minDistance) {
      minDistance = result.distanceMeters;
      bestResult = {
        ...result,
        segmentIndex: i
      };
    }
  }

  return bestResult;
}

/**
 * Calculates the Haversine distance to the first point of the path.
 */
export function distanceToSegmentStart(point: [number, number], path: [number, number][]): number | null {
  if (!path || path.length === 0) return null;
  return haversineDistanceMeters(point, path[0]);
}

/**
 * Calculates the Haversine distance to the last point of the path.
 */
export function distanceToSegmentEnd(point: [number, number], path: [number, number][]): number | null {
  if (!path || path.length === 0) return null;
  return haversineDistanceMeters(point, path[path.length - 1]);
}

/**
 * Checks if the point is within tolerance of either endpoint.
 * Returns the closest one if both are in range.
 */
export function getNearestEndpoint(point: [number, number], path: [number, number][], toleranceMeters: number): 'start' | 'end' | null {
  const distStart = distanceToSegmentStart(point, path);
  const distEnd = distanceToSegmentEnd(point, path);

  if (distStart === null || distEnd === null) return null;

  const startInRange = distStart <= toleranceMeters;
  const endInRange = distEnd <= toleranceMeters;

  if (startInRange && endInRange) {
    return distStart <= distEnd ? 'start' : 'end';
  }

  if (startInRange) return 'start';
  if (endInRange) return 'end';

  return null;
}

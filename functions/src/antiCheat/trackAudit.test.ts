import { auditTrack, TrackPoint } from './trackAudit';

// Test 1: Normal short track
const normalTrack: TrackPoint[] = [
  { latitude: 0, longitude: 0, timestamp: 1000 },
  { latitude: 0.0001, longitude: 0, timestamp: 2000 }, // ~11m in 1s = 11 m/s = ~40 km/h
  { latitude: 0.0002, longitude: 0, timestamp: 3000 }
];

console.log("TEST 1 (Normal):", auditTrack(normalTrack));

// Test 2: Impossible speed
const fastTrack: TrackPoint[] = [
  { latitude: 0, longitude: 0, timestamp: 1000 },
  { latitude: 0.001, longitude: 0, timestamp: 2000 } // ~111m in 1s = 111 m/s = ~400 km/h
];

console.log("TEST 2 (Impossible Speed):", auditTrack(fastTrack));

// Test 3: GPS Teleportation (Jump)
const teleportTrack: TrackPoint[] = [
  { latitude: 0, longitude: 0, timestamp: 1000 },
  { latitude: 1, longitude: 1, timestamp: 2000 } // huge jump
];

console.log("TEST 3 (Teleport):", auditTrack(teleportTrack));

// Test 4: Impossible Acceleration
const accelTrack: TrackPoint[] = [
  { latitude: 0, longitude: 0, timestamp: 1000 },
  { latitude: 0.00001, longitude: 0, timestamp: 2000 }, // ~1m in 1s = 3.6 km/h
  { latitude: 0.00015, longitude: 0, timestamp: 3000 }, // ~14m in 1s = 50.4 km/h -> 46.8 km/h acceleration in 1s
];

console.log("TEST 4 (Acceleration):", auditTrack(accelTrack));

// Test 5: Bad accuracy isolated
const badAccTrack: TrackPoint[] = [
  { latitude: 0, longitude: 0, timestamp: 1000, accuracy: 200 },
  { latitude: 0, longitude: 0, timestamp: 2000, accuracy: 10 }
];

console.log("TEST 5 (Bad Acc):", auditTrack(badAccTrack));

// Test 8: Empty track
console.log("TEST 8 (Empty):", auditTrack([]));

// Test 9: Invalid coords
console.log("TEST 9 (Invalid coords):", auditTrack([{ latitude: 200, longitude: 0, timestamp: 1000 }, { latitude: 0, longitude: 0, timestamp: 2000 }]));

// Test 10: Invalid timestamp
console.log("TEST 10 (Invalid timestamp):", auditTrack([{ latitude: 0, longitude: 0, timestamp: 2000 }, { latitude: 0, longitude: 0, timestamp: 1000 }]));

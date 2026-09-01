import { 
  getPathBoundingBox, isPointInsideBoundingBox, 
  distancePointToLineSegment, getDistanceToPath, 
  getNearestEndpoint 
} from './src/utils/segmentMath';

const test1 = getPathBoundingBox([], 10);
console.log("TESTE 1 (vazio):", test1 === null ? "PASS" : "FAIL");

const path2: [number, number][] = [[0, 0], [0, 1]];
const test2 = getPathBoundingBox(path2, 10);
console.log("TESTE 2 (dois pontos):", test2 !== null ? "PASS" : "FAIL");

const box = getPathBoundingBox([[0, 0], [1, 1]], 1000)!; // ~1000m is ~0.009 degrees
console.log("TESTE 3 (dentro):", isPointInsideBoundingBox([0.5, 0.5], box) ? "PASS" : "FAIL");
console.log("TESTE 4 (fora):", !isPointInsideBoundingBox([2, 2], box) ? "PASS" : "FAIL");

const pToLineExata = distancePointToLineSegment([0.5, 0.5], [0, 0], [1, 1]);
// We expect a tiny distance due to floating point, but very close to 0
console.log("TESTE 5 (exatamente sobre linha):", pToLineExata.distanceMeters < 1 ? "PASS" : "FAIL");

const pToLineMeio = distancePointToLineSegment([0, 0.5], [0, 0], [0, 1]);
console.log("TESTE 6 (meio da linha, projeta no y=0.5):", (Math.abs(pToLineMeio.projection[1] - 0.5) < 0.01) ? "PASS" : "FAIL");

const pToLineExtremidade = distancePointToLineSegment([-1, -1], [0, 0], [1, 1]);
console.log("TESTE 7 (próximo de extremidade):", (pToLineExtremidade.t === 0 && pToLineExtremidade.projection[0] === 0) ? "PASS" : "FAIL");

const pToLineFora = distancePointToLineSegment([2, 2], [0, 0], [1, 1]);
console.log("TESTE 8 (fora da linha, projeção limitada a A/B):", (pToLineFora.t === 1 && pToLineFora.projection[0] === 1) ? "PASS" : "FAIL");

const path9: [number, number][] = [[0, 0], [0, 1], [1, 1]];
const test9 = getDistanceToPath([1, 1], path9);
console.log("TESTE 9 (múltiplos segmentos):", test9 !== null ? "PASS" : "FAIL");

const test10 = getDistanceToPath([0.9, 1], path9);
console.log("TESTE 10 (segmentIndex correto):", test10?.segmentIndex === 1 ? "PASS" : "FAIL");

const test11 = getNearestEndpoint([0, 0.0001], path9, 50); // very close to start
console.log("TESTE 11 (A):", test11 === 'start' ? "PASS" : "FAIL");

const test12 = getNearestEndpoint([1, 1.0001], path9, 50); // very close to end
console.log("TESTE 12 (B):", test12 === 'end' ? "PASS" : "FAIL");

const path13: [number, number][] = [[0, 0], [0.001, 0]];
// Equidistant point: midway but let's test if tolerance hits both
const test13 = getNearestEndpoint([0.0005, 0], path13, 100000); 
console.log("TESTE 13 (equidistante):", (test13 === 'start' || test13 === 'end') ? "PASS" : "FAIL");

const path14: [number, number][] = [[0, 0]];
const test14 = getDistanceToPath(path14, path14); // invalid path for distance
console.log("TESTE 14 (invalido <2 pontos):", test14 === null ? "PASS" : "FAIL");


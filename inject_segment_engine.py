import re

with open('src/App.tsx', 'r') as f:
    c = f.read()

import_statement = """import {
  getPathBoundingBox,
  isPointInsideBoundingBox,
  getDistanceToPath,
  getNearestEndpoint,
  distanceToSegmentStart,
  distanceToSegmentEnd
} from './utils/segmentMath';
import { SegmentAttempt } from './types';
"""

if "import { SegmentAttempt }" not in c:
    c = c.replace("import React, { useState, useEffect, useRef } from 'react';", import_statement + "import React, { useState, useEffect, useRef } from 'react';")

refs_code = """  const sessionMaxSpeedRef = useRef<number>(0.0);
  const lastTrackPointRef = useRef<ActivityTrackPoint | null>(null);

  // Segment Engine Refs
  const segmentAttemptRef = useRef<SegmentAttempt | null>(null);
  const segmentOffPathCountRef = useRef<number>(0);
  const lastFinishedSegmentAttemptRef = useRef<SegmentAttempt | null>(null);
"""

if "segmentAttemptRef = useRef" not in c:
    c = c.replace("  const sessionMaxSpeedRef = useRef<number>(0.0);\n  const lastTrackPointRef = useRef<ActivityTrackPoint | null>(null);", refs_code)


engine_code = """              // =============================================================
              // ETAPA 4: SEGMENT ENGINE NOVO
              // =============================================================
              const ptSegment: [number, number] = [latitude, longitude];
              const SEGMENT_LATERAL_TOLERANCE_METERS = 30;
              const SEGMENT_START_RADIUS_METERS = 20;
              const SEGMENT_MAX_OFF_PATH_POINTS = 2;

              if (!segmentAttemptRef.current) {
                // Procurar segmentos próximos para iniciar
                for (const seg of zonesRef.current) {
                  if (seg.shape !== 'segment' || !seg.path || seg.path.length < 2) continue;

                  const bbox = getPathBoundingBox(seg.path, SEGMENT_START_RADIUS_METERS);
                  if (!bbox || !isPointInsideBoundingBox(ptSegment, bbox)) continue;

                  const endpoint = getNearestEndpoint(ptSegment, seg.path, SEGMENT_START_RADIUS_METERS);
                  if (endpoint === 'start' || endpoint === 'end') {
                    segmentAttemptRef.current = {
                      segmentId: seg.id,
                      status: 'approaching',
                      direction: endpoint === 'start' ? 'forward' : 'reverse',
                      startTime: 0,
                      startPointIndex: 0,
                      trackPoints: [newPoint],
                      distanceCovered: 0
                    };
                    segmentOffPathCountRef.current = 0;
                    console.log(`[SEGMENT_ENGINE] Approaching segment ${seg.id} (${endpoint})`);
                    break;
                  }
                }
              } else {
                const attempt = segmentAttemptRef.current;
                const seg = zonesRef.current.find((z) => z.id === attempt.segmentId);

                if (!seg || !seg.path || seg.path.length < 2) {
                  segmentAttemptRef.current = null;
                } else {
                  attempt.trackPoints.push(newPoint);

                  const bbox = getPathBoundingBox(seg.path, SEGMENT_LATERAL_TOLERANCE_METERS);
                  let isOffPath = false;

                  if (!bbox || !isPointInsideBoundingBox(ptSegment, bbox)) {
                    isOffPath = true;
                  } else {
                    const distResult = getDistanceToPath(ptSegment, seg.path);
                    if (!distResult || distResult.distanceMeters > SEGMENT_LATERAL_TOLERANCE_METERS) {
                      isOffPath = true;
                    }
                  }

                  if (isOffPath) {
                    segmentOffPathCountRef.current += 1;
                    if (segmentOffPathCountRef.current >= SEGMENT_MAX_OFF_PATH_POINTS) {
                      attempt.status = 'aborted';
                      console.log(`[SEGMENT_ENGINE] Aborted segment ${attempt.segmentId}: exited path`);
                      segmentAttemptRef.current = null;
                    }
                  } else {
                    segmentOffPathCountRef.current = 0;

                    if (attempt.status === 'approaching') {
                      const startPtDist = attempt.direction === 'forward'
                        ? distanceToSegmentStart(ptSegment, seg.path)
                        : distanceToSegmentEnd(ptSegment, seg.path);

                      if (startPtDist !== null && startPtDist > 5) {
                        attempt.status = 'active';
                        attempt.startTime = performance.now();
                        console.log(`[SEGMENT_ENGINE] Active on segment ${attempt.segmentId}`);
                      }
                    } else if (attempt.status === 'active') {
                      const targetEndpointStr = attempt.direction === 'forward' ? 'end' : 'start';
                      const arrivalStatus = getNearestEndpoint(ptSegment, seg.path, SEGMENT_START_RADIUS_METERS);

                      if (arrivalStatus === targetEndpointStr) {
                        attempt.status = 'finished';
                        const endTime = performance.now();
                        const durationMs = endTime - attempt.startTime;

                        let distCovered = 0;
                        for (let i = 1; i < attempt.trackPoints.length; i++) {
                          const p1 = attempt.trackPoints[i - 1];
                          const p2 = attempt.trackPoints[i];
                          distCovered += calculateDistanceKm(p1.latitude, p1.longitude, p2.latitude, p2.longitude) * 1000;
                        }
                        attempt.distanceCovered = distCovered;

                        console.log(`[SEGMENT_ENGINE] Finished segment ${attempt.segmentId}!`, {
                          durationMs,
                          distanceCovered: attempt.distanceCovered
                        });

                        lastFinishedSegmentAttemptRef.current = attempt;
                        segmentAttemptRef.current = null;
                      }
                    }
                  }
                }
              }
"""

anchor = "              syncConquestProgresses(nextActiveZones);"
if "ETAPA 4: SEGMENT ENGINE NOVO" not in c:
    c = c.replace(anchor, anchor + "\n" + engine_code)

with open('src/App.tsx', 'w') as f:
    f.write(c)


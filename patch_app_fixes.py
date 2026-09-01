import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Approaching
p1 = "console.log(`[SEGMENT_ENGINE] Approaching segment ${seg.id} (${endpoint})`);"
r1 = "console.log(`[SEGMENT_ENGINE] Approaching segment ${seg.id} (${endpoint})`);\n                    setActiveSegmentAttemptState({ ...segmentAttemptRef.current } as any);"
content = content.replace(p1, r1)

# Aborted
p2 = "segmentAttemptRef.current = null;\n                    }"
r2 = "segmentAttemptRef.current = null;\n                      setActiveSegmentAttemptState(null);\n                    }"
content = content.replace(p2, r2)
# Or better, just find where it says `segmentAttemptRef.current = null;` after `Aborted segment`.
# Let's replace the whole block
p_aborted = "console.log(`[SEGMENT_ENGINE] Aborted segment ${attempt.segmentId}: exited path`);\n                      segmentAttemptRef.current = null;"
r_aborted = "console.log(`[SEGMENT_ENGINE] Aborted segment ${attempt.segmentId}: exited path`);\n                      segmentAttemptRef.current = null;\n                      setActiveSegmentAttemptState(null);"
content = content.replace(p_aborted, r_aborted)

# Active
p3 = "attempt.startTime = performance.now();"
r3 = "attempt.startTime = performance.now();\n                        setActiveSegmentAttemptState({ ...attempt });"
content = content.replace(p3, r3)

# Finished
p4 = "lastFinishedSegmentAttemptRef.current = attempt;"
r4 = "lastFinishedSegmentAttemptRef.current = attempt;\n                        setActiveSegmentAttemptState({ ...attempt });\n                        setTimeout(() => setActiveSegmentAttemptState(null), 5000);"
content = content.replace(p4, r4)

# HUD overlay
hud = """        {/* Segment UI Overlay */}
        {activeSegmentAttemptState && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[2000] pointer-events-none w-11/12 max-w-sm">
            <div className={`p-4 rounded-2xl shadow-xl backdrop-blur-md border ${
              activeSegmentAttemptState.status === 'approaching' ? 'bg-amber-500/90 border-amber-400 text-amber-50' :
              activeSegmentAttemptState.status === 'active' ? 'bg-rose-500/90 border-rose-400 text-rose-50' :
              'bg-emerald-500/90 border-emerald-400 text-emerald-50'
            } flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-top-4 duration-300`}>
              <h3 className="text-lg font-bold uppercase tracking-wider mb-1">
                {activeSegmentAttemptState.status === 'approaching' ? 'Sprint Próximo' :
                 activeSegmentAttemptState.status === 'active' ? 'Sprint em Andamento' :
                 'Sprint Concluído!'}
              </h3>
              {activeSegmentAttemptState.status === 'active' && (
                <div className="text-3xl font-black tabular-nums tracking-tighter">
                  {activeSegmentAttemptState.distanceCovered > 0 ? (activeSegmentAttemptState.distanceCovered / 1000).toFixed(2) : '0.00'} <span className="text-lg font-semibold opacity-80">km</span>
                </div>
              )}
              {activeSegmentAttemptState.status === 'finished' && activeSegmentAttemptState.durationMs && (
                <div className="text-xl font-bold">
                  Tempo: {(activeSegmentAttemptState.durationMs / 1000).toFixed(2)}s
                </div>
              )}
            </div>
          </div>
        )}
        {/* Bottom Fixed Navigation Bar */}"""

content = content.replace("{/* Bottom Fixed Navigation Bar */}", hud)

with open("src/App.tsx", "w") as f:
    f.write(content)


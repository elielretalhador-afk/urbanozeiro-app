import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add state
state_pattern = r"  const \[activeZones, setActiveZones\] = useState<any\[\]>\(\[\]\);"
state_replacement = """  const [activeZones, setActiveZones] = useState<any[]>([]);
  const [activeSegmentAttemptState, setActiveSegmentAttemptState] = useState<SegmentAttempt | null>(null);"""

if "activeSegmentAttemptState" not in content:
    content = re.sub(state_pattern, state_replacement, content)

# In the segment engine, update the state
# Approaching
approaching_pattern = r"console\.log\(`\[SEGMENT_ENGINE\] Approaching segment \$\{seg\.id\} \(\$\{endpoint\}\)`\);"
approaching_replacement = """console.log(`[SEGMENT_ENGINE] Approaching segment ${seg.id} (${endpoint})`);
                    setActiveSegmentAttemptState({ ...segmentAttemptRef.current });"""
content = content.replace(approaching_pattern, approaching_replacement)

# Aborted
aborted_pattern = r"console\.log\(`\[SEGMENT_ENGINE\] Aborted segment \$\{attempt\.segmentId\}: exited path`\);\n                      segmentAttemptRef\.current = null;"
aborted_replacement = """console.log(`[SEGMENT_ENGINE] Aborted segment ${attempt.segmentId}: exited path`);
                      segmentAttemptRef.current = null;
                      setActiveSegmentAttemptState(null);"""
content = content.replace(aborted_pattern, aborted_replacement)

# Active
active_pattern = r"attempt\.status = 'active';\n                        attempt\.startTime = performance\.now\(\);"
active_replacement = """attempt.status = 'active';
                        attempt.startTime = performance.now();
                        setActiveSegmentAttemptState({ ...attempt });"""
content = content.replace(active_pattern, active_replacement)

# Finished
finished_pattern = r"lastFinishedSegmentAttemptRef\.current = attempt;"
finished_replacement = """lastFinishedSegmentAttemptRef.current = attempt;
                        setActiveSegmentAttemptState({ ...attempt });
                        setTimeout(() => setActiveSegmentAttemptState(null), 5000); // UI feedback duration"""
content = content.replace(finished_pattern, finished_replacement)

# MapView props
mapview_pattern = r"liveChallenge=\{activeLiveChallenge\}"
mapview_replacement = """liveChallenge={activeLiveChallenge}
              activeSegmentAttempt={activeSegmentAttemptState}"""
content = content.replace(mapview_pattern, mapview_replacement)

# HUD
hud_pattern = r"\{isSessionActive && \(\n            <SkaterHud"
hud_replacement = """{isSessionActive && (
            <SkaterHud"""
# Let's add a HUD feedback for segment.
hud_inject_pattern = r"\{/\* Bottom Navigation \*/\}"
hud_inject_replacement = """{/* Segment UI Overlay */}
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
                    {activeSegmentAttemptState.distanceInsideZone > 0 ? (activeSegmentAttemptState.distanceInsideZone / 1000).toFixed(2) : '0.00'} <span className="text-lg font-semibold opacity-80">km</span>
                  </div>
                )}
                {activeSegmentAttemptState.status === 'finished' && (
                  <div className="text-xl font-bold">
                    Tempo: {(activeSegmentAttemptState.durationMs! / 1000).toFixed(2)}s
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Bottom Navigation */}"""
content = content.replace(hud_inject_pattern, hud_inject_replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("App.tsx patched")

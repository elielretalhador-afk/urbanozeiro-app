import re

with open("src/App.tsx", "r") as f:
    content = f.read()

sprint_overlay_code = """
const SprintOverlay: React.FC<{ attempt: any }> = ({ attempt }) => {
  const [displayTime, setDisplayTime] = React.useState(0);

  React.useEffect(() => {
    let animationFrameId: number;
    const updateTime = () => {
      if (attempt.status === 'active' && attempt.startTime) {
        setDisplayTime(performance.now() - attempt.startTime);
        animationFrameId = requestAnimationFrame(updateTime);
      }
    };
    if (attempt.status === 'active') {
      animationFrameId = requestAnimationFrame(updateTime);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [attempt.status, attempt.startTime]);

  const isApproaching = attempt.status === 'approaching';
  const isActive = attempt.status === 'active';
  const isFinished = attempt.status === 'finished';

  const timeToShowMs = isFinished && attempt.durationMs ? attempt.durationMs : displayTime;
  const timeSeconds = (timeToShowMs / 1000).toFixed(2);

  const directionArrow = attempt.direction === 'forward' ? 'IDA →' : '← VOLTA';

  return (
    <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-md border ${
      isApproaching ? 'bg-amber-500/95 border-amber-400 text-amber-50' :
      isActive ? 'bg-rose-500/95 border-rose-400 text-rose-50 shadow-[0_0_30px_rgba(244,63,94,0.3)]' :
      'bg-indigo-500/95 border-indigo-400 text-indigo-50'
    } flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto w-full max-w-sm mx-auto`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[9px] font-black bg-black/20 text-white px-2 py-0.5 rounded uppercase font-mono-stat tracking-widest shadow-inner">
          {directionArrow}
        </span>
      </div>
      <h3 className="text-lg font-black uppercase tracking-wide mb-2 font-display leading-none">
        {isApproaching ? '⚡ SPRINT PRÓXIMO' :
         isActive ? 'SPRINT EM ANDAMENTO' :
         'SPRINT CONCLUÍDO'}
      </h3>
      
      {isApproaching && (
        <div className="text-xs font-medium opacity-90 max-w-[200px] leading-snug">
          Você está chegando ao início do segmento. Prepare-se!
        </div>
      )}

      {isActive && (
        <div className="flex flex-col items-center">
          <div className="text-5xl font-black tabular-nums tracking-tighter font-mono-stat drop-shadow-md my-1">
            {timeSeconds}<span className="text-xl opacity-80 ml-1">s</span>
          </div>
          <div className="text-[10px] font-black uppercase opacity-80 tracking-widest mt-1 bg-black/10 px-2 py-0.5 rounded">
            {attempt.distanceCovered > 0 ? (attempt.distanceCovered).toFixed(0) : '0'} m
          </div>
        </div>
      )}

      {isFinished && attempt.durationMs && (
        <div className="flex flex-col items-center gap-1">
          <div className="text-4xl font-black tabular-nums tracking-tighter font-mono-stat drop-shadow-md my-1">
            {timeSeconds}<span className="text-lg opacity-80 ml-1">s</span>
          </div>
          <div className="text-[10px] uppercase font-black opacity-80 tracking-widest bg-black/10 px-2 py-0.5 rounded mt-1">
            Sincronizando...
          </div>
        </div>
      )}
    </div>
  );
};
"""

# Insert SprintOverlay just before Main App Component
if "const App: React.FC = () => {" in content:
    content = content.replace("const App: React.FC = () => {", sprint_overlay_code + "\nconst App: React.FC = () => {")

# Replace overlay usage inside App
old_overlay = """        {/* Segment UI Overlay */}
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
        )}"""

new_overlay = """        {/* Segment UI Overlay */}
        {activeSegmentAttemptState && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[2000] pointer-events-none w-11/12 max-w-sm flex justify-center">
             <SprintOverlay attempt={activeSegmentAttemptState} />
          </div>
        )}"""

content = content.replace(old_overlay, new_overlay)

with open("src/App.tsx", "w") as f:
    f.write(content)

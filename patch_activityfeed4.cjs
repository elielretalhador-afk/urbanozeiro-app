const fs = require('fs');
let content = fs.readFileSync('src/components/ActivityFeedModal.tsx', 'utf8');

const additionalActions = `
                      {act.type === 'SESSION_COMPLETED' && act.relatedId && onRedoRoute && (
                        <button
                          type="button"
                          onClick={() => {
                            onRedoRoute(act.id, act.metadata);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 border border-slate-500/40 text-slate-300 text-[10px] font-bold uppercase font-mono-stat transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>VER ATIVIDADE</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {act.type === 'ROUTE_SHARED' && act.metadata && act.metadata.routeId && onRedoRoute && (
                        <button
                          type="button"
                          onClick={() => {
                            onRedoRoute(act.id, act.metadata);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold uppercase font-mono-stat transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>VER ROTA</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
`;

content = content.replace(
  /\{act\.type\.includes\('ZONE'\) && act\.relatedId && onOpenZone && \(/,
  `${additionalActions}
                      {act.type.includes('ZONE') && act.relatedId && onOpenZone && (`
);

fs.writeFileSync('src/components/ActivityFeedModal.tsx', content);

const fs = require('fs');
let content = fs.readFileSync('src/components/ActivityFeedModal.tsx', 'utf8');

// Add onRedoRoute prop
content = content.replace(
  /onOpenAchievements\?: \(\) => void;/,
  `onOpenAchievements?: () => void;\n  onRedoRoute?: (activityId: string, metadata: any) => void;`
);

content = content.replace(
  /onOpenAchievements,\n\s*friendIds/,
  `onOpenAchievements,\n  onRedoRoute,\n  friendIds`
);

// Add route map preview / redo button
const routePreviewJsx = `
                    {/* Route Preview Map Placeholder */}
                    {act.metadata?.trackPreview && act.metadata.trackPreview.length > 0 && (
                      <div className="mt-2 pl-6">
                        <div className="h-24 w-full bg-[#111824] rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                           <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                           <Compass className="w-8 h-8 text-emerald-500/50" />
                           <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex justify-end">
                             {onRedoRoute && (
                               <button 
                                 onClick={() => onRedoRoute(act.id, act.metadata)}
                                 className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold rounded cursor-pointer uppercase font-display"
                               >
                                 Refazer Rota
                               </button>
                             )}
                           </div>
                        </div>
                      </div>
                    )}
`;

content = content.replace(
  /\{act\.metadata && \(/,
  `${routePreviewJsx.trim()}\n\n                    {act.metadata && (`
);

fs.writeFileSync('src/components/ActivityFeedModal.tsx', content);
console.log('Patched ActivityFeedModal');

const fs = require('fs');
let lines = fs.readFileSync('src/components/FeedView.tsx', 'utf8').split('\n');

// We need to fix lines 334 to 344 roughly
// We can just find the part that was corrupted and replace it.
const content = fs.readFileSync('src/components/FeedView.tsx', 'utf8');

const badPart = `                        {act.metadata.rewardXP && (
                          <span className="px-2 py-0.5 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-[10px] font-mono-stat font-bold">
                            +{act.metadata.rewardXP} XP
                          </span>
                        )}
                        ;
                          } catch (e) {
                            console.warn('Share not supported', e);
                            alert('Compartilhamento não suportado neste dispositivo.');
                          }
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black font-mono-stat transition-all cursor-pointer bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>`;

const goodPart = `                        {act.metadata.rewardXP && (
                          <span className="px-2 py-0.5 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-[10px] font-mono-stat font-bold">
                            +{act.metadata.rewardXP} XP
                          </span>
                        )}
                        {act.metadata.distanceKm && (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-white/10 text-slate-300 text-[10px] font-mono-stat">
                            🛹 {act.metadata.distanceKm} km
                          </span>
                        )}
                        {act.metadata.durationFormatted && (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-white/10 text-slate-300 text-[10px] font-mono-stat">
                            ⏱️ {act.metadata.durationFormatted}
                          </span>
                        )}
                        {act.metadata.avgSpeedKmH && (
                          <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono-stat font-bold">
                            ⚡ {act.metadata.avgSpeedKmH} km/h (Méd)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Interactive Row */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                    {/* Left Actions: Like, Comment, Share & Reactions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        id={\`btn-like-activity-\${act.id}\`}
                        onClick={() => onToggleLike && onToggleLike(act.id)}
                        className={\`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black font-mono-stat transition-all cursor-pointer \${
                          act.hasLiked
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                        }\`}
                      >
                        <Heart className={\`w-3.5 h-3.5 \${act.hasLiked ? 'fill-current' : ''}\`} />
                        <span>{act.likesCount}</span>
                      </button>

                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black font-mono-stat transition-all cursor-pointer bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{act.commentsCount}</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            if (window.navigator && window.navigator.share) {
                              await window.navigator.share({
                                title: act.title,
                                text: act.description,
                                url: 'https://urbanozeiro.com/activity/' + act.id
                              });
                            } else {
                              console.log('Fallback share');
                            }
                          } catch (e) {
                            console.warn('Share not supported', e);
                            alert('Compartilhamento não suportado neste dispositivo.');
                          }
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black font-mono-stat transition-all cursor-pointer bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>`;

const newContent = content.replace(badPart, goodPart);
fs.writeFileSync('src/components/FeedView.tsx', newContent, 'utf8');
console.log('Fixed FeedView layout');

const fs = require('fs');
let content = fs.readFileSync('src/components/FeedView.tsx', 'utf8');

content = content.replace(/\{act\.metadata\.rewardCoins && \([\s\S]*?\}\)/, '');

const newMetadata = `
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
`;

content = content.replace(/\{act\.metadata\.distanceKm && \([\s\S]*?\}\)/, newMetadata);

fs.writeFileSync('src/components/FeedView.tsx', content, 'utf8');
console.log('Fixed metadata in FeedView');

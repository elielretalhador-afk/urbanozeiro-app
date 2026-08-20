const fs = require('fs');
let content = fs.readFileSync('src/components/ActivityFeedModal.tsx', 'utf8');

// The block has:
// <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
//   <div className="flex items-center gap-2">
//     <button Like />
//     <button Comment />
//     <button Share />
//   </div>
//   {/* reactions */}
// </div>
// <div className="flex items-center gap-1.5">

// Let's just fix it automatically.
content = content.replace(
  /\{\/\* Display reaction emojis if available \*\/\}\n\s*\{act\.reactions && Object\.keys\(act\.reactions\)\.length > 0 && \(\n\s*<div className="flex items-center gap-1">\n\s*\{Object\.entries\(act\.reactions\)\.map\(\(\[emoji, count\]\) => \(\n\s*<span\n\s*key=\{emoji\}\n\s*className="px-1\.5 py-0\.5 rounded-lg bg-white\/5 text-\[10px\] font-mono-stat text-slate-300 flex items-center gap-1"\n\s*>\n\s*<span>\{emoji\}<\/span>\n\s*<span className="text-\[9px\] text-slate-400 font-bold">\{count\}<\/span>\n\s*<\/span>\n\s*\)\)\}\n\s*<\/div>\n\s*\)\}\n\s*<\/div>\n\s*\{\/\* Contextual Action Button \(e\.g\., Open Zone, Achievements, Profile\) \*\/\}/g,
  `{/* Display reaction emojis if available */}
                      {act.reactions && Object.keys(act.reactions).length > 0 && (
                        <div className="flex items-center gap-1">
                          {Object.entries(act.reactions).map(([emoji, count]) => (
                            <span
                              key={emoji}
                              className="px-1.5 py-0.5 rounded-lg bg-white/5 text-[10px] font-mono-stat text-slate-300 flex items-center gap-1"
                            >
                              <span>{emoji}</span>
                              <span className="text-[9px] text-slate-400 font-bold">{count}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contextual Action Button (e.g., Open Zone, Achievements, Profile) */}`
);

fs.writeFileSync('src/components/ActivityFeedModal.tsx', content);

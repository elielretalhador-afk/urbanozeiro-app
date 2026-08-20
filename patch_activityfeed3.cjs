const fs = require('fs');
let content = fs.readFileSync('src/components/ActivityFeedModal.tsx', 'utf8');

// Add MessageSquare and Share2
content = content.replace(
  /Heart,/,
  `Heart, MessageSquare, Share2,`
);

// Add Comment and Share buttons right after Like button
content = content.replace(
  /<\/button>\s*\{\/\* Display reaction emojis if available \*\/\}/,
  `</button>

                      {/* Botão Comentar */}
                      <button
                        type="button"
                        onClick={() => {
                          const c = prompt('Escreva seu comentário:');
                          if (c) alert('Comentário mockado enviado com sucesso!');
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black font-mono-stat transition-all cursor-pointer bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{act.commentsCount || 0}</span>
                      </button>

                      {/* Botão Compartilhar */}
                      <button
                        type="button"
                        onClick={() => {
                          alert('Estrutura de compartilhamento preparada. Mock ativado.');
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black font-mono-stat transition-all cursor-pointer bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Display reaction emojis if available */}`
);

// Render image and text nicely
content = content.replace(
  /\{act\.description && \(\s*<p className="text-\[13px\] text-slate-300 mt-1 pl-6">\{act\.description\}<\/p>\s*\)\}/,
  `{act.description && (
                      <p className="text-[13px] text-slate-300 mt-2 pl-6 whitespace-pre-wrap leading-relaxed">
                        {act.description}
                      </p>
                    )}
                    {act.metadata && act.metadata.image && (
                      <div className="mt-3 pl-6">
                        <img src={act.metadata.image} alt="Publicação" className="rounded-xl max-w-full h-auto border border-white/10 object-cover max-h-64" />
                      </div>
                    )}`
);

fs.writeFileSync('src/components/ActivityFeedModal.tsx', content);

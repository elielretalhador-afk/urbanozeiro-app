const fs = require('fs');
let content = fs.readFileSync('src/components/FeedView.tsx', 'utf8');

content = content.replace(/<button\s*className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"\s*>\s*<Share2 className="w-4 h-4" \/>\s*<span>Compartilhar<\/span>\s*<\/button>/g, `<button
                            onClick={async () => {
                              try {
                                await Share.share({
                                  title: act.title,
                                  text: act.description,
                                  url: 'https://urbanozeiro.com/activity/' + act.id,
                                  dialogTitle: 'Compartilhar Atividade'
                                });
                              } catch (e) {
                                console.log('Share via navigator.share');
                                if (navigator.share) {
                                  navigator.share({
                                    title: act.title,
                                    text: act.description,
                                    url: 'https://urbanozeiro.com/activity/' + act.id
                                  }).catch(console.error);
                                }
                              }
                            }}
                            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>Compartilhar</span>
                          </button>`);

fs.writeFileSync('src/components/FeedView.tsx', content, 'utf8');
console.log('Fixed feed share');

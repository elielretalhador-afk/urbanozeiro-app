const fs = require('fs');
let content = fs.readFileSync('src/components/ActivityFeedModal.tsx', 'utf8');

const loadMoreUI = `
            {/* LOAD MORE BUTTON (Paginação Otimizada) */}
            {hasMore && (
              <div className="flex justify-center mt-6 pb-6">
                <button 
                  onClick={onLoadMore}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'CARREGANDO...' : 'CARREGAR MAIS ATIVIDADES'}
                </button>
              </div>
            )}
`;

content = content.replace(
  /\{\/\* Content - Atividades \*\/\}([\s\S]*?)<\/div>\s*\{\/\* Modal Footer \*\/\}/,
  `{/* Content - Atividades */}$1${loadMoreUI}
        </div>

        {/* Modal Footer */}`
);

fs.writeFileSync('src/components/ActivityFeedModal.tsx', content);
console.log('Patched ActivityFeedModal correctly');

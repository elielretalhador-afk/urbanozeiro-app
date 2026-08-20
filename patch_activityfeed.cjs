const fs = require('fs');
let content = fs.readFileSync('src/components/ActivityFeedModal.tsx', 'utf8');

// Adiciona os props de paginação
content = content.replace(
  /initialFilter\?: ActivityFilterType;/,
  `initialFilter?: ActivityFilterType;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;`
);

content = content.replace(
  /initialFilter = 'TODAS',/,
  `initialFilter = 'TODAS',
  onLoadMore,
  hasMore = false,
  isLoading = false,`
);

// Adiciona o botão de carregar mais no fim da lista
const loadMoreUI = `
          {/* LOAD MORE BUTTON (Paginação Otimizada) */}
          {hasMore && (
            <div className="flex justify-center mt-6 mb-4">
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
  /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\;\s*\}\;/m,
  `${loadMoreUI}
        </div>
      </div>
    </div>
  </div>
</div>
  );
};`
);

fs.writeFileSync('src/components/ActivityFeedModal.tsx', content);
console.log('Patched ActivityFeedModal');

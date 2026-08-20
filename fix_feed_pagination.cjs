const fs = require('fs');
let content = fs.readFileSync('src/components/ActivityFeedModal.tsx', 'utf8');

content = content.replace(
  /const hasMore = visibleCount < filteredActivities\.length;/,
  `// O hasMore agora vêm das props (Server-side/Paginated) ou faz fallback para local
  const localHasMore = visibleCount < filteredActivities.length;
  const showLoadMore = hasMore || localHasMore;`
);

content = content.replace(
  /const handleLoadMore = \(\) => \{\s*setVisibleCount\(\(prev\) => prev \+ 6\);\s*\};/,
  `const handleLoadMore = () => {
    if (localHasMore) {
      setVisibleCount((prev) => prev + 6);
    } else if (onLoadMore) {
      onLoadMore();
    }
  };`
);

content = content.replace(
  /\{hasMore && \(/,
  `{showLoadMore && (`
);

fs.writeFileSync('src/components/ActivityFeedModal.tsx', content);
console.log('Fixed ActivityFeedModal pagination logic');

const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /<ActivityFeedModal\s+isOpen=\{isActivityFeedOpen\}\s+onClose=\{\(\) => setIsActivityFeedOpen\(false\)\}\s+currentUser=\{user\}\s+activities=\{activities\}/,
  `<ActivityFeedModal
          isOpen={isActivityFeedOpen}
          onClose={() => setIsActivityFeedOpen(false)}
          currentUser={user}
          activities={activities}
          hasMore={feedHasMore}
          onLoadMore={loadMoreActivities}
          isLoading={isLoadingFeed}`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx feed modal');

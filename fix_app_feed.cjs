const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove isActivityFeedOpen state
content = content.replace(/const \[isActivityFeedOpen, setIsActivityFeedOpen\] = useState\(false\);\n/, '');

// Fix onOpenActivityFeed references
content = content.replace(/onOpenActivityFeed=\{\(\) => setIsActivityFeedOpen\(true\)\}/g, '');

// Replace isActivityFeedOpen render with activeTab === 'feed'
content = content.replace(/\{isActivityFeedOpen && \(\s*<FeedView\s*onClose=\{\(\) => setIsActivityFeedOpen\(false\)\}/g, "{activeTab === 'feed' && (\n        <FeedView");

// In cases where setIsActivityFeedOpen was called to close it (e.g. going to map), remove it
content = content.replace(/setIsActivityFeedOpen\(false\);/g, '');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed Feed in App.tsx');

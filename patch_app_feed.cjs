const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add feedService import
if (!content.includes('fetchFeed')) {
    content = content.replace(
        "import { onAuthStateChanged } from 'firebase/auth';",
        "import { onAuthStateChanged } from 'firebase/auth';\nimport { fetchFeed } from './lib/feedService';"
    );
}

// Modify loadInitialFeed
const feedCode = `
  const loadInitialFeed = async (userId: string) => {
    try {
      setIsLoadingFeed(true);
      const posts = await fetchFeed();
      
      // Combine with local activities if any (or just use posts)
      // For now, let's just prepend posts to initial activities
      setActivities(posts);
      setFeedHasMore(false);
    } catch (e) {
      console.error('Error loading feed', e);
    } finally {
      setIsLoadingFeed(false);
    }
  };
`;

content = content.replace(/  const loadInitialFeed = async \(userId: string\) => \{\};\n/g, feedCode);

// Add a hook to reload feed when it mounts or just load once
content = content.replace(/    \/\/ Initialize DB\n/g, "    // Initialize DB\n    loadInitialFeed(user.id);\n");


fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx feed loading patched');

const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Ensure onNewPost is passed
const feedProps = `
          onNewPost={(newPost) => {
             setActivities(prev => [newPost, ...prev]);
             showToast("Publicação realizada com sucesso!");
          }}
          initialFilter={activityFeedInitialFilter}
`;

content = content.replace(/          initialFilter=\{activityFeedInitialFilter\}/, feedProps);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx onNewPost patched');

const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const handleToggleFollow = \(id: string\) => \{ /,
  `const handleToggleFollow = async (id: string) => { 
    try {
      if (user) {
        await SocialService.toggleFollow(user.id, id);
      }
    } catch (e) {
      console.warn("Could not sync follow state to mock db", e);
    }
`
);

fs.writeFileSync('src/App.tsx', content);

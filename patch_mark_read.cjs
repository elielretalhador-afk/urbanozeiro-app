const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const handleMarkNotificationAsRead = \(id: string\) => \{[\s\S]*?    \);[\s\S]*?  \};/,
  `const handleMarkNotificationAsRead = (id: string) => {
    SocialService.markNotificationAsRead(id).catch(console.error);
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );
  };`
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App patched handleMarkNotificationAsRead');

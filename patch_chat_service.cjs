const fs = require('fs');
let content = fs.readFileSync('src/services/chat.ts', 'utf8');

content = content.replace(
  'import { \n  collection, ',
  'import { SocialService } from \'./social\';\nimport { \n  collection, '
);

content = content.replace(
  'await setDoc(doc(db, \'chats\', chatId), {',
  `// Create notification for the receiver
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    if (chatDoc.exists()) {
      const participants = chatDoc.data().participants || [];
      const receiverId = participants.find((p: string) => p !== senderId);
      if (receiverId) {
        await SocialService.sendNotification(receiverId, senderId, 'new_message', 'enviou uma mensagem.');
      }
    }

    await setDoc(doc(db, 'chats', chatId), {`
);

fs.writeFileSync('src/services/chat.ts', content, 'utf8');
console.log('ChatService patched with notifications');

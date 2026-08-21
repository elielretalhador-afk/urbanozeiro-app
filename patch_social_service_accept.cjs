const fs = require('fs');
let content = fs.readFileSync('src/services/social.ts', 'utf8');

content = content.replace(
  'async acceptFriendRequest(requestId: string, senderId: string, receiverId: string) {',
  `async acceptFriendRequest(senderId: string, receiverId: string) {
    const friendshipId = this.getFriendshipId(senderId, receiverId);
    
    // Create friend relationship
    await setDoc(doc(db, 'friends', friendshipId), {
      participants: [senderId, receiverId],
      createdAt: serverTimestamp()
    });

    // Delete the request
    const q = query(collection(db, 'friendRequests'), where('senderId', '==', senderId), where('receiverId', '==', receiverId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docSnap) => {
      await deleteDoc(docSnap.ref);
    });

    // Notify sender
    await this.sendNotification(senderId, receiverId, 'friend_accept', 'aceitou sua solicitação de amizade.');
  }
  
  async _old_accept() {`
);

content = content.replace(
  'async rejectFriendRequest(requestId: string) {',
  `async rejectFriendRequest(senderId: string, receiverId: string) {
    const q = query(collection(db, 'friendRequests'), where('senderId', '==', senderId), where('receiverId', '==', receiverId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docSnap) => {
      await deleteDoc(docSnap.ref);
    });
  }
  
  async _old_reject() {`
);

fs.writeFileSync('src/services/social.ts', content, 'utf8');
console.log('SocialService patched for accept/reject');

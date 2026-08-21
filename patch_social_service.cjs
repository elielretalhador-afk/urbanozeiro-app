const fs = require('fs');

const newContent = `import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { SocialPlayer } from '../types';

export const SocialService = {
  // Utility for ID generation
  getFriendshipId(uid1: string, uid2: string) {
    return uid1 < uid2 ? \`\${uid1}_\${uid2}\` : \`\${uid2}_\${uid1}\`;
  },
  
  getFollowId(followerId: string, followingId: string) {
    return \`\${followerId}_\${followingId}\`;
  },

  // ==========================================
  // SEARCH & PROFILES
  // ==========================================
  async searchPublicPlayers(searchQuery: string, currentUserId: string): Promise<SocialPlayer[]> {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    
    // In a real app we'd use a better search service like Algolia or Meilisearch.
    // For now, fetch all users and filter in memory, or use startAt/endAt if possible.
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const results: SocialPlayer[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.uid === currentUserId) return; // Skip self
      
      const username = (data.username || '').toLowerCase();
      if (username.includes(q)) {
        results.push(this.formatUserToSocialPlayer(data));
      }
    });
    
    return results;
  },

  async getPublicProfile(userId: string): Promise<SocialPlayer | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return null;
    return this.formatUserToSocialPlayer(userDoc.data());
  },

  formatUserToSocialPlayer(data: any): SocialPlayer {
    const numHash = (data.uid || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) || 123;
    const level = (numHash % 30) + 1;
    const xp = level * 1000 + (numHash % 1000);
    return {
      id: data.uid,
      authId: data.uid,
      name: data.username || 'Jogador',
      nickname: (data.username || '').toLowerCase().replace(/\\s+/g, '_'),
      tag: \`#\${(numHash % 1000).toString().padStart(3, '0')}\`,
      avatar: \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${data.uid}\`,
      level,
      xp,
      status: 'ONLINE',
      followersCount: 0, // Would be fetched separately or cached
      followingCount: 0,
      isFollowing: false,
      totalKm: (numHash % 500) + 10,
      achievementsCount: (numHash % 50) + 5,
      zonesControlled: (numHash % 5),
    };
  },

  // ==========================================
  // FRIENDSHIPS
  // ==========================================
  async sendFriendRequest(senderId: string, receiverId: string) {
    // Check if already friends
    const friendshipId = this.getFriendshipId(senderId, receiverId);
    const friendDoc = await getDoc(doc(db, 'friends', friendshipId));
    if (friendDoc.exists()) throw new Error("Vocês já são amigos.");

    // Check if request already exists
    const q = query(collection(db, 'friendRequests'), where('senderId', '==', senderId), where('receiverId', '==', receiverId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) throw new Error("Solicitação já enviada.");

    // Create request
    const requestRef = await addDoc(collection(db, 'friendRequests'), {
      senderId,
      receiverId,
      createdAt: serverTimestamp(),
      status: 'pending'
    });

    // Notify receiver
    await this.sendNotification(receiverId, senderId, 'friend_request', 'enviou uma solicitação de amizade.');
    return requestRef.id;
  },

  async acceptFriendRequest(requestId: string, senderId: string, receiverId: string) {
    const friendshipId = this.getFriendshipId(senderId, receiverId);
    
    // Create friend relationship
    await setDoc(doc(db, 'friends', friendshipId), {
      participants: [senderId, receiverId],
      createdAt: serverTimestamp()
    });

    // Delete the request
    await deleteDoc(doc(db, 'friendRequests', requestId));

    // Notify sender
    await this.sendNotification(senderId, receiverId, 'friend_accept', 'aceitou sua solicitação de amizade.');
  },

  async rejectFriendRequest(requestId: string) {
    await deleteDoc(doc(db, 'friendRequests', requestId));
  },

  async checkFriendshipStatus(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) return 'self';
    
    const friendshipId = this.getFriendshipId(currentUserId, targetUserId);
    const friendDoc = await getDoc(doc(db, 'friends', friendshipId));
    if (friendDoc.exists()) return 'friends';

    const reqSentQ = query(collection(db, 'friendRequests'), where('senderId', '==', currentUserId), where('receiverId', '==', targetUserId));
    const reqSentSnap = await getDocs(reqSentQ);
    if (!reqSentSnap.empty) return 'request_sent';

    const reqReceivedQ = query(collection(db, 'friendRequests'), where('senderId', '==', targetUserId), where('receiverId', '==', currentUserId));
    const reqReceivedSnap = await getDocs(reqReceivedQ);
    if (!reqReceivedSnap.empty) return 'request_received';

    return 'none';
  },

  // ==========================================
  // FOLLOWERS
  // ==========================================
  async toggleFollow(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) throw new Error("Não pode seguir a si mesmo");
    
    const followId = this.getFollowId(currentUserId, targetUserId);
    const followRef = doc(db, 'followers', followId);
    const followDoc = await getDoc(followRef);

    if (followDoc.exists()) {
      await deleteDoc(followRef);
      return { isFollowing: false };
    } else {
      await setDoc(followRef, {
        followerId: currentUserId,
        followingId: targetUserId,
        createdAt: serverTimestamp()
      });
      // Notify target user
      await this.sendNotification(targetUserId, currentUserId, 'new_follower', 'começou a seguir você.');
      return { isFollowing: true };
    }
  },

  async checkIsFollowing(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) return false;
    const followId = this.getFollowId(currentUserId, targetUserId);
    const followDoc = await getDoc(doc(db, 'followers', followId));
    return followDoc.exists();
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  async sendNotification(recipientId: string, senderId: string, type: string, message: string) {
    await addDoc(collection(db, 'notifications'), {
      recipientId,
      senderId,
      type,
      message,
      read: false,
      createdAt: serverTimestamp()
    });
  },

  subscribeToNotifications(userId: string, callback: (notifications: any[]) => void) {
    const q = query(collection(db, 'notifications'), where('recipientId', '==', userId), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, async (snapshot) => {
      const notifs = [];
      for (const document of snapshot.docs) {
        const data = document.data();
        // Fetch sender details
        let senderName = 'Usuário';
        if (data.senderId) {
          const userDoc = await getDoc(doc(db, 'users', data.senderId));
          if (userDoc.exists()) {
            senderName = userDoc.data().username;
          }
        }
        notifs.push({
          id: document.id,
          ...data,
          senderName
        });
      }
      callback(notifs);
    });
  },

  async markNotificationAsRead(notificationId: string) {
    await setDoc(doc(db, 'notifications', notificationId), { read: true }, { merge: true });
  }
};
`;

fs.writeFileSync('src/services/social.ts', newContent, 'utf8');
console.log('SocialService updated to use Firestore');

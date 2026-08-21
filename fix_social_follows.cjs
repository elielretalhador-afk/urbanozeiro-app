const fs = require('fs');
let content = fs.readFileSync('src/services/social.ts', 'utf8');

const followsMethods = `
  async getFollowers(userId: string, currentUserId: string): Promise<SocialPlayer[]> {
    const followsQ = query(collection(db, 'followers'), where('followingId', '==', userId));
    const snapshot = await getDocs(followsQ);
    const followerIds = snapshot.docs.map(doc => doc.data().followerId);
    
    const results: SocialPlayer[] = [];
    for (const fid of followerIds) {
      const uDoc = await getDoc(doc(db, 'users', fid));
      if (uDoc.exists()) {
        const p = this.formatUserToSocialPlayer(uDoc.data());
        p.isFollowing = await this.checkIsFollowing(currentUserId, fid);
        const friendStatus = await this.checkFriendshipStatus(currentUserId, fid);
        p.isFriend = friendStatus === 'friends';
        if (friendStatus === 'request_sent') p.friendRequestStatus = 'PENDING_SENT';
        else if (friendStatus === 'request_received') p.friendRequestStatus = 'PENDING_RECEIVED';
        else p.friendRequestStatus = 'NONE';
        results.push(p);
      }
    }
    return results;
  },

  async getFollowing(userId: string, currentUserId: string): Promise<SocialPlayer[]> {
    const followsQ = query(collection(db, 'followers'), where('followerId', '==', userId));
    const snapshot = await getDocs(followsQ);
    const followingIds = snapshot.docs.map(doc => doc.data().followingId);
    
    const results: SocialPlayer[] = [];
    for (const fid of followingIds) {
      const uDoc = await getDoc(doc(db, 'users', fid));
      if (uDoc.exists()) {
        const p = this.formatUserToSocialPlayer(uDoc.data());
        p.isFollowing = await this.checkIsFollowing(currentUserId, fid);
        const friendStatus = await this.checkFriendshipStatus(currentUserId, fid);
        p.isFriend = friendStatus === 'friends';
        if (friendStatus === 'request_sent') p.friendRequestStatus = 'PENDING_SENT';
        else if (friendStatus === 'request_received') p.friendRequestStatus = 'PENDING_RECEIVED';
        else p.friendRequestStatus = 'NONE';
        results.push(p);
      }
    }
    return results;
  },
`;

if (!content.includes('async getFollowers')) {
  content = content.replace(
    'async sendNotification(recipientId: string, senderId: string, type: string, message: string) {',
    followsMethods + '\n  async sendNotification(recipientId: string, senderId: string, type: string, message: string) {'
  );
}

fs.writeFileSync('src/services/social.ts', content, 'utf8');
console.log('SocialService fixed follows');

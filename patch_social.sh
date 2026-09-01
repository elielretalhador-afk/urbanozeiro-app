#!/bin/bash
sed -i '/async getFollowing(/i \
  async getFriends(userId: string, currentUserId: string): Promise<SocialPlayer[]> {\
    const friendsQ = query(collection(db, '"'"'friends'"'"'), where('"'"'participants'"'"', '"'"'array-contains'"'"', userId));\
    const snapshot = await getDocs(friendsQ);\
    const friendIds = snapshot.docs.map(doc => doc.data().participants.find((p: string) => p !== userId) || "");\
    \
    const results: SocialPlayer[] = [];\
    for (const fid of friendIds) {\
      if (!fid) continue;\
      const uDoc = await getDoc(doc(db, '"'"'users'"'"', fid));\
      if (uDoc.exists()) {\
        const p = this.formatUserToSocialPlayer(uDoc.data());\
        p.isFollowing = await this.checkIsFollowing(currentUserId, fid);\
        const friendStatus = await this.checkFriendshipStatus(currentUserId, fid);\
        p.isFriend = friendStatus === '"'"'friends'"'"';\
        if (friendStatus === '"'"'request_sent'"'"') p.friendRequestStatus = '"'"'PENDING_SENT'"'"';\
        else if (friendStatus === '"'"'request_received'"'"') p.friendRequestStatus = '"'"'PENDING_RECEIVED'"'"';\
        else p.friendRequestStatus = '"'"'NONE'"'"';\
        results.push(p);\
      }\
    }\
    return results;\
  },\
\
  async getFriendRequests(userId: string): Promise<SocialPlayer[]> {\
    const q = query(collection(db, '"'"'friendRequests'"'"'), where('"'"'receiverId'"'"', '"'"'=='"'"', userId), where('"'"'status'"'"', '"'"'=='"'"', '"'"'pending'"'"'));\
    const snapshot = await getDocs(q);\
    const senderIds = snapshot.docs.map(doc => doc.data().senderId);\
    \
    const results: SocialPlayer[] = [];\
    for (const sid of senderIds) {\
      const uDoc = await getDoc(doc(db, '"'"'users'"'"', sid));\
      if (uDoc.exists()) {\
        const p = this.formatUserToSocialPlayer(uDoc.data());\
        p.friendRequestStatus = '"'"'PENDING_RECEIVED'"'"';\
        results.push(p);\
      }\
    }\
    return results;\
  },\
\
  async removeFriend(currentUserId: string, targetUserId: string) {\
    const friendshipId = this.getFriendshipId(currentUserId, targetUserId);\
    await deleteDoc(doc(db, '"'"'friends'"'"', friendshipId));\
  },\
' src/services/social.ts

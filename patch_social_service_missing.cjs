const fs = require('fs');
let content = fs.readFileSync('src/services/social.ts', 'utf8');

// We need to add getAllPlayers and getPlayersPaginated
content = content.replace(
  '// ==========================================\n  // FRIENDSHIPS',
  `async getAllPlayers(currentUserId: string): Promise<SocialPlayer[]> {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const results: SocialPlayer[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.uid !== currentUserId) {
        results.push(this.formatUserToSocialPlayer(data));
      }
    });
    
    // For MVP, populate relationship status manually
    for (const player of results) {
      player.isFollowing = await this.checkIsFollowing(currentUserId, player.id);
      
      const friendStatus = await this.checkFriendshipStatus(currentUserId, player.id);
      player.isFriend = friendStatus === 'friends';
      
      if (friendStatus === 'request_sent') player.friendRequestStatus = 'PENDING_SENT';
      else if (friendStatus === 'request_received') player.friendRequestStatus = 'PENDING_RECEIVED';
      else player.friendRequestStatus = 'NONE';
    }
    
    return results;
  }

  // ==========================================
  // FRIENDSHIPS`
);

fs.writeFileSync('src/services/social.ts', content, 'utf8');
console.log('SocialService patched for getAllPlayers');

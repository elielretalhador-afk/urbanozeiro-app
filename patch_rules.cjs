const fs = require('fs');

const newRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.playerId == request.auth.uid;
      allow update: if request.auth != null && resource.data.playerId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.playerId == request.auth.uid;
    }
    match /friendRequests/{requestId} {
      allow read: if request.auth != null && (resource.data.senderId == request.auth.uid || resource.data.receiverId == request.auth.uid);
      allow create: if request.auth != null && request.resource.data.senderId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.receiverId == request.auth.uid;
    }
    match /friends/{friendshipId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && (request.auth.uid in request.resource.data.participants || request.auth.uid in resource.data.participants);
    }
    match /followers/{relId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.followerId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.followerId == request.auth.uid;
    }
    match /notifications/{notificationId} {
      allow read, update, delete: if request.auth != null && resource.data.recipientId == request.auth.uid;
      allow create: if request.auth != null;
    }
    match /chats/{chatId} {
      allow read, create, update: if request.auth != null && (request.auth.uid in request.resource.data.participants || request.auth.uid in resource.data.participants);
      match /messages/{messageId} {
        allow read, create: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      }
    }
  }
}
`;

fs.writeFileSync('firestore.rules', newRules, 'utf8');
console.log('firestore.rules updated');

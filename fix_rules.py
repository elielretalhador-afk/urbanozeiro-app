import sys

with open('firestore.rules', 'r') as f:
    content = f.read()

# Let's remove the bad block first
bad_block = """    match /users/{userId}/wallet/main {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Server-authoritative ONLY
    }
    match /users/{userId}/walletTransactions/{transactionId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Server-authoritative ONLY
    }
    match /users/{userId}/chests/{chestId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Server-authoritative ONLY
    }"""

content = content.replace(bad_block, "")

# Now let's inject it into `match /users/{userId}` instead, or just inside `match /databases/{database}/documents`
# Let's find `match /users/{userId} {`
user_match = """    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }"""

new_user_match = """    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      match /wallet/main {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false;
      }
      match /walletTransactions/{transactionId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false;
      }
      match /chests/{chestId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false;
      }
    }"""

content = content.replace(user_match, new_user_match)

with open('firestore.rules', 'w') as f:
    f.write(content)

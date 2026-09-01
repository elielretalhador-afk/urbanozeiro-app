import sys

with open('firestore.rules', 'r') as f:
    content = f.read()

rules_to_add = """
    match /users/{userId}/wallet/main {
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
    }
"""

# Insert before the last closing brace
last_brace_idx = content.rfind('}')
if last_brace_idx != -1:
    content = content[:last_brace_idx] + rules_to_add + content[last_brace_idx:]

with open('firestore.rules', 'w') as f:
    f.write(content)

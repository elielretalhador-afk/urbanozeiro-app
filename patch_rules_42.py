import sys

with open('firestore.rules', 'r') as f:
    content = f.read()

rules_to_add = """
    match /shopItems/{itemId} {
      allow read: if request.auth != null;
      allow write: if false; // Server-authoritative
    }
    match /officialTitles/{titleId} {
      allow read: if request.auth != null;
      allow write: if false; // Server-authoritative
    }
"""

user_rules_to_add = """
      match /inventory/{itemId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false;
      }
      match /profile/cosmetics {
        allow read: if true;
        allow write: if false; // Server-authoritative
      }
"""

if "match /shopItems/{itemId}" not in content:
    # Insert top level collections inside /databases/$(database)/documents
    # find the match /users/{userId}
    content = content.replace("    match /users/{userId} {", rules_to_add + "    match /users/{userId} {")
    
    # Insert inside user match
    content = content.replace("      match /chests/{chestId} {", "      match /chests/{chestId} {\n        allow read: if request.auth != null && request.auth.uid == userId;\n        allow write: if false;\n      }\n" + user_rules_to_add)

    # Clean up any duplicated chestId rules from the replacement if needed. Actually let's just do a simple replacement carefully.

with open('firestore.rules', 'w') as f:
    f.write(content)

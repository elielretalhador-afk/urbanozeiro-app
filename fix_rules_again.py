import sys

with open('firestore.rules', 'r') as f:
    content = f.read()

bad_str = """      match /profile/cosmetics {
        allow read: if true;
        allow write: if false; // Server-authoritative
      }
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false;
      }"""

good_str = """      match /profile/cosmetics {
        allow read: if true;
        allow write: if false; // Server-authoritative
      }"""

content = content.replace(bad_str, good_str)

with open('firestore.rules', 'w') as f:
    f.write(content)

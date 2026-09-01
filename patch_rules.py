with open('firestore.rules', 'r') as f:
    content = f.read()

# Add subcollection rules under match /users/{userId}
target = """    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;"""

replacement = """    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;

      match /devices/{deviceId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth != null && request.auth.uid == userId;
      }

      match /notificationPrefs/{prefId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth != null && request.auth.uid == userId;
      }"""

if "match /devices/{deviceId}" not in content:
    content = content.replace(target, replacement)
    
with open('firestore.rules', 'w') as f:
    f.write(content)

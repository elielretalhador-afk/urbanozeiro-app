import sys

with open('firestore.rules', 'r') as f:
    lines = f.readlines()

# We need to find the orphaned block:
#         allow read: if request.auth != null && request.auth.uid == userId;
#         allow write: if false;
#       }

new_lines = []
skip = False
for i, line in enumerate(lines):
    if "allow read: if request.auth != null && request.auth.uid == userId;" in line and "allow write: if false;" in lines[i+1] and "      }" in lines[i+2] and "match" not in lines[i-1]:
        skip = True
        skip_count = 3
    
    if skip:
        skip_count -= 1
        if skip_count == 0:
            skip = False
        continue
    
    new_lines.append(line)

# Also I need to restore the posts rules because I deleted them with sed.
# Wait, let's see what was in posts before the deletion:
#    match /posts/{postId} {
#      allow read: if true;
#      allow create: if request.auth != null && request.resource.data.playerId == request.auth.uid;
#      allow update: if request.auth != null && resource.data.playerId == request.auth.uid;
#      allow delete: if request.auth != null && resource.data.playerId == request.auth.uid;
#    }

posts_block = """    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.playerId == request.auth.uid;
      allow update: if request.auth != null && resource.data.playerId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.playerId == request.auth.uid;
    }
"""

# Let's rebuild the whole file cleanly just in case

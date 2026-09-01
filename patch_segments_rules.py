import re

with open("firestore.rules", "r") as f:
    content = f.read()

segments_rules = """
    match /segments/{segmentId} {
      allow read: if request.auth != null;
      allow create, delete: if false;
      
      allow update: if request.auth != null
        && request.resource.data.get('path', null) == resource.data.get('path', null)
        && request.resource.data.get('length', null) == resource.data.get('length', null)
        && request.resource.data.get('center', null) == resource.data.get('center', null)
        && request.resource.data.get('creator', null) == resource.data.get('creator', null)
        && request.resource.data.get('name', null) == resource.data.get('name', null)
        && request.resource.data.get('startPoint', null) == resource.data.get('startPoint', null)
        && request.resource.data.get('endPoint', null) == resource.data.get('endPoint', null)
        && request.resource.data.get('type', null) == resource.data.get('type', null)
        && (
          request.resource.data.get('bestRecord', null) == resource.data.get('bestRecord', null) ||
          (
            request.resource.data.get('bestRecord', null) != null &&
            request.resource.data.bestRecord.playerId == request.auth.uid &&
            (
              resource.data.get('bestRecord', null) == null ||
              request.resource.data.bestRecord.timeSeconds < resource.data.bestRecord.timeSeconds
            )
          )
        );
      
      match /attempts/{attemptId} {
        allow read: if request.auth != null;
        allow update, delete: if false;
        allow create: if request.auth != null 
          && request.resource.data.get('playerId', '') == request.auth.uid
          && request.resource.data.get('attemptId', '') == attemptId
          && request.resource.data.get('operationId', '') != ''
          && request.resource.data.get('timeSeconds', 0) > 0;
      }
    }
    
    match /sessions/{sessionId} {"""

if "match /segments/{segmentId}" not in content:
    content = content.replace("match /sessions/{sessionId} {", segments_rules)
    with open("firestore.rules", "w") as f:
        f.write(content)
    print("Rules updated successfully.")
else:
    print("Rules already present.")

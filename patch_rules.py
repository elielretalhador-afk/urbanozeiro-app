import re

with open('firestore.rules', 'r') as f:
    content = f.read()

replacement = """      allow update: if request.auth != null
        && request.resource.data.radius == resource.data.radius
        && request.resource.data.center == resource.data.center
        && request.resource.data.name == resource.data.name
        && request.resource.data.type == resource.data.type
        && (
          request.resource.data.controller == resource.data.controller || 
          request.resource.data.controller == null ||
          request.resource.data.controller.id == request.auth.uid
        );"""

content = re.sub(r'      allow update: if request\.auth != null.*?&& request\.resource\.data\.type == resource\.data\.type;', replacement, content, flags=re.DOTALL)

with open('firestore.rules', 'w') as f:
    f.write(content)

import sys

with open('firestore.rules', 'r') as f:
    content = f.read()

old_rule = """        (
          request.resource.data.diff(resource.data).affectedKeys().hasOnly(['territoryScore', 'zonesControlledCount', 'missions', 'xp', 'level', 'nextLevelXp'])
          && request.auth.uid in resource.data.memberIds
        )
      );"""

new_rule = """        (
          request.resource.data.diff(resource.data).affectedKeys().hasOnly(['territoryScore', 'zonesControlledCount', 'missions', 'xp', 'level', 'nextLevelXp'])
          && request.auth != null
        )
      );"""

if old_rule in content:
    content = content.replace(old_rule, new_rule)
else:
    print("Could not find the rule to patch")

with open('firestore.rules', 'w') as f:
    f.write(content)

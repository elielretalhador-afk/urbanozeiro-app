import sys

with open('src/types/index.ts', 'r') as f:
    content = f.read()

old_zone = """  conquestHistory?: any[];"""

new_zone = """  conquestHistory?: any[];
  clanCooldowns?: Record<string, number>;"""

if old_zone in content:
    content = content.replace(old_zone, new_zone)
    print("Replaced!")
else:
    print("Not found! Let's find something else in Zone interface")

with open('src/types/index.ts', 'w') as f:
    f.write(content)

import re

with open("src/index.css", "r") as f:
    content = f.read()

# Replace all #00ff66 with #fce803
content = content.replace("#00ff66", "#fce803")

# Replace all 0, 255, 102 with 252, 232, 3 (for rgb/rgba)
content = content.replace("0, 255, 102", "252, 232, 3")

# Update btn-game-primary background from green to yellow
old_primary = """  background: linear-gradient(180deg, #10f074 0%, #00cc55 100%);
  box-shadow: 0 5px 0 #057036, 0 10px 25px rgba(252, 232, 3, 0.35);"""

new_primary = """  background: linear-gradient(180deg, #fde047 0%, #eab308 100%);
  box-shadow: 0 5px 0 #a16207, 0 10px 25px rgba(252, 232, 3, 0.35);"""
content = content.replace(old_primary, new_primary)

old_primary_hover = """  background: linear-gradient(180deg, #22ff85 0%, #00e05d 100%);
  box-shadow: 0 5px 0 #057036, 0 12px 30px rgba(252, 232, 3, 0.5);"""

new_primary_hover = """  background: linear-gradient(180deg, #fef08a 0%, #ca8a04 100%);
  box-shadow: 0 5px 0 #a16207, 0 12px 30px rgba(252, 232, 3, 0.5);"""
content = content.replace(old_primary_hover, new_primary_hover)

old_primary_active = """  transform: translateY(4px);
  box-shadow: 0 1px 0 #057036, 0 4px 12px rgba(252, 232, 3, 0.3);"""

new_primary_active = """  transform: translateY(4px);
  box-shadow: 0 1px 0 #a16207, 0 4px 12px rgba(252, 232, 3, 0.3);"""
content = content.replace(old_primary_active, new_primary_active)

with open("src/index.css", "w") as f:
    f.write(content)

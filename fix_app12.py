import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("if (user && user.id) {\n      loadSocialData();", "if (user && user.authId && authState === 'AUTHENTICATED') {\n      loadSocialData();")

with open('src/App.tsx', 'w') as f:
    f.write(content)

import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("  }, [user.id, user.authId]);", "  }, [user.authId, authState]);")

with open('src/App.tsx', 'w') as f:
    f.write(content)

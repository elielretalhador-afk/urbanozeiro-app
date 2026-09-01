import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("  }, [user?.authId]);\n", "  }, [user?.authId, authState]);\n")

with open('src/App.tsx', 'w') as f:
    f.write(content)

import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("    };\n  }, [user.id]);\n\n  useEffect(() => {", "    };\n  }, [user.authId, authState]);\n\n  useEffect(() => {")

content = content.replace("  }, [user?.authId]);\n\n  useEffect(() => {", "  }, [user?.authId, authState]);\n\n  useEffect(() => {")

with open('src/App.tsx', 'w') as f:
    f.write(content)

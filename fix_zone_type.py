import sys

with open('src/types/index.ts', 'r') as f:
    content = f.read()

content = content.replace("  conqueredAtUnix?: number;\n}", "  conqueredAtUnix?: number;\n  clanCooldowns?: Record<string, number>;\n}")

with open('src/types/index.ts', 'w') as f:
    f.write(content)

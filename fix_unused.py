import sys

with open('functions/src/index.ts', 'r') as f:
    content = f.read()

content = content.replace("const context = { auth: request.auth };", "// eslint-disable-next-line @typescript-eslint/no-unused-vars\n    const context = { auth: request.auth };")

with open('functions/src/index.ts', 'w') as f:
    f.write(content)

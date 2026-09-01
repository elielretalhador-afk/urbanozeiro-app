import sys

with open('functions/src/index.ts', 'r') as f:
    content = f.read()

# I will replace the SECOND instance of `    const context = { auth: request.auth };` with ``
parts = content.split("    const context = { auth: request.auth };")
if len(parts) == 3:
    content = parts[0] + "    const context = { auth: request.auth };" + parts[1] + parts[2]
    
with open('functions/src/index.ts', 'w') as f:
    f.write(content)

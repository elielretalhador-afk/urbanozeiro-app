with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '  const handleCreateZone = async (newZone: Zone) => {\n    try {\n      await DatabaseService.createZone(newZone);',
    '  const handleCreateZone = async (newZone: Zone) => {\n    try {\n      await DatabaseService.createZone(newZone);'
)
# Nothing really needed, handleCreateZone is already an async function that returns a promise.

with open('src/App.tsx', 'w') as f:
    f.write(content)

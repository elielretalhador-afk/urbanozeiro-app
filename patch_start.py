import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("  const handleStartSession = () => {",
"""  const handleStartSession = () => {
    if (sessionStatusRef.current === 'ACTIVE' || sessionStatusRef.current === 'PAUSED') return;""")

with open('src/App.tsx', 'w') as f:
    f.write(content)

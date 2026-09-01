import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("  const [isAuthScreen, setIsAuthScreen] = useState(true);", "  const [isAuthScreen, setIsAuthScreen] = useState(true);\n  const [isProcessingOperation, setIsProcessingOperation] = useState(false);")

with open('src/App.tsx', 'w') as f:
    f.write(content)

import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("  const [centerTrigger, setCenterTrigger] = useState(0);", "  const [centerTrigger, setCenterTrigger] = useState(0);\n  const [isProcessingOperation, setIsProcessingOperation] = useState(false);")

with open('src/App.tsx', 'w') as f:
    f.write(content)

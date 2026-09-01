import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("const [minSplashTimeElapsed, setMinSplashTimeElapsed] = useState(false);", "const [minSplashTimeElapsed, setMinSplashTimeElapsed] = useState(false);\n  useEffect(() => {\n    const timer = setTimeout(() => {\n      setMinSplashTimeElapsed(true);\n    }, 4500);\n    return () => clearTimeout(timer);\n  }, []);")

with open('src/App.tsx', 'w') as f:
    f.write(content)

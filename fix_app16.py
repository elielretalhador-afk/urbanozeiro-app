import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("  const [authState, setAuthState] = useState<any>('LOADING');\n", "")

content = content.replace(
    "  const [activeTab, setActiveTab] = useState<TabType>('mapa');",
    "  const [authState, setAuthState] = useState<'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED'>('LOADING');\n  const [activeTab, setActiveTab] = useState<TabType>('mapa');"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

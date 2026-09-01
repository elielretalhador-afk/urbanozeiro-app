import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "  const [authState, setAuthState] = useState<'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED'>('LOADING');",
    "  const [authState, setAuthState] = useState<'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED' | 'ERROR'>('LOADING');"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

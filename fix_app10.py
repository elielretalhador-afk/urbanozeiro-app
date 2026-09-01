import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

replacement = """
      } else {
        // User is logged out
        setAuthState('UNAUTHENTICATED');
        if (localStorage.getItem('urbanozeiro_user')) {
            localStorage.removeItem('urbanozeiro_user');
        }
        setUser(prev => ({ ...prev, authId: undefined, id: 'usr_me' }));
      }
"""

content = re.sub(r"\} else \{\n        // If they are not in firebase but have a local token, clear it to force re-login\n        if \(localStorage\.getItem\('urbanozeiro_auth_token'\)\) \{\n            localStorage\.removeItem\('urbanozeiro_auth_token'\);\n            setAuthState\('UNAUTHENTICATED'\);\n        \}\n        setUser\(prev => \(\{ \.\.\.prev, authId: undefined, id: 'usr_me' \}\)\);\n      \}", replacement.strip(), content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)

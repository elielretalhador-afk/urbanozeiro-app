import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r"    if \(user\.id && user\.id !== 'usr_me'\) \{\n      const unsub = EconomyService\.subscribeToProfileCosmetics\(user\.authId \|\| user\.id, \(cosmetics: any\) => \{",
    r"    if (user?.authId) {\n      const unsub = EconomyService.subscribeToProfileCosmetics(user.authId, (cosmetics: any) => {",
    content
)

content = re.sub(
    r"  useEffect\(\(\) => \{\n    if \(user\?\.id\) \{\n       const unsub = EconomyService\.subscribeToWallet\(user\.id, \(w\) => \{",
    r"  useEffect(() => {\n    if (user?.authId) {\n       const unsub = EconomyService.subscribeToWallet(user.authId, (w) => {",
    content
)
content = re.sub(r'\}, \[user\?\.id\]\);', r'}, [user?.authId]);', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

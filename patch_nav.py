import sys

with open('src/components/BottomNav.tsx', 'r') as f:
    content = f.read()

content = content.replace("{ id: 'perfil' as TabType, label: 'PERFIL', icon: User }", "{ id: 'perfil' as TabType, label: 'HUB', icon: User }")

with open('src/components/BottomNav.tsx', 'w') as f:
    f.write(content)

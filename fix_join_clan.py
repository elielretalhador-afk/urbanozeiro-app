with open('src/components/JoinClanModal.tsx', 'r') as f:
    content = f.read()

content = content.replace('f"{clan.color}20"', '`${clan.color}20`')
content = content.replace('f"1px solid {clan.color}50"', '`1px solid ${clan.color}50`')

with open('src/components/JoinClanModal.tsx', 'w') as f:
    f.write(content)

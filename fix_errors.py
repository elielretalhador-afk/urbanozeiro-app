import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("  const [user, setUser] = useState<UserProfile | null>(null);", "  const [user, setUser] = useState<UserProfile | null>(null);\n  const [isProcessingOperation, setIsProcessingOperation] = useState(false);")

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/components/JoinClanModal.tsx', 'r') as f:
    content2 = f.read()

content2 = content2.replace('clan.membersCount >= clan.maxMembers', '(clan.membersCount || 0) >= (clan.maxMembers || 0)')

with open('src/components/JoinClanModal.tsx', 'w') as f:
    f.write(content2)

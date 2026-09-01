with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("setActiveTab('missoes'); // Or rankings", "setActiveTab('desafios'); // Or rankings")

with open('src/App.tsx', 'w') as f:
    f.write(content)

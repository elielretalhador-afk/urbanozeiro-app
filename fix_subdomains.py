import os

files = ['src/components/MapView.tsx', 'src/components/SessionHistoryModal.tsx']
for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove the subdomains: 'abcd', line
    content = content.replace("subdomains: 'abcd',", "subdomains: 'abc',")
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Fixed subdomains in {filepath}")

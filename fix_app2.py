import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Let's find the use effect context
start_idx = content.find("useEffect(() => {\n    let unsubscribeNotifs: any;")
if start_idx == -1:
    start_idx = content.find("  useEffect(() => {\n    let unsubscribeNotifs:")
    
print("Found at:", start_idx)

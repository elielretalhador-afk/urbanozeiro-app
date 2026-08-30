import os
import re

filepath = 'src/index.css'
with open(filepath, 'r') as f:
    content = f.read()

new_content = re.sub(r'backdrop-filter:\s*blur\([^)]+\);', '', content)

if new_content != content:
    with open(filepath, 'w') as f:
        f.write(new_content)
    print(f"Patched {filepath}")


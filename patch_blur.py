import os
import re

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Remove Tailwind backdrop-blur utilities
            new_content = re.sub(r'\bbackdrop-blur-[a-zA-Z0-9\[\]-]*\b', '', content)
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Patched {filepath}")


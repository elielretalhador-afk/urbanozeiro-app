import re

with open('.github/workflows/main.yml', 'r') as f:
    content = f.read()

# Find the run block for Generate Debug Keystore
# and replace the keytool line with base64 decoding
new_run_block = """      - name: Generate Debug Keystore
        run: |
          mkdir -p android/app
          echo "B64_KEYSTORE_PLACEHOLDER" | base64 -d > android/app/debug.keystore
"""

# We'll use regex to replace the old block
# Old block looks like:
#      - name: Generate Debug Keystore
#        run: |
#          mkdir -p android/app
#          keytool -genkey -v -keystore android/app/debug.keystore ...

pattern = r'      - name: Generate Debug Keystore\n        run: \|\n          mkdir -p android/app\n          keytool -genkey.*?\n'
replaced = re.sub(pattern, new_run_block, content, flags=re.DOTALL)

with open('.github/workflows/main.yml', 'w') as f:
    f.write(replaced)

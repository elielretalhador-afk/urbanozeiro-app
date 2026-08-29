#!/bin/bash
set -e

# Wait for keytool to be available
while ! command -v keytool &> /dev/null; do
    sleep 2
done

# Generate keystore
echo "Generating new keystore..."
keytool -genkey -v -keystore persistent_debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"

# Get SHA-1 and SHA-256
SHA1=$(keytool -list -v -keystore persistent_debug.keystore -alias androiddebugkey -storepass android -keypass android | grep -i "SHA1:" | awk '{print $2}')
SHA256=$(keytool -list -v -keystore persistent_debug.keystore -alias androiddebugkey -storepass android -keypass android | grep -i "SHA256:" | awk '{print $2}')

echo "SHA1: $SHA1"
echo "SHA256: $SHA256"

# Base64 encode the keystore
B64_KEYSTORE=$(base64 -w 0 persistent_debug.keystore)

# Write a patch script for the workflow
cat << 'PATCH_EOF' > patch_workflow.py
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
PATCH_EOF

python3 patch_workflow.py
sed -i "s|B64_KEYSTORE_PLACEHOLDER|$B64_KEYSTORE|g" .github/workflows/main.yml

echo "Done! Keystore patched."

import json
import base64
import re

with open('.github/workflows/main.yml', 'r') as f:
    yml = f.read()

# Extract base64
match = re.search(r'echo "(.*?)" \| base64 -d > android/app/google-services.json', yml)
if not match:
    print("Could not find google-services.json base64")
    exit(1)

b64_old = match.group(1)
json_str = base64.b64decode(b64_old).decode('utf-8')
data = json.loads(json_str)

# Update the certificate hash
# Note: Firebase drops the colons from the SHA-1 and lowercases it
new_hash = "BB:42:75:6F:58:7C:17:AE:0E:27:5C:29:4D:3A:C7:2F:95:68:4E:EC".replace(":", "").lower()

for client in data.get('client', []):
    for oauth_client in client.get('oauth_client', []):
        if 'android_info' in oauth_client:
            oauth_client['android_info']['certificate_hash'] = new_hash

new_json_str = json.dumps(data, indent=2)
new_b64 = base64.b64encode(new_json_str.encode('utf-8')).decode('utf-8')

# Replace in yml
new_yml = yml.replace(b64_old, new_b64)

with open('.github/workflows/main.yml', 'w') as f:
    f.write(new_yml)

print("Updated google-services.json in workflow.")

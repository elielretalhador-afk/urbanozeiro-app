import sys

with open('src/components/PerfilView.tsx', 'r') as f:
    content = f.read()

content = content.replace("const frameStyle = getEquippedFrameStyle(equipped.frameId || user.equippedCosmetics?.frameId);", "const frameStyle = getEquippedFrameStyle(user.profileCosmetics?.avatar_frame || equipped.frameId || user.equippedCosmetics?.frameId);")

with open('src/components/PerfilView.tsx', 'w') as f:
    f.write(content)

with open('src/components/Header.tsx', 'r') as f:
    header_content = f.read()
if "getEquippedFrameStyle" in header_content:
    header_content = header_content.replace("const frameStyle = getEquippedFrameStyle(user.equippedCosmetics?.frameId);", "const frameStyle = getEquippedFrameStyle(user.profileCosmetics?.avatar_frame || user.equippedCosmetics?.frameId);")
    with open('src/components/Header.tsx', 'w') as f:
        f.write(header_content)


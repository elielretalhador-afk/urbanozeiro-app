import re

with open("src/components/SegmentDetailsModal.tsx", "r") as f:
    content = f.read()

content = content.replace("a.playerId === user.id", "a.playerId === user.uid")

with open("src/components/SegmentDetailsModal.tsx", "w") as f:
    f.write(content)

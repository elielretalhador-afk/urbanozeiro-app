import sys

with open('src/services/db.ts', 'r') as f:
    content = f.read()

content = content.replace("    });\n  }\n\n  async queueSegmentOperation(", "    });\n  },\n\n  async queueSegmentOperation(")

with open('src/services/db.ts', 'w') as f:
    f.write(content)

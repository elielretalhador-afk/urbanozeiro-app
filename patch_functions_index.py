import sys

with open('functions/src/index.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "import { getDistanceToPath } from './validator';",
    "import { getDistanceToPath } from './utils/segmentMath';"
)

with open('functions/src/index.ts', 'w') as f:
    f.write(content)

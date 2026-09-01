import sys

with open('functions/src/index.ts', 'r') as f:
    content = f.read()

content = content.replace("import { auditTrack, TrackPoint, AuditResult } from './antiCheat/trackAudit';", "import { auditTrack, TrackPoint } from './antiCheat/trackAudit';")
content = content.replace("let pathStatus = 'unknown';", "")
content = content.replace("pathStatus = 'checked';", "")
content = content.replace("async (event) =>", "async (event: any) =>")
content = content.replace("async (transaction) =>", "async (transaction: any) =>")

with open('functions/src/index.ts', 'w') as f:
    f.write(content)

import sys
import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Make sure functions is imported
if "import { db, auth }" in content:
    content = content.replace("import { db, auth }", "import { db, auth, functions }")
elif "import { db, auth" in content:
    content = content.replace("import { db, auth", "import { db, auth, functions")
else:
    # generic import from firebase
    content = content.replace("import { db }", "import { db, functions }")

if "httpsCallable" not in content:
    content = content.replace("import { collection,", "import { httpsCallable } from 'firebase/functions';\nimport { collection,")

# find the place where ConquestResultModalData is set
process_call = """
                        // Submit to Season
                        try {
                          const processEvent = httpsCallable(functions, 'processSeasonEvent');
                          processEvent({
                            type: 'ZONE_CONQUEST',
                            sourceEventId: zoneOperation.operationId,
                            zoneId: z.id
                          }).catch(e => console.error("Falha na Season:", e));
                        } catch (e) {
                          console.error(e);
                        }
"""

content = content.replace("                        setConquestResultModalData({", process_call + "\n                        setConquestResultModalData({")

with open('src/App.tsx', 'w') as f:
    f.write(content)

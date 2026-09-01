with open('functions/src/index.ts', 'r') as f:
    content = f.read()

content = content.replace("const result = const txResult = await db.runTransaction", "const result = await db.runTransaction")
content = content.replace("const txResult = await db.runTransaction(async (transaction: any) => {", "await db.runTransaction(async (transaction: any) => {")

# Then add txResult only to the specific onZoneConquestCreated transaction
# By replacing the exact line in that function

lines = content.split('\n')
for i, line in enumerate(lines):
    if "export const onZoneConquestCreated = functions.firestore.onDocumentCreated(" in line:
        # Search forward for the transaction
        for j in range(i, len(lines)):
            if "await db.runTransaction(async (transaction: any) => {" in lines[j]:
                lines[j] = lines[j].replace("await db.runTransaction(async (transaction: any) => {", "const txResult = await db.runTransaction(async (transaction: any) => {")
                break
        break

with open('functions/src/index.ts', 'w') as f:
    f.write('\n'.join(lines))

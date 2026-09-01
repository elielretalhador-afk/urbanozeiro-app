import re

with open('functions/src/index.ts', 'r') as f:
    content = f.read()

content = content.replace("export const debugGrantCoins = functions.https.onCall(async (request: any) => {\n    // eslint-disable-next-line @typescript-eslint/no-unused-vars\n    const context = { auth: request.auth };\n    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');",
"""export const debugGrantCoins = functions.https.onCall(async (request: any) => {
    const context = { auth: request.auth };
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    if (context.auth.token.email !== 'admin@therollingwars.com') throw new functions.https.HttpsError('permission-denied', 'Admins only.');""")


content = content.replace("export const seedShop = functions.https.onCall(async (request: any) => {\n    // Admin only, or open for testing\n    try {",
"""export const seedShop = functions.https.onCall(async (request: any) => {
    const context = { auth: request.auth };
    if (!context.auth || context.auth.token.email !== 'admin@therollingwars.com') {
       throw new functions.https.HttpsError('permission-denied', 'Admins only.');
    }
    try {""")

with open('functions/src/index.ts', 'w') as f:
    f.write(content)

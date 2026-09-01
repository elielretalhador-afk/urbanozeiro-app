import re

with open('functions/src/index.ts', 'r') as f:
    content = f.read()

# Add clan invite trigger
addition = """
export const onClanInviteCreated = functions.firestore.onDocumentCreated(
  'clanInvites/{inviteId}',
  async (event: any) => {
    const snapshot = event.data;
    if (!snapshot) return;
    const inviteData = snapshot.data();
    
    if (inviteData.userId && inviteData.clanName) {
        await checkPreferencesAndSendPush(
          inviteData.userId,
          'notifySocialActivities',
          '🤝 Novo Convite de Clã',
          `Você foi convidado para o clã ${inviteData.clanName}.`,
          { type: 'clan_invite', entityId: inviteData.clanId }
        );
    }
  }
);
"""

content += addition

with open('functions/src/index.ts', 'w') as f:
    f.write(content)

import sys

with open('src/services/social.ts', 'r') as f:
    content = f.read()

old_send = "async sendNotification(recipientId: string, senderId: string, type: string, message: string) {"
new_send = "async sendNotification(recipientId: string, senderId: string, type: string, message: string, actionType?: string, actionPayload?: any) {"

old_doc = """    await addDoc(collection(db, 'notifications'), {
      recipientId,
      senderId,
      type,
      message,
      read: false,
      createdAt: serverTimestamp()
    });"""

new_doc = """    await addDoc(collection(db, 'notifications'), {
      recipientId,
      senderId,
      type,
      message,
      actionType: actionType || null,
      actionPayload: actionPayload || null,
      read: false,
      createdAt: serverTimestamp()
    });"""

content = content.replace(old_send, new_send)
content = content.replace(old_doc, new_doc)

with open('src/services/social.ts', 'w') as f:
    f.write(content)

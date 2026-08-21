import { db } from '../lib/firebase';
import { SocialService } from './social';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export const ChatService = {
  getChatId(uid1: string, uid2: string) {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  },

  async getOrCreateChat(currentUserId: string, targetUserId: string) {
    const chatId = this.getChatId(currentUserId, targetUserId);
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      await setDoc(chatRef, {
        participants: [currentUserId, targetUserId],
        updatedAt: serverTimestamp()
      });
    }
    return chatId;
  },

  async sendMessage(chatId: string, senderId: string, text: string) {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      senderId,
      text,
      createdAt: serverTimestamp()
    });

    // Create notification for the receiver
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    if (chatDoc.exists()) {
      const participants = chatDoc.data().participants || [];
      const receiverId = participants.find((p: string) => p !== senderId);
      if (receiverId) {
        await SocialService.sendNotification(receiverId, senderId, 'new_message', 'enviou uma mensagem.');
      }
    }

    await setDoc(doc(db, 'chats', chatId), {
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  subscribeToMessages(chatId: string, callback: (messages: ChatMessage[]) => void) {
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        messages.push({
          id: docSnap.id,
          senderId: data.senderId,
          text: data.text,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      callback(messages);
    });
  }
};

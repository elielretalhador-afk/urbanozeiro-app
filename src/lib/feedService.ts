import { db, storage, auth } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Activity } from '../types';

export const publishPost = async (
  text: string, 
  mediaFile: File | null, 
  user: any
) => {
  if (!auth.currentUser) throw new Error("Usuário não autenticado");

  let mediaUrl = null;
  let mediaType = null;

  if (mediaFile) {
    const isVideo = mediaFile.type.startsWith('video');
    mediaType = isVideo ? 'VIDEO' : 'IMAGE';
    
    // Upload to Firebase Storage
    const ext = mediaFile.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const storageRef = ref(storage, `posts/${auth.currentUser.uid}/${fileName}`);
    
    await uploadBytes(storageRef, mediaFile);
    mediaUrl = await getDownloadURL(storageRef);
  }

  const postType = mediaType || 'TEXT';

  const postData = {
    playerId: auth.currentUser.uid, // Use Auth ID for security rules
    playerNickname: user.nickname,
    playerAvatar: user.avatar,
    type: postType,
    visibility: 'PUBLIC',
    title: user.nickname,
    description: text,
    mediaUrl: mediaUrl,
    createdAt: serverTimestamp(),
    likesCount: 0,
    commentsCount: 0,
  };

  const docRef = await addDoc(collection(db, 'posts'), postData);
  
  // Return the created post, formatted for the UI
  return {
    id: docRef.id,
    ...postData,
    createdAt: new Date().toISOString(), // Mock timestamp for immediate UI update
  } as unknown as Activity; 
};

export const fetchFeed = async () => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
  const querySnapshot = await getDocs(q);
  
  const posts: Activity[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    posts.push({
      id: docSnap.id,
      playerId: data.playerId, // Might need to map to user.id if different, but let's keep it simple
      playerNickname: data.playerNickname,
      playerAvatar: data.playerAvatar,
      type: data.type || 'TEXT',
      visibility: data.visibility || 'PUBLIC',
      title: data.title || data.playerNickname,
      description: data.description || '',
      mediaUrl: data.mediaUrl,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      likesCount: data.likesCount || 0,
      commentsCount: data.commentsCount || 0,
    } as Activity);
  });
  
  return posts;
};

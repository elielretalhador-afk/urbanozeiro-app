import { db, functions } from '../lib/firebase';
import { collection, doc, getDoc, onSnapshot, query, getDocs, orderBy } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { VirtualWallet, Chest, CurrencyTransaction } from '../types';

export class EconomyService {
  static async getWallet(userId: string): Promise<VirtualWallet | null> {
    try {
      const docRef = doc(db, 'users', userId, 'wallet', 'main');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as VirtualWallet;
      }
      return null;
    } catch (e) {
      console.error('Error fetching wallet:', e);
      return null;
    }
  }

  static subscribeToWallet(userId: string, callback: (wallet: VirtualWallet | null) => void) {
    const docRef = doc(db, 'users', userId, 'wallet', 'main');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as VirtualWallet);
      } else {
        callback(null);
      }
    });
  }
  
  static subscribeToTransactions(userId: string, callback: (transactions: CurrencyTransaction[]) => void) {
    const q = query(
      collection(db, 'users', userId, 'walletTransactions'),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const transactions = snap.docs.map((d) => d.data() as CurrencyTransaction);
      callback(transactions);
    });
  }

  static subscribeToChests(userId: string, callback: (chests: Chest[]) => void) {
    const q = query(
      collection(db, 'users', userId, 'chests'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const chests = snap.docs.map((d) => d.data() as Chest);
      callback(chests);
    });
  }

  static async openChest(chestId: string): Promise<{ success: boolean; reward?: any }> {
    try {
      const openChestFn = httpsCallable(functions, 'openChest');
      const result = await openChestFn({ chestId });
      return result.data as any;
    } catch (e) {
      console.error('Error opening chest:', e);
      return { success: false };
    }
  }
  
  static async debugGrantCoins(amount: number): Promise<{ success: boolean }> {
      try {
        const debugGrantFn = httpsCallable(functions, 'debugGrantCoins');
        const result = await debugGrantFn({ amount });
        return result.data as any;
      } catch (e) {
          return { success: false };
      }
  }
}

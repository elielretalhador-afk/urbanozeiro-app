import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Season, SeasonRankingEntry, UserProfile, Clan } from '../types';

export const SeasonService = {
  async getActiveSeason(): Promise<Season | null> {
    const q = query(
      collection(db, 'seasons'),
      where('status', '==', 'active'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const data = snap.docs[0].data();
    return { ...data, id: snap.docs[0].id } as Season;
  },

  async getTopPlayers(seasonId: string): Promise<SeasonRankingEntry[]> {
    const q = query(
      collection(db, 'seasonScores'),
      where('seasonId', '==', seasonId),
      orderBy('score', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as SeasonRankingEntry);
  },

  async getTopClans(seasonId: string): Promise<any[]> {
    const q = query(
      collection(db, 'seasonClanScores'),
      where('seasonId', '==', seasonId),
      orderBy('score', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  }
};

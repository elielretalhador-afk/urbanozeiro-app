import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type TelemetryCategory = 'APP' | 'AUTH' | 'GPS' | 'ACTIVITY' | 'SYNC' | 'ZONE' | 'ANTI_CHEAT' | 'SEASON' | 'ECONOMY' | 'SOCIAL' | 'NOTIFICATIONS' | 'ERROR';

export interface TelemetryEvent {
  eventName: string;
  category: TelemetryCategory;
  details?: Record<string, any>;
  error?: any;
}

export const TelemetryService = {
  async logEvent(event: TelemetryEvent) {
    try {
      if (!auth.currentUser) return; // Only log authenticated events for safety against spam

      const payload = {
        eventName: event.eventName,
        category: event.category,
        details: event.details || {},
        playerId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        appVersion: '1.0.0-beta',
      };

      if (event.error) {
        payload.details.errorMessage = event.error?.message || String(event.error);
        payload.details.errorCode = event.error?.code;
      }

      // Fire and forget
      addDoc(collection(db, 'telemetry'), payload).catch(() => {
        // Silently ignore telemetry failures so we don't break gameplay
      });
    } catch (e) {
      // Silently ignore
    }
  }
};

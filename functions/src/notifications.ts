import * as admin from 'firebase-admin';

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  dataPayload?: any
) {
  try {
    const devicesSnap = await admin.firestore().collection('users').doc(userId).collection('devices').where('enabled', '==', true).get();
    
    if (devicesSnap.empty) return;

    const tokens: string[] = [];
    const tokensToDocMap = new Map<string, string>();

    devicesSnap.forEach(doc => {
      const data = doc.data();
      if (data.pushToken) {
        tokens.push(data.pushToken);
        tokensToDocMap.set(data.pushToken, doc.id);
      }
    });

    if (tokens.length === 0) return;

    // Convert dataPayload values to strings as FCM data only accepts string values
    const cleanData: any = {};
    if (dataPayload) {
      for (const [key, value] of Object.entries(dataPayload)) {
        if (value !== undefined && value !== null) {
            cleanData[key] = String(value);
        }
      }
    }

    const message = {
      notification: {
        title,
        body
      },
      data: cleanData,
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    if (response.failureCount > 0) {
      const promises: any[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const failedToken = tokens[idx];
          const docId = tokensToDocMap.get(failedToken);
          if (docId) {
             const error = resp.error;
             if (error?.code === 'messaging/invalid-registration-token' ||
                 error?.code === 'messaging/registration-token-not-registered') {
                promises.push(
                  admin.firestore().collection('users').doc(userId).collection('devices').doc(docId).update({ enabled: false })
                );
             }
          }
        }
      });
      await Promise.all(promises);
    }
  } catch (e) {
    console.error('Error sending push notification', e);
  }
}

export async function checkPreferencesAndSendPush(
  userId: string,
  category: string,
  title: string,
  body: string,
  dataPayload?: any
) {
  try {
    const prefSnap = await admin.firestore().collection('users').doc(userId).collection('notificationPrefs').doc('main').get();
    let prefs: any = {};
    if (prefSnap.exists) {
      prefs = prefSnap.data();
    } else {
      prefs = {
        enablePushNotifications: true,
        notifyZoneConquest: true,
        notifyDirectChallenges: true,
        notifyAchievements: true,
        notifyEvents: true,
        notifyMissions: true,
        notifySocialActivities: true,
      };
    }

    if (prefs.enablePushNotifications === false) return;
    if (prefs[category] === false) return;

    await sendPushNotification(userId, title, body, dataPayload);
  } catch (e) {
    console.error('Error checking preferences for push', e);
  }
}

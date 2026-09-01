const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./firebase-applet-config.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function run() {
  console.log("--- ZONES ---");
  const zones = await db.collection('zones').get();
  zones.forEach(z => {
    console.log(z.id, z.data().shape, z.data().name);
  });

  console.log("--- SEGMENTS ---");
  const segments = await db.collection('segments').get();
  segments.forEach(s => {
    console.log(s.id, s.data().name, "bestRecord:", s.data().bestRecord);
  });
}
run();

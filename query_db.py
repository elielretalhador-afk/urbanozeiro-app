import firebase_admin
from firebase_admin import credentials, firestore
import json

with open("firebase-applet-config.json") as f:
    config = json.load(f)

cred = credentials.Certificate(config)
firebase_admin.initialize_app(cred)

db = firestore.client()

print("--- ZONES ---")
zones = db.collection('zones').get()
for z in zones:
    print(z.id, z.to_dict().get('shape'), z.to_dict().get('name'))

print("--- SEGMENTS ---")
segments = db.collection('segments').get()
for s in segments:
    print(s.id, s.to_dict().get('name'), "bestRecord:", s.to_dict().get('bestRecord'))


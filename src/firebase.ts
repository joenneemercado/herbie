import * as admin from 'firebase-admin';
const serviceAccount = JSON.parse(process.env.FIREBASE_JSON);
// console.log('Initializing Firebase Admin SDK...');
// console.log('Storage Bucket:', process.env.FIREBASE_BUCKET);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_BUCKET,
});

export const bucket = admin.storage().bucket();

import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { config } from './env';

let firebaseAdminApp = getApps()[0];
if (!firebaseAdminApp) {
  const serviceAccountJson = config.firebase.serviceAccountJson;
  const credential = serviceAccountJson
    ? cert(JSON.parse(serviceAccountJson))
    : process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? applicationDefault()
      : undefined;

  firebaseAdminApp = initializeApp({
    projectId: config.firebase.projectId,
    ...(credential ? { credential } : {}),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'lumio-e3c95.firebasestorage.app',
  });
}

export const firebaseAdminAuth = getAuth(firebaseAdminApp);
export const firebaseAdminFirestore = getFirestore(firebaseAdminApp);
export const firebaseAdminStorage = getStorage(firebaseAdminApp);
export const hasFirebaseAdminCredentials = Boolean(
  config.firebase.serviceAccountJson || process.env.GOOGLE_APPLICATION_CREDENTIALS,
);

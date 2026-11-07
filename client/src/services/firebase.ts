import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { config } from '../config/env';

const firebaseConfig = config.firebase;
export const firebaseApp: FirebaseApp | null = firebaseConfig.isConfigured
  ? (getApps().length ? getApp() : initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      databaseURL: firebaseConfig.databaseURL || undefined,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
      measurementId: firebaseConfig.measurementId,
    }))
  : null;

export const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;

export async function saveFirebaseUserProfile(profile: {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
}): Promise<void> {
  if (!firebaseApp) throw new Error('Firebase is not configured.');
  const { doc, getFirestore, serverTimestamp, setDoc } = await import('firebase/firestore');
  const firestore = getFirestore(firebaseApp);
  await setDoc(doc(firestore, 'users', profile.uid), {
    name: profile.name,
    email: profile.email,
    ...(profile.avatar ? { avatar: profile.avatar } : {}),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function uploadFirebaseAvatar(uid: string, file: File): Promise<string> {
  if (!firebaseApp || !firebaseConfig.storageBucket) throw new Error('Firebase Storage is not configured.');
  const { getDownloadURL, getStorage, ref, uploadBytes } = await import('firebase/storage');
  const firebaseStorage = getStorage(firebaseApp);
  if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
    throw new Error('Choose an image smaller than 5 MB.');
  }
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const avatarRef = ref(firebaseStorage, `users/${uid}/avatars/profile.${extension}`);
  await uploadBytes(avatarRef, file, { contentType: file.type });
  return getDownloadURL(avatarRef);
}

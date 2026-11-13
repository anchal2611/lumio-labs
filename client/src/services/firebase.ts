import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore, collection, query, where, onSnapshot, orderBy, limit, Unsubscribe } from 'firebase/firestore';
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
export const firebaseDb: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;

/**
 * Subscribe to real-time notifications in Firebase Firestore for a specific user
 */
export function subscribeToUserNotifications(
  userId: string,
  onNotificationAdded: (notification: any) => void
): Unsubscribe | null {
  if (!firebaseDb || !userId) return null;
  try {
    const q = query(
      collection(firebaseDb, 'notifications'),
      where('userId', '==', userId),
      limit(25)
    );
    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          onNotificationAdded(change.doc.data());
        }
      });
    }, (err) => {
      console.warn('Firebase Firestore notifications snapshot notice:', err.message);
    });
  } catch (err: any) {
    console.warn('Could not attach Firestore notifications listener:', err.message);
    return null;
  }
}

/**
 * Subscribe to real-time classes created in Firebase Firestore
 */
export function subscribeToRealtimeClasses(
  onClassAdded: (classData: any) => void
): Unsubscribe | null {
  if (!firebaseDb) return null;
  try {
    const q = query(collection(firebaseDb, 'classes'), limit(20));
    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          onClassAdded(change.doc.data());
        }
      });
    }, (err) => {
      console.warn('Firebase Firestore classes snapshot notice:', err.message);
    });
  } catch (err: any) {
    console.warn('Could not attach Firestore classes listener:', err.message);
    return null;
  }
}

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

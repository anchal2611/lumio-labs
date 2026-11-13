import { firebaseAdminFirestore, hasFirebaseAdminCredentials } from '../config/firebaseAdmin';

export { firebaseAdminFirestore };

/**
 * Synchronize a notification to Firebase Firestore
 */
export async function syncNotificationToFirestore(notif: {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  read_at?: string | null;
  created_at?: string;
}): Promise<void> {
  if (!hasFirebaseAdminCredentials || !firebaseAdminFirestore) return;
  try {
    const docData = {
      id: notif.id,
      userId: notif.userId,
      type: notif.type,
      title: notif.title,
      body: notif.body,
      link: notif.link || null,
      read_at: notif.read_at || null,
      created_at: notif.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Root notifications collection
    await firebaseAdminFirestore.collection('notifications').doc(notif.id).set(docData, { merge: true });

    // 2. User specific subcollection: users/{userId}/notifications/{id}
    await firebaseAdminFirestore
      .collection('users')
      .doc(notif.userId)
      .collection('notifications')
      .doc(notif.id)
      .set(docData, { merge: true });

    console.log(`🔥 [Firebase] Synced notification ${notif.id} for user ${notif.userId} to Firestore`);
  } catch (err: any) {
    console.error('⚠️ [Firebase] Failed to sync notification to Firestore:', err.message);
  }
}

/**
 * Synchronize a newly created class to Firebase Firestore
 */
export async function syncClassToFirestore(cls: {
  id: string;
  name: string;
  subject: string;
  description?: string | null;
  join_code: string;
  teacher_id: string;
  teacher_name?: string;
  institute_id?: string | null;
  banner_color?: string;
  created_at?: string;
}): Promise<void> {
  if (!hasFirebaseAdminCredentials || !firebaseAdminFirestore) return;
  try {
    const classData = {
      id: cls.id,
      name: cls.name,
      subject: cls.subject,
      description: cls.description || null,
      join_code: cls.join_code,
      teacher_id: cls.teacher_id,
      teacher_name: cls.teacher_name || 'Instructor',
      institute_id: cls.institute_id || null,
      banner_color: cls.banner_color || '#2563EB',
      created_at: cls.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await firebaseAdminFirestore.collection('classes').doc(cls.id).set(classData, { merge: true });
    console.log(`🔥 [Firebase] Synced class "${cls.name}" (${cls.id}) to Firestore`);
  } catch (err: any) {
    console.error('⚠️ [Firebase] Failed to sync class to Firestore:', err.message);
  }
}

/**
 * Synchronize collaboration permission event to Firebase Firestore
 */
export async function syncCollabPermissionToFirestore(event: {
  roomId: string;
  roomName?: string;
  userId: string;
  userName?: string;
  canEdit: boolean;
  grantedBy: string;
  timestamp?: string;
}): Promise<void> {
  if (!hasFirebaseAdminCredentials || !firebaseAdminFirestore) return;
  try {
    const eventId = `perm_${Date.now()}_${event.userId.slice(0, 8)}`;
    await firebaseAdminFirestore.collection('collab_permissions').doc(eventId).set({
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    }, { merge: true });
    console.log(`🔥 [Firebase] Synced collab permission for ${event.userId} (canEdit: ${event.canEdit}) to Firestore`);
  } catch (err: any) {
    console.error('⚠️ [Firebase] Failed to sync collab permission to Firestore:', err.message);
  }
}

/**
 * Synchronize an assignment to Firebase Firestore
 */
export async function syncAssignmentToFirestore(asg: {
  id: string;
  class_id: string;
  lab_module_id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  max_marks: number;
  created_at?: string;
}): Promise<void> {
  if (!hasFirebaseAdminCredentials || !firebaseAdminFirestore) return;
  try {
    await firebaseAdminFirestore.collection('assignments').doc(asg.id).set({
      ...asg,
      created_at: asg.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { merge: true });
    console.log(`🔥 [Firebase] Synced assignment "${asg.title}" to Firestore`);
  } catch (err: any) {
    console.error('⚠️ [Firebase] Failed to sync assignment to Firestore:', err.message);
  }
}

/**
 * Synchronize an assignment submission / grading to Firebase Firestore
 */
export async function syncSubmissionToFirestore(sub: {
  id: string;
  assignment_id: string;
  student_id: string;
  status: string;
  marks?: number | null;
  feedback?: string | null;
  submitted_at?: string | null;
  graded_at?: string | null;
}): Promise<void> {
  if (!hasFirebaseAdminCredentials || !firebaseAdminFirestore) return;
  try {
    await firebaseAdminFirestore.collection('submissions').doc(sub.id).set({
      ...sub,
      updated_at: new Date().toISOString(),
    }, { merge: true });
    console.log(`🔥 [Firebase] Synced submission ${sub.id} (status: ${sub.status}) to Firestore`);
  } catch (err: any) {
    console.error('⚠️ [Firebase] Failed to sync submission to Firestore:', err.message);
  }
}

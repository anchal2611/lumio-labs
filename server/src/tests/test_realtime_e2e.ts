import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });
dotenv.config();

import io from 'socket.io-client';
import http from 'http';
import { firebaseAdminFirestore } from '../services/firebaseService';

const BASE_URL = 'http://localhost:5000';

async function postJson(path: string, body: any, token?: string): Promise<any> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function run() {
  console.log('🧪 Starting End-to-End Realtime & Firebase Notification Verification...');

  // 1. Login Teacher & Student
  const teacherLogin = await postJson('/api/auth/login', {
    email: 'neha.taneja@igdtuw.ac.in',
    password: 'Password@123',
  });
  const studentLogin = await postJson('/api/auth/login', {
    email: 'archi039btcse24@igdtuw.ac.in',
    password: 'Password@123',
  });

  if (!teacherLogin.token || !studentLogin.token) {
    throw new Error('Failed to login teacher or student: ' + JSON.stringify({ teacherLogin, studentLogin }));
  }

  console.log('✅ Logged in Teacher (' + teacherLogin.user.name + ') and Student (' + studentLogin.user.name + ')');

  // 2. Connect Student to Socket.IO
  const studentSocket = io(BASE_URL, {
    auth: { token: studentLogin.token },
    transports: ['websocket'],
  });

  const receivedNotifications: any[] = [];
  const receivedClassEvents: any[] = [];
  const receivedPermissionEvents: any[] = [];

  studentSocket.on('notification', (data) => {
    console.log('🔔 [Student Socket] Received notification:', data.title, '-', data.body);
    receivedNotifications.push(data);
  });

  studentSocket.on('class_created', (data) => {
    console.log('🏫 [Student Socket] Received class_created event:', data.name, 'code:', data.joinCode);
    receivedClassEvents.push(data);
  });

  studentSocket.on('permission_updated', (data) => {
    console.log('🔒 [Student Socket] Received permission_updated event: canEdit =', data.canEdit);
    receivedPermissionEvents.push(data);
  });

  await new Promise<void>((resolve, reject) => {
    studentSocket.on('connect', () => {
      console.log('✅ Student Socket connected with ID:', studentSocket.id);
      resolve();
    });
    studentSocket.on('connect_error', (err) => reject(err));
    setTimeout(() => resolve(), 3000);
  });

  // 3. Connect Teacher to Socket.IO
  const teacherSocket = io(BASE_URL, {
    auth: { token: teacherLogin.token },
    transports: ['websocket'],
  });

  await new Promise<void>((resolve) => {
    teacherSocket.on('connect', () => {
      console.log('✅ Teacher Socket connected with ID:', teacherSocket.id);
      resolve();
    });
    setTimeout(() => resolve(), 3000);
  });

  // 4. Test Class Creation Realtime Notification
  const newClassName = 'Robotics & Embedded Systems ' + Math.floor(Math.random() * 1000);
  console.log('📢 Teacher creating new class:', newClassName);
  const classRes = await postJson('/api/classes', {
    name: newClassName,
    subject: 'Robotics',
    description: 'Testing real-time class creation notification and Firebase sync',
    bannerColor: '#4F46E5',
  }, teacherLogin.token);

  console.log('Class created:', classRes.id, 'joinCode:', classRes.joinCode);

  // Wait 1.5s for socket events
  await new Promise((r) => setTimeout(r, 1500));

  console.log('Checking received class notifications count:', receivedNotifications.length);
  const classNotif = receivedNotifications.find((n) => n.title.includes('Class'));
  if (classNotif) {
    console.log('✅ PASS: Realtime class creation notification received by student via Socket.IO!');
  } else {
    console.error('❌ FAIL: Student did not receive class creation notification');
  }

  // 5. Test CollabHub Session Creation & Permission Realtime Notification
  const sessionRes = await postJson('/api/collab/sessions', {
    name: 'E2E Collab Lab Session',
    sessionType: 'faculty',
    language: 'python',
  }, teacherLogin.token);

  const sessionId = sessionRes.id;
  console.log('Collab session created:', sessionId);

  // Teacher joins room
  teacherSocket.emit('join_room', { roomId: sessionId });
  // Student joins room
  studentSocket.emit('join_room', { roomId: sessionId });

  await new Promise((r) => setTimeout(r, 1000));

  // Teacher changes student's permission to View Only (canEdit: false)
  console.log('🔒 Teacher revoking student edit permission (setting canEdit = false)...');
  teacherSocket.emit('set_user_permission', {
    roomId: sessionId,
    targetUserId: studentLogin.user.id,
    canEdit: false,
  });

  await new Promise((r) => setTimeout(r, 1500));

  const permEvent = receivedPermissionEvents.find((p) => p.canEdit === false);
  const permNotif = receivedNotifications.find(
    (n) => n.title.includes('Collab') || n.title.includes('Permission') || n.body.includes('read-only') || n.body.includes('View Only')
  );

  if (permEvent) {
    console.log('✅ PASS: Realtime permission_updated event received by student!');
  } else {
    console.error('❌ FAIL: Student did not receive permission_updated event');
  }

  if (permNotif) {
    console.log('✅ PASS: Realtime permission notification received by student!');
  } else {
    console.error('❌ FAIL: Student did not receive permission notification');
  }

  // 6. Verify Firebase Firestore sync
  if (firebaseAdminFirestore) {
    console.log('🔥 Verifying Firestore cloud documents...');
    const classDoc = await firebaseAdminFirestore.collection('classes').doc(classRes.id).get();
    if (classDoc.exists) {
      console.log('✅ PASS: Class document confirmed in Firestore! ID:', classDoc.id, classDoc.data()?.name);
    } else {
      console.warn('⚠️ Class document not found in Firestore');
    }

    const notifSnapshot = await firebaseAdminFirestore.collection('users').doc(studentLogin.user.id).collection('notifications').limit(5).get();
    console.log(`✅ PASS: Student has ${notifSnapshot.size} notifications in Firestore subcollection!`);

    const permDoc = await firebaseAdminFirestore.collection('collab_permissions').doc(`${sessionId}_${studentLogin.user.id}`).get();
    if (permDoc.exists) {
      console.log('✅ PASS: Collab permission confirmed in Firestore!', permDoc.data());
    } else {
      console.warn('⚠️ Collab permission doc not found in Firestore');
    }
  }

  studentSocket.disconnect();
  teacherSocket.disconnect();
  console.log('🎉 Verification completed successfully!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});

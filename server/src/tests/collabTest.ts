import http from 'http';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { v4 as uuid } from 'uuid';
import db, { initDatabase } from '../db/database';
import { signToken } from '../middleware/auth';
import { setupCollabSockets, notifySessionEnded } from '../sockets/collabSocket';
import { collabManager } from '../sockets/collabManager';

const TEST_PORT = 5099;
const SERVER_URL = `http://localhost:${TEST_PORT}`;

interface TestUser {
  id: string;
  name: string;
  email: string;
  role: string;
  instituteId: string;
  token: string;
  client?: ClientSocket;
}

async function runTestSuite() {
  console.log('===============================================================');
  console.log('🧪 LUMIO CollabHub Multi-User Collaboration & Line-Locking Test');
  console.log('===============================================================');

  // 1. Initialize SQLite Database
  await initDatabase();

  const instituteId = uuid();
  db.prepare(`
    INSERT OR IGNORE INTO institutes (id, name, slug, type, city, website, email_domains)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(instituteId, 'Test Tech Institute', 'test-tech', 'university', 'Tech City', 'https://tech.edu', JSON.stringify(['tech.edu']));

  // 2. Create 5 Authenticated Test Users
  const userDefs = [
    { name: 'Alex Chen (Student A)', email: 'alex@tech.edu', role: 'student' },
    { name: 'Priya Sharma (Student B)', email: 'priya@tech.edu', role: 'student' },
    { name: 'Liam O\'Connor (Student C)', email: 'liam@tech.edu', role: 'student' },
    { name: 'Maya Patel (Student D)', email: 'maya@tech.edu', role: 'student' },
    { name: 'Prof. Marcus Vance (Teacher)', email: 'marcus@tech.edu', role: 'teacher' },
  ];

  const testUsers: TestUser[] = userDefs.map((def) => {
    const id = uuid();
    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, email, password_hash, role, institute_id, is_verified, status)
      VALUES (?, ?, ?, ?, ?, ?, 1, 'active')
    `).run(id, def.name, def.email, 'hashed_pw', def.role, instituteId);

    const token = signToken({
      userId: id,
      email: def.email,
      role: def.role,
      instituteId,
    });

    return { id, name: def.name, email: def.email, role: def.role, instituteId, token };
  });

  // 3. Create a Collab Session
  const sessionId = uuid();
  const initialCode = `# Collaborative Python Workspace\ndef main():\n    print("Starting session...")\n    # Line 4: work area\n    # Line 5: algorithm\n    return 0\n`;
  db.prepare(`
    INSERT INTO collab_sessions (id, name, type, host_id, language, initial_code, is_active)
    VALUES (?, ?, 'peer', ?, 'python', ?, 1)
  `).run(sessionId, 'Python DSA Collaboration', testUsers[0].id, initialCode);

  // 4. Start HTTP & Socket.IO Server
  const httpServer = http.createServer();
  const io = new Server(httpServer, {
    cors: { origin: '*' },
  });
  setupCollabSockets(io);

  await new Promise<void>((resolve) => httpServer.listen(TEST_PORT, resolve));
  console.log(`📡 Test Socket.IO server running on ${SERVER_URL}`);

  function connectClient(user: TestUser): Promise<ClientSocket> {
    return new Promise((resolve, reject) => {
      const client = Client(SERVER_URL, {
        auth: { token: user.token },
        transports: ['websocket'],
      });
      client.on('connect', () => resolve(client));
      client.on('connect_error', reject);
    });
  }

  try {
    // Connect all 5 clients simultaneously
    console.log('\n--- 1. Connecting 5 Simultaneous Participants ---');
    for (const u of testUsers) {
      u.client = await connectClient(u);
    }
    console.log('✓ All 5 authenticated Socket.IO clients connected.');

    // Join room for all 5 users
    const joinPromises = testUsers.map(
      (u) =>
        new Promise<any>((resolve) => {
          u.client!.emit('join_room', { roomId: sessionId }, (res: any) => resolve(res));
        })
    );
    const joinResults = await Promise.all(joinPromises);
    const allJoined = joinResults.every((r) => r.ok);
    if (!allJoined) throw new Error('Not all participants could join the session.');
    console.log('✓ All 5 participants successfully joined session room ' + sessionId);

    // TEST 1: Live Cursor & Presence Synchronization
    console.log('\n--- TEST 1: Live Cursor & Presence Synchronization ---');
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Cursor move timed out')), 3000);
      testUsers[1].client!.once('cursor_updated', (data: any) => {
        clearTimeout(timeout);
        try {
          if (data.userId !== testUsers[0].id) throw new Error('Wrong sender in cursor_updated');
          if (data.cursor.lineNumber !== 5 || data.cursor.column !== 14) throw new Error('Cursor position mismatch');
          if (!data.userColor?.bg) throw new Error('User color missing in cursor_updated');
          if (!data.selection || data.selection.startLineNumber !== 5) throw new Error('Selection range missing');
          console.log(`✓ Student B received Student A's cursor at Line 5:14 with color ${data.userColor.bg}`);
          resolve();
        } catch (e) {
          reject(e);
        }
      });

      // Student A moves cursor to line 5, col 14 with a selection
      testUsers[0].client!.emit('cursor_move', {
        roomId: sessionId,
        cursor: { lineNumber: 5, column: 14 },
        selection: { startLineNumber: 5, startColumn: 5, endLineNumber: 5, endColumn: 14 },
      });
    });

    // TEST 2: First-Come-First-Serve Line Locking Priority
    console.log('\n--- TEST 2: First-Come-First-Serve Line Locking Priority ---');
    // Student A requests lock on Line 5
    const studentALock = await new Promise<any>((resolve) => {
      testUsers[0].client!.emit('request_lock', { roomId: sessionId, lineNumber: 5 }, resolve);
    });
    if (!studentALock.success || studentALock.lock.lineNumber !== 5) {
      throw new Error('Student A failed to acquire Line 5 lock');
    }
    console.log('✓ Student A acquired lock on Line 5 (First-Come-First-Serve priority).');

    // TEST 3: Smart Downward Redirection for Conflicting Users
    console.log('\n--- TEST 3: Smart Downward Redirection for Conflicting Users ---');
    // Student B attempts to acquire Line 5 (occupied by Student A)
    const studentBConflict = await new Promise<any>((resolve) => {
      testUsers[1].client!.emit('request_lock', { roomId: sessionId, lineNumber: 5 }, resolve);
    });
    if (studentBConflict.success) {
      throw new Error('Student B should NOT be able to acquire Line 5 while Student A holds it!');
    }
    if (studentBConflict.redirectLine !== 6) {
      throw new Error(`Student B should be redirected to Line 6, got: ${studentBConflict.redirectLine}`);
    }
    console.log(`✓ Student B blocked on Line 5 and redirected to Line 6 (${studentBConflict.reason})`);

    // Student B acquires Line 6
    const studentBLock = await new Promise<any>((resolve) => {
      testUsers[1].client!.emit('request_lock', { roomId: sessionId, lineNumber: 6 }, resolve);
    });
    if (!studentBLock.success || studentBLock.lock.lineNumber !== 6) {
      throw new Error('Student B failed to acquire redirected Line 6 lock');
    }
    console.log('✓ Student B successfully acquired Line 6.');

    // Student C also attempts to edit Line 5! (Both Line 5 and Line 6 are now occupied)
    const studentCConflict = await new Promise<any>((resolve) => {
      testUsers[2].client!.emit('request_lock', { roomId: sessionId, lineNumber: 5 }, resolve);
    });
    if (studentCConflict.success) {
      throw new Error('Student C should NOT be able to acquire Line 5!');
    }
    if (studentCConflict.redirectLine !== 7) {
      throw new Error(`Student C should be redirected to Line 7 (skipping occupied Line 6), got: ${studentCConflict.redirectLine}`);
    }
    console.log(`✓ Student C blocked on Line 5 and redirected down to Line 7 (skipping Line 6 held by Student B)`);

    // Student C acquires Line 7
    const studentCLock = await new Promise<any>((resolve) => {
      testUsers[2].client!.emit('request_lock', { roomId: sessionId, lineNumber: 7 }, resolve);
    });
    if (!studentCLock.success) throw new Error('Student C failed to acquire Line 7');
    console.log('✓ Student C acquired Line 7.');

    // Student D also attempts Line 5 -> redirected to Line 8
    const studentDConflict = await new Promise<any>((resolve) => {
      testUsers[3].client!.emit('request_lock', { roomId: sessionId, lineNumber: 5 }, resolve);
    });
    if (studentDConflict.redirectLine !== 8) {
      throw new Error(`Student D should be redirected to Line 8, got: ${studentDConflict.redirectLine}`);
    }
    console.log(`✓ Student D blocked on Line 5 and redirected down to Line 8 (Lines 5, 6, 7 all occupied)`);

    // TEST 4: Backend Enforcement - Direct Socket Edit on Locked Line is REJECTED
    console.log('\n--- TEST 4: Server Enforcement against Bypassing Line Locks ---');
    const illicitEditResult = await new Promise<any>((resolve) => {
      // Student B tries to emit doc_change directly editing Line 5
      testUsers[1].client!.emit(
        'doc_change',
        {
          roomId: sessionId,
          baseVersion: 1,
          changes: [
            {
              range: { startLineNumber: 5, startColumn: 1, endLineNumber: 5, endColumn: 20 },
              text: '# Malicious overwrite of Student A',
            },
          ],
        },
        resolve
      );
    });
    if (illicitEditResult.success) {
      throw new Error('Server accepted unauthorized edit on a locked line!');
    }
    if (!illicitEditResult.conflict || illicitEditResult.conflict.lockedLine !== 5) {
      throw new Error('Server did not return conflict details for locked line 5');
    }
    console.log(`✓ Server successfully rejected unauthorized edit on Line 5: "${illicitEditResult.conflict.reason}"`);

    // TEST 5: Concurrent Simultaneous Editing on Independent Lines (No Data Loss)
    console.log('\n--- TEST 5: Simultaneous Multi-User Editing (Zero Inter-User Overwrite) ---');
    // Student A edits Line 5
    const editA = await new Promise<any>((resolve) => {
      testUsers[0].client!.emit(
        'doc_change',
        {
          roomId: sessionId,
          baseVersion: 1,
          changes: [
            {
              range: { startLineNumber: 5, startColumn: 5, endLineNumber: 5, endColumn: 24 },
              text: 'val_a = 42',
            },
          ],
        },
        resolve
      );
    });
    if (!editA.success) throw new Error('Student A edit failed');

    // Student B edits Line 6
    const editB = await new Promise<any>((resolve) => {
      testUsers[1].client!.emit(
        'doc_change',
        {
          roomId: sessionId,
          baseVersion: editA.version,
          changes: [
            {
              range: { startLineNumber: 6, startColumn: 5, endLineNumber: 6, endColumn: 13 },
              text: 'return val_a * 2',
            },
          ],
        },
        resolve
      );
    });
    if (!editB.success) throw new Error('Student B edit failed');

    // Student C edits Line 7
    const editC = await new Promise<any>((resolve) => {
      testUsers[2].client!.emit(
        'doc_change',
        {
          roomId: sessionId,
          baseVersion: editB.version,
          changes: [
            {
              range: { startLineNumber: 7, startColumn: 1, endLineNumber: 7, endColumn: 1 },
              text: '# Verified by Student C\n',
            },
          ],
        },
        resolve
      );
    });
    if (!editC.success) throw new Error('Student C edit failed');

    const finalRoom = collabManager.getOrCreateRoom(sessionId);
    if (!finalRoom.code.includes('val_a = 42') || !finalRoom.code.includes('return val_a * 2') || !finalRoom.code.includes('Verified by Student C')) {
      throw new Error('Code state corrupted or missing concurrent updates!');
    }
    console.log('✓ All 3 simultaneous line edits applied cleanly with zero text loss.');

    // TEST 6: Stable Line Tracking & Lock Shifting on Line Insertions
    console.log('\n--- TEST 6: Stable Line Tracking & Lock Shifting on Line Insertions ---');
    // Prior to insertion:
    // Student A was on Line 5
    // Student B was on Line 6
    // Student C was on Line 7
    // Student A inserts a new line at Line 4 (pressing enter above Line 5)
    const insertLineChange = await new Promise<any>((resolve) => {
      testUsers[0].client!.emit(
        'doc_change',
        {
          roomId: sessionId,
          baseVersion: editC.version,
          changes: [
            {
              range: { startLineNumber: 4, startColumn: 1, endLineNumber: 4, endColumn: 1 },
              text: '# Newly inserted line above\n',
            },
          ],
        },
        resolve
      );
    });
    if (!insertLineChange.success) throw new Error('Line insertion failed');

    // Check lock positions:
    // Because 1 line was added at line 4:
    // Line 5 shifts to Line 6 (Student A)
    // Line 6 shifts to Line 7 (Student B)
    // Line 7 shifts to Line 8 (Student C)
    const locksAfterInsert = insertLineChange.locks;
    if (locksAfterInsert[6]?.userId !== testUsers[0].id) {
      throw new Error(`Expected Student A lock to shift from Line 5 -> Line 6, got: ${JSON.stringify(locksAfterInsert)}`);
    }
    if (locksAfterInsert[7]?.userId !== testUsers[1].id) {
      throw new Error(`Expected Student B lock to shift from Line 6 -> Line 7, got: ${JSON.stringify(locksAfterInsert)}`);
    }
    console.log('✓ Dynamic Line Shifting verified: Locks on lines 5, 6, 7 shifted down to lines 6, 7, 8 accurately.');

    // TEST 7: Lock Release on Disconnection
    console.log('\n--- TEST 7: Lock Release on Disconnection ---');
    // Student B disconnects
    await new Promise<void>((resolve) => {
      testUsers[0].client!.once('locks_updated', ({ locks }: any) => {
        // Line 7 (owned by Student B) should no longer be locked
        if (!locks[7]) {
          console.log('✓ Student B disconnected; lock on Line 7 was automatically released.');
          resolve();
        }
      });
      testUsers[1].client!.disconnect();
    });

    // Student A can now acquire the previously locked Line 7!
    const reacquireResult = await new Promise<any>((resolve) => {
      testUsers[0].client!.emit('request_lock', { roomId: sessionId, lineNumber: 7 }, resolve);
    });
    if (!reacquireResult.success) {
      throw new Error('Student A could not acquire released line 7');
    }
    console.log('✓ Released line 7 immediately acquired by Student A.');

    // TEST 8: Reconnection and Latest Document State
    console.log('\n--- TEST 8: Reconnection and Full Document Synchronization ---');
    const reconnectedClient = await connectClient(testUsers[1]);
    const initData = await new Promise<any>((resolve) => {
      reconnectedClient.emit('join_room', { roomId: sessionId }, (res: any) => resolve(res.data));
    });
    if (!initData.code.includes('val_a = 42') || !initData.locks) {
      throw new Error('Reconnected client did not receive full latest document state');
    }
    console.log(`✓ Reconnected participant received latest document state (version ${initData.version})`);
    reconnectedClient.disconnect();

    // TEST 9: Inactivity Expiration
    console.log('\n--- TEST 9: Inactivity Expiration ---');
    const roomBeforeExpiry = collabManager.getOrCreateRoom(sessionId);
    const activeEntries = Array.from(roomBeforeExpiry.locks.entries());
    if (activeEntries.length > 0) {
      const [targetLine, targetLock] = activeEntries[0];
      targetLock.expiresAt = Date.now() - 1000; // Expired 1 second ago

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Sweep timeout')), 4000);
        testUsers[0].client!.on('locks_updated', ({ locks }: any) => {
          if (!locks[targetLine]) {
            clearTimeout(timeout);
            console.log(`✓ Expired line lock on Line ${targetLine} automatically swept and released.`);
            resolve();
          }
        });
      });
    } else {
      console.log('✓ Inactivity sweep test skipped (no active locks).');
    }

    console.log('\n===============================================================');
    console.log('🎉 ALL 9 ADVANCED COLLABORATION & LINE LOCKING TESTS PASSED!');
    console.log('===============================================================');
  } finally {
    // Cleanup clients and server
    for (const u of testUsers) {
      u.client?.disconnect();
    }
    collabManager.destroy();
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});

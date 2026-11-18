import { createHash, randomUUID } from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { firebaseAdminFirestore } from '../config/firebaseAdmin';

const manifestRef = firebaseAdminFirestore.collection('system_state').doc('sqlite_database');
const chunksRef = manifestRef.collection('chunks');
const CHUNK_BYTES = 512 * 1024;
const WRITES_PER_BATCH = 8;
const DELETES_PER_BATCH = 400;

function checksum(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export async function readSqliteSnapshot(): Promise<Buffer | null> {
  const manifest = await manifestRef.get();
  if (!manifest.exists) return null;

  const data = manifest.data() || {};
  const { snapshotId, chunkCount, byteLength, sha256 } = data;
  if (typeof snapshotId !== 'string' || !Number.isInteger(chunkCount) || chunkCount < 1 || !Number.isInteger(byteLength) || byteLength < 1 || typeof sha256 !== 'string') {
    throw new Error('The Firestore database snapshot manifest is invalid.');
  }

  const chunks = await chunksRef.where('snapshotId', '==', snapshotId).get();
  if (chunks.size !== chunkCount) throw new Error('The Firestore database snapshot is incomplete.');
  const ordered = chunks.docs
    .map((document) => ({ index: document.get('index'), data: document.get('data') }))
    .sort((left, right) => Number(left.index) - Number(right.index));

  const buffers: Buffer[] = [];
  for (let index = 0; index < ordered.length; index += 1) {
    if (ordered[index].index !== index || typeof ordered[index].data !== 'string') {
      throw new Error('The Firestore database snapshot contains a missing or invalid chunk.');
    }
    buffers.push(Buffer.from(ordered[index].data, 'base64'));
  }

  const snapshot = Buffer.concat(buffers);
  if (snapshot.length !== byteLength || checksum(snapshot) !== sha256) {
    throw new Error('The Firestore database snapshot failed its integrity check.');
  }
  return snapshot;
}

export async function writeSqliteSnapshot(bytes: Uint8Array): Promise<void> {
  const source = Buffer.from(bytes);
  const snapshotId = randomUUID();
  const chunkCount = Math.ceil(source.length / CHUNK_BYTES);

  for (let first = 0; first < chunkCount; first += WRITES_PER_BATCH) {
    const batch = firebaseAdminFirestore.batch();
    const last = Math.min(first + WRITES_PER_BATCH, chunkCount);
    for (let index = first; index < last; index += 1) {
      const start = index * CHUNK_BYTES;
      const data = source.subarray(start, Math.min(start + CHUNK_BYTES, source.length)).toString('base64');
      batch.set(chunksRef.doc(`${snapshotId}_${String(index).padStart(6, '0')}`), { snapshotId, index, data });
    }
    await batch.commit();
  }

  const previous = await manifestRef.get();
  await manifestRef.set({
    snapshotId,
    chunkCount,
    byteLength: source.length,
    sha256: checksum(source),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const oldChunks = await chunksRef.where('snapshotId', '!=', snapshotId).get();
  for (let offset = 0; offset < oldChunks.docs.length; offset += DELETES_PER_BATCH) {
    const batch = firebaseAdminFirestore.batch();
    oldChunks.docs.slice(offset, offset + DELETES_PER_BATCH).forEach((document) => batch.delete(document.ref));
    await batch.commit();
  }

  if (previous.exists && previous.get('snapshotId') !== snapshotId) {
    console.info(`Firestore database snapshot updated (${source.length} bytes).`);
  }
}

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { config } from './config/env';
import { apiRouter } from './routes/api';
import { setupCollabSockets } from './sockets/collabSocket';
import { initDatabase } from './db/database';
import { seedDatabase } from './db/seed';

const app = express();
const server = http.createServer(app);
const corsAllowlist = config.corsOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);

function isOriginAllowed(origin: string | undefined, host: string | undefined): boolean {
  if (!origin || corsAllowlist.includes('*') || corsAllowlist.includes(origin)) return true;
  try { return new URL(origin).host === host; } catch { return false; }
}

// Socket.IO uses the same origin policy as the HTTP API. Cross-origin clients
// must be added explicitly through CORS_ORIGIN.
const io = new Server(server, {
  cors: { origin: corsAllowlist.includes('*') ? '*' : (corsAllowlist.length ? corsAllowlist : false), methods: ['GET', 'POST'], credentials: false },
  allowRequest: (req, callback) => callback(null, isOriginAllowed(req.headers.origin, req.headers.host)),
});

// Security & parsing middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: corsAllowlist.includes('*') ? '*' : (corsAllowlist.length ? corsAllowlist : false), credentials: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// REST API
app.use('/api', apiRouter);

// Real-Time Collaboration Sockets
setupCollabSockets(io);

// Serve React client — works whether we start from repo root or server/
const clientDistCandidates = [
  path.resolve(process.cwd(), 'client/dist'),       // started from repo root
  path.resolve(process.cwd(), '../client/dist'),    // started from server/
  path.resolve(__dirname, '../../client/dist'),     // relative to dist/
];
const clientDistPath = clientDistCandidates.find((p) => fs.existsSync(p));

if (clientDistPath) {
  console.log(`📦 Serving client from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  // SPA fallback — all non-API routes → index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.warn('⚠️  Client dist not found — API-only mode');
  app.get('/', (_req, res) => {
    res.json({
      platform: 'LUMIO — Collaborative Virtual Laboratory Platform',
      tagline: 'Virtual Labs. Limitless Learning.',
      status: 'Operational — API mode (no frontend)',
      version: '2.0.0',
      note: 'Run "npm run build" in the client directory to serve the frontend.',
    });
  });
}

// Initialize database → seed → listen
async function start() {
  try {
    await initDatabase();
    if (config.nodeEnv !== 'production' || process.env.SEED_DEMO_DATA === 'true') {
      await seedDatabase();
    } else {
      console.log('Demo seed data is disabled in production.');
    }
  } catch (err) {
    console.error('Database init failed:', err);
    process.exit(1);
  }

  server.listen(config.port, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 LUMIO Platform Server v2.0 running on port ${config.port}`);
    console.log(`⚡ Real-Time Collaboration Socket.IO Engine Initialized`);
    console.log(`🗄️  SQLite database ready`);
    console.log(`=======================================================`);
  });
}

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

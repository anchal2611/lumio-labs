import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { apiRouter } from './routes/api.js';
import { setupCollabSockets } from './sockets/collabSocket.js';
import { initDatabase } from './db/database.js';
import { seedDatabase } from './db/seed.js';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount REST API
app.use('/api', apiRouter);

// Setup Real-Time Collaboration Sockets
setupCollabSockets(io);

import path from 'path';
import fs from 'fs';

// Resolve client dist path across root and server directories
const clientDistCandidates = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
];
const clientDistPath = clientDistCandidates.find((p) => fs.existsSync(p));

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      platform: 'LUMIO — Collaborative Virtual Laboratory Platform',
      tagline: 'Virtual Labs. Limitless Learning.',
      status: 'Operational',
      version: '2.0.0',
    });
  });
}

// Initialize database and seed, then start server
async function start() {
  initDatabase();
  await seedDatabase();

  server.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 LUMIO Platform Server v2.0 running on port ${config.port}`);
    console.log(`⚡ Real-Time Collaboration Socket.IO Engine Initialized`);
    console.log(`🗄️  SQLite database ready`);
    console.log(`=======================================================`);
  });
}

start().catch(console.error);

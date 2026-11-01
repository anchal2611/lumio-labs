import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { apiRouter } from './routes/api.js';
import { setupCollabSockets } from './sockets/collabSocket.js';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin) or any origin in production
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
  path.resolve(__dirname, '../../client/dist'),
];
const clientDistPath = clientDistCandidates.find((p) => fs.existsSync(p));

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root Status when running as standalone API
  app.get('/', (_req, res) => {
    res.json({
      platform: 'LUMIO — Collaborative Virtual Laboratory Platform',
      tagline: 'Virtual Labs. Limitless Learning.',
      status: 'Operational',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        execute: '/api/execute',
        sockets: 'ws://' + _req.headers.host,
      },
    });
  });
}

// Start Server
server.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 LUMIO Platform Server running on port ${config.port}`);
  console.log(`🌐 CORS Allowed Origin: ${config.corsOrigin}`);
  console.log(`⚡ Real-Time Collaboration Socket.IO Engine Initialized`);
  console.log(`=======================================================`);
});

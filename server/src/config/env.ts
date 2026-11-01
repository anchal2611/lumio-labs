import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  sessionSecret: process.env.SESSION_SECRET || 'lumio_secret_key_2026',
  logLevel: process.env.LOG_LEVEL || 'info',
  judge0: {
    provider: process.env.CODE_EXECUTION_PROVIDER || 'judge0',
    apiUrl: process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com',
    apiKey: process.env.JUDGE0_API_KEY || '',
    timeoutMs: parseInt(process.env.CODE_EXECUTION_TIMEOUT || '10000', 10),
    memoryLimitKb: parseInt(process.env.CODE_EXECUTION_MEMORY_LIMIT || '128000', 10),
  },
  collaboration: {
    provider: process.env.COLLABORATION_PROVIDER || 'socketio',
    serverUrl: process.env.COLLABORATION_SERVER_URL || 'http://localhost:5000',
    apiSecret: process.env.COLLABORATION_API_SECRET || 'collab_secret_key',
  },
};

import { Router } from 'express';
import { executeCodeHandler } from '../controllers/executionController.js';

export const apiRouter = Router();

// Code execution endpoint
apiRouter.post('/execute', executeCodeHandler);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'LUMIO Platform Backend API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

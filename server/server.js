/**
 * SomnoPulse AI - Production Express Server v2.0.0
 * Architecture: Linear / Stripe / Vercel Grade Craftsmanship
 */

import express from 'express';
import compression from 'compression';
import crypto from 'crypto';
import path from 'path';
import { Config } from './config.js';
import { configureSecurity } from './middleware/security.js';
import predictRouter from './routes/predict.js';
import analyticsRouter from './routes/analytics.js';
import clinicsRouter from './routes/clinics.js';
import healthRouter from './routes/health.js';
import historyRouter from './routes/history.js';

const app = express();
const PORT = Config.port;
const ROOT_DIR = Config.paths.root;

// Enable gzip/deflate compression for all text/json/static assets
app.use(compression({
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Body parsing with strict payload bounds
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply security headers, CORS, and rate limiting
const { apiLimiter } = configureSecurity(app);

// Request tracking with unique request correlation ID & latency timer
app.use((req, res, next) => {
  const reqId = req.headers['x-request-id'] || `req_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API ${reqId}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount API Routes with rate limiting
app.use('/api', apiLimiter);
app.use('/api/predict', predictRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/clinics', clinicsRouter);
app.use('/api/history', historyRouter);
app.use('/api/health', healthRouter);

// Backward-compatible alias for the legacy path
app.post('/predict_sleep_disorder', apiLimiter, (req, res, next) => {
  req.url = '/';
  predictRouter(req, res, next);
});

// Static file serving with cache-control headers
app.use(express.static(ROOT_DIR, {
  maxAge: '0',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
      // Revalidate HTML, CSS, and JS to ensure latest frontend updates are fetched immediately
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
}));

// Fallback to index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'Index.html'));
});

// 404 handler for API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      requestId: req.id,
      error: `Endpoint ${req.method} ${req.originalUrl} not found.`
    });
  }
  next();
});

// Global structured error handling middleware
app.use((err, req, res, next) => {
  console.error(`[SERVER ERROR ${req.id || 'N/A'}]`, err);
  res.status(err.status || 500).json({
    success: false,
    requestId: req.id,
    error: err.message || 'An unexpected internal server error occurred.'
  });
});

// Start listening if executed directly
let server = null;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  SomnoPulse AI Server v2.0.0 is live!`);
    console.log(`  Environment: ${Config.nodeEnv}`);
    console.log(`  Access URL: http://localhost:${PORT}`);
    console.log(`  Diagnostics API: http://localhost:${PORT}/api/predict`);
    console.log(`  History API: http://localhost:${PORT}/api/history`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });

  // Graceful shutdown management
  const shutdown = (signal) => {
    console.log(`\nReceived ${signal}. Gracefully terminating SomnoPulse AI server...`);
    if (server) {
      server.close(() => {
        console.log('Server HTTP connections closed.');
        process.exit(0);
      });
      // Force close after 5 seconds if connections hang
      setTimeout(() => {
        console.error('Forcefully terminating active connections after timeout.');
        process.exit(1);
      }, 5000);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

export default app;

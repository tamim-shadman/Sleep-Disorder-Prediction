/**
 * SomnoPulse AI - Health & System Telemetry Endpoint
 */

import { Router } from 'express';

const router = Router();
const startTime = Date.now();

router.get('/', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const mem = process.memoryUsage();

  res.json({
    status: 'healthy',
    platform: 'SomnoPulse AI - Clinical Intelligence Platform',
    version: '2.2.0',
    uptimeSeconds,
    uptimeFormatted: `${Math.floor(uptimeSeconds / 60)}m ${uptimeSeconds % 60}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    memoryUsageMB: {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024)
    }
  });
});

export default router;

/**
 * SomnoPulse AI - Security Middleware & Header Configuration
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Config } from '../config.js';

export function configureSecurity(app) {
  // Helmet configuration with policy accommodating local assets & CDNs
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://cdn.jsdelivr.net',
            'https://cdnjs.cloudflare.com',
            'https://unpkg.com'
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
            'https://cdn.jsdelivr.net'
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
          connectSrc: ["'self'", 'https:', 'http:'],
          frameSrc: ["'self'", 'https://www.google.com']
        }
      },
      crossOriginEmbedderPolicy: false
    })
  );

  // CORS configuration wired to Config
  app.use(
    cors({
      origin: Config.corsOrigin,
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
    })
  );

  // Rate limiter for API routes wired to Config
  const apiLimiter = rateLimit({
    windowMs: Config.rateLimit.windowMs,
    max: Config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Rate limit exceeded. Please wait a few moments before requesting another clinical assessment.'
    }
  });

  return { apiLimiter };
}

/**
 * SomnoPulse AI - Centralized Environment & Server Configuration
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

export const Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'production',
  isDev: (process.env.NODE_ENV || 'production') === 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins default
    max: parseInt(process.env.RATE_LIMIT_MAX || '250', 10)
  },
  paths: {
    root: ROOT_DIR,
    data: path.join(__dirname, 'data'),
    assessmentsFile: path.join(__dirname, 'data', 'assessments.json')
  },
  app: {
    name: 'SomnoPulse AI',
    version: '2.0.0',
    description: 'Clinical-Grade Sleep Disorder Prediction & Sleep Health Intelligence Platform'
  }
};

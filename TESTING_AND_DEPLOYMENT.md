# Testing & Deployment Guide — SomnoPulse AI™ v2.0.0

## 1. Automated Testing Strategy

The test suite validates three core layers:
1. **Clinical Machine Learning Inference**: Validates probability calculations, log-odds modifiers, Mean Arterial Pressure calculations, and class assignments against the Kaggle Sleep Health and Lifestyle dataset distribution.
2. **Physiological Boundaries & Input Validation**: Validates Zod schema boundaries, blood pressure format and inverted systolic/diastolic rejection, numerical ranges, and string sanitization.
3. **Data Layer Persistence & Pagination**: Validates database inserts, unique ID generation, paginated retrieval, filtering, single-record lookup, and record deletion.

### Executing the Test Suite
```bash
# Run all automated tests
npm test

# Run syntax check and test suite
npm run check
```

---

## 2. Environment Configuration

Copy `.env.example` to create your local `.env`:
```bash
# Server Port (default: 3000)
PORT=3000

# Environment Mode (production | development)
NODE_ENV=production

# CORS Allowed Origin (default: * for local development)
CORS_ORIGIN=*

# Rate Limiter Window & Max Requests
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=250
```

---

## 3. Local Deployment & Execution

### Option A: Full-Stack Node.js Server (Recommended)
```bash
# 1. Install production dependencies
npm install

# 2. Start the production server
npm start

# 3. Access the web interface
# http://localhost:3000
```

### Option B: Zero-Install Static / Offline Mode
Because SomnoPulse AI contains a full mirrored **Client-Side Inference Engine** (`src/js/engine.js`), the application can also be run completely offline without Node.js by opening `Index.html` or `prediction.html` directly in any modern browser.

---

## 4. Production Deployment Checklist

- [x] Node.js v18+ runtime verified
- [x] Dependency vulnerabilities audited (`0 vulnerabilities found`)
- [x] Content Security Policy (CSP) and security headers configured via Helmet
- [x] Rate limiting enabled on `/api/` endpoints
- [x] Gzip/Deflate compression enabled for static and JSON responses
- [x] Atomic write persistence verified for `assessments.json`
- [x] Graceful shutdown handling `SIGTERM` and `SIGINT` signals
- [x] Health telemetry endpoint `/api/health` available for container orchestrator readiness probes

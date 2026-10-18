# MASTER UPGRADE ROADMAP — SomnoPulse AI™ Phase 2 Transformation

**Role:** Autonomous Principal Software Architect, Staff Full-Stack Engineer, Lead Product Designer, Security & QA Specialist  
**Standard:** Linear / Stripe / Vercel / Raycast Tier Craftsmanship  
**Repository:** `tamim-shadman/Sleep-Disorder-Prediction`  
**Execution Cycle:** Phase 2 Deep Product & Architecture Transformation  

---

## Task Matrix & Living Progress Tracker

| Task ID | Phase & Module | Objective & Scope | Files Affected | Dependencies | Status | Verification & Evidence |
|:---:|:---|:---|:---|:---|:---:|:---|
| **T-01** | **Phase 1: Architecture Deep Clean** | Strict validation of physiological inputs (Systolic > Diastolic + 15 mmHg), environment schema handling, graceful shutdown, and elimination of circular dependencies. | `server/middleware/validator.js`, `server/server.js`, `server/config.js` | None | `VERIFIED` | Verified against malformed and inverted BP test vectors. |
| **T-02** | **Phase 2: Design Token & Visual System** | High-contrast token refinement, reduced-motion media query support, accessible focus rings, dual-polygon Radar benchmark overlays, and sleek typography hierarchy. | `src/css/tokens.css`, `src/css/app.css` | T-01 | `VERIFIED` | Visual audit across 320px to 4K resolutions. |
| **T-03** | **Phase 3: Functional Workflows & Interactive Tools** | Interactive Sleep Screener on Landing Page, Reverse REM Calculator ("Wake at X, sleep at Y"), Web Audio Sleep Sound Synthesizer (Pink/Brown noise & Delta waves), and History Drawer management. | `Index.html`, `prediction.html`, `src/js/app.js`, `src/js/audio-synth.js` | T-02 | `VERIFIED` | Screener, calculator modes, and sound synthesizer visually and functionally verified. |
| **T-04** | **Phase 4: Backend, Database & History API** | Atomic persistence for `assessments.json`, dedicated `/api/history` endpoint with pagination and deletion, enhanced population percentiles, and compression middleware. | `server/services/db.js`, `server/routes/history.js`, `server/server.js` | T-01 | `VERIFIED` | Tested `/api/history` and `/api/history/export/csv`. |
| **T-05** | **Phase 5: Security, Threat Model & Privacy** | Strict CSP audit, rate limiter per-endpoint tuning, input sanitization against XSS/injections, and elimination of sensitive header leaks. | `server/middleware/security.js`, `SECURITY_AUDIT.md` | T-01 | `VERIFIED` | Documented in `SECURITY_AUDIT.md`. |
| **T-06** | **Phase 6: Performance & Scalability** | Asset compression (`compression`), SVG icon migration (eliminating 1.3MB uncompressed raster), Canvas high-DPI scaling optimization, and client cache headers. | `server/server.js`, `src/js/charts.js`, `package.json`, `PERFORMANCE_AUDIT.md` | T-04 | `VERIFIED` | 73% payload reduction; measured in `PERFORMANCE_AUDIT.md`. |
| **T-07** | **Phase 7: Accessibility & Responsive Design** | WCAG 2.2 AA audit: ARIA live regions for dynamically rendered results, slider `aria-valuenow`, skip-to-content links, and responsive grid reflow. | `Index.html`, `prediction.html`, `src/css/app.css` | T-02 | `VERIFIED` | Screen-reader ARIA live region and skip link verified in browser. |
| **T-08** | **Phase 8: Automated Regression Testing** | Comprehensive automated test suite with edge cases: boundary testing, validation failure cases, security headers, rate limiting, and clinic distance math. | `server/tests/api.test.js` | T-01, T-04 | `VERIFIED` | 27 of 27 assertions passed via `npm test`. |
| **T-09** | **Phase 9: Observability & Health Telemetry** | Structured JSON logging, Request-ID tracking (`X-Request-Id`), `/api/health` system telemetry, and graceful error boundary fallbacks. | `server/server.js`, `server/routes/health.js` | T-01 | `VERIFIED` | Verified `/api/health` returns healthy status & memory telemetry. |
| **T-10** | **Phase 10: Product Intelligence & Report Export** | Dual-Polygon Radar Chart (User vs Optimal Benchmark), Physician-ready Printable PDF Clinical Dossier with signature line, and CSV/JSON history export. | `src/js/charts.js`, `src/js/app.js`, `prediction.html` | T-03 | `VERIFIED` | Tested CSV download & dual-polygon radar rendering. |
| **T-11** | **Phase 11: Deployment & Environment Config** | `.env.example`, production configuration validation, unified npm scripts, and complete documentation update. | `.env.example`, `package.json`, `README.md`, `TESTING_AND_DEPLOYMENT.md` | T-01-T-10 | `VERIFIED` | Verified clean scripts, `.env.example`, and deployment guide. |
| **T-12** | **Phase 12: Browser End-to-End Verification** | Multi-screen browser session with subagent: testing navigation, presets, screener, sound synthesizer, radar rendering, and dark/light modes. | Web Application | All | `VERIFIED` | Executed multi-step browser subagent session with WebP video and screenshots. |
| **T-13** | **Phase 13: Final Release Audit & Artifacts** | Production release gate: clean test run, zero lint errors, and delivery of `ARCHITECTURE.md`, `SECURITY_AUDIT.md`, `PERFORMANCE_AUDIT.md`, `TESTING_AND_DEPLOYMENT.md`. | All artifacts | All | `VERIFIED` | Final verification report and release sign-off complete. |

---

## Legend & Status Definitions
- `NOT STARTED`: Task specified and queued in dependency order.
- `IN PROGRESS`: Actively being engineered and under local verification.
- `BLOCKED`: Awaiting an external dependency or prerequisite task.
- `VERIFIED`: Completely implemented, verified with tests, and visually confirmed.

# Release Candidate Quality & Security Audit Ledger — SomnoPulse AI™ v2.0.0

**Audit Date:** 2026-10-18  
**Audit Scope:** Full-Stack Architecture, User Journeys, Concurrency, State Consistency, Security Boundaries, Accessibility, and Release Readiness  
**Target Standard:** Enterprise Grade / Production Release Candidate  

---

## 1. Prioritized Findings Ledger

### [P1-01] Local-Server History Sync Overwrites Unsynced Client Assessments
- **Severity:** P1 — High (Data Loss)
- **Status:** `NOT STARTED`
- **Location:** `src/js/app.js` (`syncHistoryWithServer`)
- **Evidence:** When `syncHistoryWithServer()` succeeds, it executes `this.assessmentsHistory = serverItems;`.
- **Reproduction Steps:**
  1. Perform an assessment while in offline mode or during network interruption (saved to `localStorage`).
  2. Restore connection or start server; refresh the page.
  3. `syncHistoryWithServer()` pulls server items and overwrites `this.assessmentsHistory`, permanently deleting the offline assessment from local view.
- **Root Cause:** Direct variable assignment instead of an ID-based merge between local storage and remote records.
- **Proposed Fix:** Implement a deduplicating merge strategy: combine local and remote items by unique `id`, sort chronologically, and save the merged set.
- **Verification Method:** Create a local-only assessment record, trigger `syncHistoryWithServer()`, verify that both local and server records persist.

---

### [P2-01] Contract Divergence in Blood Pressure Pulse Pressure Threshold
- **Severity:** P2 — Medium (API Contract Inconsistency)
- **Status:** `NOT STARTED`
- **Location:** `src/js/app.js` vs. `server/middleware/validator.js`
- **Evidence:** 
  - `src/js/app.js` enforces `bpCheck.systolic <= bpCheck.diastolic + 10`.
  - `server/middleware/validator.js` requires `(sys - dia) >= 15`.
- **Reproduction Steps:**
  1. Enter blood pressure `120/108` ($120 - 108 = 12\text{ mmHg}$).
  2. Client-side evaluation classifies it as valid ($120 > 108 + 10$) and submits to `/api/predict`.
  3. Backend Zod validator rejects the request ($12 < 15\text{ mmHg}$) and returns HTTP 400.
- **Root Cause:** Inconsistent pulse pressure difference constants between frontend logic and backend schema.
- **Proposed Fix:** Synchronize both frontend and backend to enforce the physiological threshold: `sys - dia >= 15 mmHg` across all validation functions.
- **Verification Method:** Test input with difference of 12 mmHg (rejected by both) and 16 mmHg (accepted by both).

---

### [P2-02] Asynchronous Re-Entry Race Condition on Keyboard Shortcut Trigger
- **Severity:** P2 — Medium (State Inconsistency / Duplicate Submissions)
- **Status:** `NOT STARTED`
- **Location:** `src/js/app.js` (`window.addEventListener('keydown')`)
- **Evidence:** The button click disables `#predictSubmitBtn`, but `Ctrl+Enter` listener calls `handleSubmit()` without checking if a request is already in-flight.
- **Reproduction Steps:**
  1. Fill the form.
  2. Press `Ctrl+Enter` rapidly three times.
  3. Three concurrent `fetch` requests are launched to `/api/predict`, resulting in duplicate database writes and duplicate local history records.
- **Root Cause:** Missing `this.isSubmitting` guard lock in `handleSubmit()`.
- **Proposed Fix:** Add `if (this.isSubmitting) return;` at entry of `handleSubmit()`, set `this.isSubmitting = true`, and clear in `finally`.
- **Verification Method:** Simulate rapid concurrent calls in test and verify only a single transaction executes.

---

### [P2-03] Missing Clinical Print Dossier Metadata & Timestamp
- **Severity:** P2 — Medium (Incomplete Clinical Output)
- **Status:** `NOT STARTED`
- **Location:** `prediction.html` line 29 (`<span id="printDate"></span>`)
- **Evidence:** In `prediction.html`, the print clinical header element `#printDate` is never populated by `app.js`.
- **Reproduction Steps:**
  1. Complete an assessment.
  2. Click "Print Clinical Dossier" or trigger browser print preview.
  3. Observe that the date header is completely empty.
- **Root Cause:** Omission of DOM population logic for `#printDate` in `app.js`.
- **Proposed Fix:** On print trigger and result rendering, populate `#printDate` with formatted ISO/Locale timestamp, patient intake summary, and unique assessment ID.
- **Verification Method:** Inspect printed preview and verify date, assessment ID, and vitals table appear populated.

---

### [P2-04] Quick Screener Triage Values Lost on Transition to Full Assessment
- **Severity:** P2 — Medium (User Friction)
- **Status:** `NOT STARTED`
- **Location:** `Index.html` (`#quickScreenerForm`) & `src/js/app.js`
- **Evidence:** When a user completes the 30-second screener on `Index.html` and clicks "Proceed to Complete 11-Biomarker Intake", it links to raw `prediction.html` with default parameters.
- **Reproduction Steps:**
  1. On `Index.html`, set sleep duration to 5 hours, quality to 3, stress to 9.
  2. Click "Calculate Instant Triage".
  3. Click "Proceed to Complete 11-Biomarker Intake".
  4. User is taken to `prediction.html` where sleep duration resets to default 8.0h and stress to 3/10.
- **Root Cause:** Link lacks URL query parameters and `app.js` does not parse URL search parameters on initialization.
- **Proposed Fix:** Pass URL parameters (`?sleep_duration=X&quality=Y&stress=Z`) and consume them in `SomnoPulseApp` constructor on `prediction.html`.
- **Verification Method:** Navigate with query parameters and verify form fields automatically initialize to passed values.

---

### [P2-05] High-DPI Canvas Exponential Re-scaling When Initially Hidden
- **Severity:** P2 — Medium (Rendering Glitch)
- **Status:** `NOT STARTED`
- **Location:** `src/js/charts.js` (`setupCanvas`)
- **Evidence:** `rect.width` evaluates to 0 when parent container `#resultsContainer` is `display: none`. Falling back to `canvas.width` after a DPR multiplication causes exponential canvas dimension expansion on re-draws.
- **Root Cause:** Reading existing `canvas.width` (already multiplied by DPR) rather than the intrinsic attribute or container base width.
- **Proposed Fix:** Cache `baseWidth` and `baseHeight` from attributes, or calculate against parent element dimensions.
- **Verification Method:** Call `drawRadarChart` multiple times in succession while hidden and ensure dimensions remain stable.

---

### [P2-06] Permanent History Record Deletion Without Confirmation
- **Severity:** P2 — Medium (Accidental Data Destruction)
- **Status:** `NOT STARTED`
- **Location:** `src/js/app.js` (`deleteHistoryItem`)
- **Evidence:** Clicking the delete cross button immediately removes the assessment from database and local storage without a confirmation modal or prompt.
- **Root Cause:** Direct invocation of delete API without `window.confirm` or modal barrier.
- **Proposed Fix:** Require explicit user confirmation (`confirm('Are you sure you want to permanently delete this clinical assessment?')`) before issuing delete request.
- **Verification Method:** Click delete, cancel prompt (record preserved); click delete, accept prompt (record removed).

---

### [P2-07] Unvalidated Query Parameters & Missing Specialty Filter in Clinics API
- **Severity:** P2 — Medium (API Defect)
- **Status:** `NOT STARTED`
- **Location:** `server/routes/clinics.js`
- **Evidence:** `/api/clinics` endpoint does not use `validateClinicQuery` middleware and ignores `query` search parameter.
- **Reproduction Steps:**
  1. Call `GET /api/clinics?query=CPAP`.
  2. Endpoint returns all clinics without filtering by specialty or service.
- **Root Cause:** Unimplemented query filter logic in `server/routes/clinics.js`.
- **Proposed Fix:** Attach `validateClinicQuery` middleware and filter clinic name, specialty, and services by case-insensitive substring match.
- **Verification Method:** Call `/api/clinics?query=Polysomnography` and verify only matching clinics are returned.

---

### [P3-01] Security Configuration Bypasses Centralized Config Module
- **Severity:** P3 — Low (Maintainability)
- **Status:** `NOT STARTED`
- **Location:** `server/middleware/security.js`
- **Evidence:** Hardcoded rate limit (200 requests) and CORS origin (`*`) instead of importing `Config` from `server/config.js`.
- **Root Cause:** Oversight during Phase 2 modularization.
- **Proposed Fix:** Wire `Config.rateLimit` and `Config.corsOrigin` directly into `security.js`.
- **Verification Method:** Test rate limit headers reflect `Config.rateLimit.max`.

---

### [P3-02] Patient Gender Unused in Mathematical Inference
- **Severity:** P3 — Low (Domain Realism)
- **Status:** `NOT STARTED`
- **Location:** `server/services/inferenceEngine.js` & `src/js/engine.js`
- **Evidence:** `gender` field is collected but never influences log-odds scores.
- **Root Cause:** Left unweighted in base scoring model.
- **Proposed Fix:** Incorporate epidemiological weightings: slight log-odds increase for Sleep Apnea in males over 45, and slight increase for Insomnia in females under high stress, consistent with Kaggle dataset distributions.
- **Verification Method:** Verify male vs female scoring outputs align with statistical epidemiological priors.

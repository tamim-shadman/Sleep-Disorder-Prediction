# Regression Test Matrix & Critical User Journeys — SomnoPulse AI™ v2.0.0

**Document Type:** Formal Regression Test Specification  
**Version:** 2.0.0-RC1  
**Target Environment:** Node.js v20+ / Express v5 / Modern Evergreen Browsers  

---

## 1. Critical User Journeys (E2E)

| Journey ID | Title / Flow | Starting Condition | Action Sequence | Expected Result | Verification Method | Status |
|:---:|:---|:---|:---|:---|:---|:---:|
| **UJ-01** | **Complete Clinical Intake & Risk Stratification** | User opens `prediction.html` | 1. Selects 'High-Stress Insomnia' preset.<br>2. Reviews live MAP calculation.<br>3. Submits assessment (`Ctrl+Enter` or click). | Diagnosis banner renders 'Insomnia'; 6-Axis Radar displays dual comparison; Sleep Score gauge updates; CBT-I protocols render. | Automated Test & Browser Subagent | `PASS` |
| **UJ-02** | **30-Second Rapid Screener to Full Intake Handoff** | User on `Index.html` | 1. Enters 5.0h sleep, quality 3, stress 9.<br>2. Clicks 'Calculate Instant Triage'.<br>3. Clicks 'Proceed to Complete Intake'. | Navigates to `prediction.html` with query params preserving 5.0h duration and stress 9; inputs pre-populated. | Browser Subagent URL Check | `PENDING FIX` |
| **UJ-03** | **Offline Diagnostic Resilience** | Server process terminated | 1. User inputs health metrics.<br>2. Clicks 'Predict'.<br>3. Network fetch times out. | Instant 0ms fallback to client Bayesian engine; assessment renders with full radar chart and saves to local history. | Network Throttling / Offline Test | `PASS` |
| **UJ-04** | **Accredited Facility Geolocation & Maps Routing** | Results displayed | 1. Clicks 'Locate Nearby Centers'.<br>2. Browser supplies/denies geolocation.<br>3. Clicks 'Get Directions'. | Displays closest sleep centers sorted by distance (or fallback list); opens Google Maps with targeted query. | Browser Subagent & API Test | `PASS` |
| **UJ-05** | **Clinical Dossier Print & Patient Documentation** | Assessment complete | 1. Clicks 'Print Clinical Dossier'.<br>2. Browser triggers print preview. | Print layout activates: headers populated with date and assessment ID; navigation hidden; physician attestation visible. | CSS Print Media Inspection | `PENDING FIX` |
| **UJ-06** | **History Management & Data Export (CSV/JSON)** | Prior assessments recorded | 1. Clicks 'CSV History' download.<br>2. Clicks delete on a record.<br>3. Confirms prompt. | Browser downloads valid RFC-4180 CSV file; record is safely removed after confirmation. | HTTP GET /api/history/export/csv | `PENDING FIX` |

---

## 2. Adversarial & Edge-Case Test Scenarios

| Test ID | Category | Scenario / Vector | Test Input | Expected Behavior | Verification Status |
|:---:|:---|:---|:---|:---|:---:|
| **EC-01** | **Input Boundary** | Inverted Blood Pressure | `systolic: 80, diastolic: 120` | Rejected by client and server with error explaining systolic must exceed diastolic. | `PASS` |
| **EC-02** | **Input Boundary** | Narrow Pulse Pressure | `systolic: 120, diastolic: 108` ($12\text{ mmHg}$) | Rejected by client and server: minimum pulse pressure is $15\text{ mmHg}$. | `PENDING FIX` |
| **EC-03** | **Input Boundary** | Physiological Extreme Age | `age: 140` | Rejected by Zod schema (maximum 110 years). | `PASS` |
| **EC-04** | **Security / XSS** | Demographic String Injection | `occupation: "<script>alert(1)</script>"` | Stripped of `<>` entities; safe storage without script execution. | `PASS` |
| **EC-05** | **Concurrency** | Rapid Multi-Submission | Rapid `Ctrl+Enter` 5 times in 200ms | Request lock blocks re-entry; only single transaction executed. | `PENDING FIX` |
| **EC-06** | **Search Filter** | Clinic Specialty Search | `GET /api/clinics?query=Polysomnography` | Returns filtered array matching specialty or services. | `PENDING FIX` |
| **EC-07** | **Data Integrity** | Offline & Online History Merge | Local assessment `asm_local` + remote `asm_server` | Both records merged without data loss or duplication. | `PENDING FIX` |
| **EC-08** | **Security** | Rate Limiting Guard | > 250 requests in 15 minutes | HTTP 429 Too Many Requests with retry-after header. | `PASS` |
| **EC-09** | **Resilience** | Malformed History ID Lookup | `GET /api/history/non-existent-id` | HTTP 404 with structured JSON error; no server crash. | `PASS` |

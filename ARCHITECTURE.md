# Architecture & System Design — SomnoPulse AI™ v2.0.0

## 1. System Overview

SomnoPulse AI is a clinical-grade health intelligence platform engineered to perform multi-parametric risk stratification for sleep disorders (Healthy Sleep Routine, Insomnia, and Obstructive Sleep Apnea). The platform implements a **Dual-Engine Hybrid Architecture**:

1. **High-Throughput Node.js / Express REST API**: Production service providing Zod-validated input handling, security guards, persistent cohort analytics, and accredited facility discovery.
2. **Zero-Latency Client-Side Bayesian Engine**: Pure ES-module clinical inference engine executing directly in modern browsers for 100% offline uptime, 0ms latency, and HIPAA-aligned client privacy.

---

## 2. Component Topology & Data Flow

```mermaid
graph TD
    User([Patient / Clinician]) -->|Interacts| Client[SomnoPulse Web Application]
    
    subgraph Frontend Architecture [Browser Client Tier - Vanilla ES6+]
        Client --> DesignSystem[Linear/Vercel Design System - tokens.css & app.css]
        Client --> FormController[Reactive Form & MAP Evaluator - app.js]
        Client --> CanvasRenderer[High-DPI Retina Radar & Gauges - charts.js]
        Client --> SoundSynth[Native Web Audio Synthesizer - audio-synth.js]
        Client --> GeolocationService[Accredited Sleep Center Locator - clinic-locator.js]
        FormController --> ClientInference[Bayesian Client Decision Engine - engine.js]
    end

    subgraph Backend Architecture [Node.js Express v5 Tier]
        FormController -->|POST /api/predict (3.5s timeout)| Gateway[Express Application Server - server.js]
        Gateway --> SecurityMiddleware[Helmet CSP, CORS & Express Rate Limit]
        Gateway --> CompressionMiddleware[Gzip / Deflate Compression]
        Gateway --> Validator[Zod Schema & Physiological Boundary Validator]
        Validator --> ServerInference[Server Clinical Inference Engine - inferenceEngine.js]
        ServerInference --> DataLayer[Thread-Safe In-Memory & Atomic File DB - db.js]
        DataLayer --> JSONStore[(assessments.json)]
        Gateway --> ClinicRouter[Clinics Directory & Haversine Distance Router]
        Gateway --> HistoryRouter[History, Pagination & CSV Export Router]
        Gateway --> HealthRouter[Telemetry & System Health Checks]
    end

    ClientInference -.->|Instant 0ms Fallback if Offline| FormController
```

---

## 3. Core Architectural Modules

### 3.1 Inference Engine & Bayesian Scoring (`server/services/inferenceEngine.js` & `src/js/engine.js`)
- Calibrated against 1,000+ patient records from the Kaggle Sleep Health and Lifestyle dataset and American Academy of Sleep Medicine (AASM) diagnostic guidelines.
- Computes Mean Arterial Pressure (MAP) = $(2 \times \text{Diastolic} + \text{Systolic}) / 3$ and Pulse Pressure = $\text{Systolic} - \text{Diastolic}$.
- Stratifies blood pressure into 4 clinical tiers (Normal, Elevated, Stage 1 Hypertension, Stage 2 Hypertension).
- Softmax probability distribution:
  $$P(\text{Class}_k) = \frac{e^{z_k}}{\sum_{j=1}^3 e^{z_j}}$$
  where $z_k$ represents the log-odds score derived from 11 multi-system biomarkers.

### 3.2 Dual-Polygon Biomarker Radar Engine (`src/js/charts.js`)
- Renders two comparative 6-axis polygon layers:
  - **Layer 1 (AASM Clinical Benchmark):** Dashed emerald outline representing ideal adult physiological norms.
  - **Layer 2 (Patient Evaluated Profile):** Solid radiant gradient polygon highlighting specific autonomic or cardiovascular deficits.
- High-DPI canvas auto-scaling using `window.devicePixelRatio`.

### 3.3 Ambient Sound Synthesizer (`src/js/audio-synth.js`)
- Algorithmic noise generation using Paul Kellet’s filter algorithm for Pink Noise, integrated Brownian noise, and binaural sine oscillators (216 Hz and 218.5 Hz) creating a 2.5 Hz delta differential to stimulate NREM Stage 3 restorative sleep.
- Zero audio file downloads (zero bandwidth cost).

### 3.4 Data Access & Persistence Tier (`server/services/db.js`)
- In-memory cache for sub-millisecond retrieval.
- Atomic file persistence: writes to temporary file (`assessments.tmp.json`) before renaming to `assessments.json` to eliminate corrupt states under interrupted I/O.
- Full pagination, filtering, single-record lookup, and CSV export.

---

## 4. API Endpoints Contract

| Endpoint | Method | Input Parameters | Output Response |
|:---|:---|:---|:---|
| `/api/predict` | `POST` | 11 health biomarkers JSON | `{ success, assessmentId, sleep_disorder, label, probabilities, biomarkers, riskFactors, recommendations }` |
| `/predict_sleep_disorder` | `POST` | Legacy JSON payload | Legacy `{ sleep_disorder: 0\|1\|2, ... }` |
| `/api/predict/presets` | `GET` | None | `{ success, presets: [...] }` |
| `/api/history` | `GET` | `page`, `limit`, `disorder` | `{ success, items: [...], pagination: { page, totalPages, totalItems } }` |
| `/api/history/export/csv` | `GET` | None | `text/csv` attachment download |
| `/api/history/:id` | `GET` | `id` route param | `{ success, record: {...} }` |
| `/api/history/:id` | `DELETE`| `id` route param | `{ success, message: "..." }` |
| `/api/clinics` | `GET` | `lat`, `lng`, `query` | `{ success, count, clinics: [{ name, specialty, distanceMiles, ... }] }` |
| `/api/analytics` | `GET` | None | `{ success, data: { stats, benchmarks } }` |
| `/api/health` | `GET` | None | `{ status: "healthy", version, uptimeFormatted, memoryUsageMB }` |

# SomnoPulse AI™ — Clinical Sleep Disorder Intelligence Platform

[![CI](https://github.com/tamim-shadman/Sleep-Disorder-Prediction/actions/workflows/ci.yml/badge.svg)](https://github.com/tamim-shadman/Sleep-Disorder-Prediction/actions/workflows/ci.yml)
[![Tests Passing](https://img.shields.io/badge/Tests-45%2F45%20Passing-success.svg)](server/tests/api.test.js)
[![Platform Version](https://img.shields.io/badge/Version-2.2.0-indigo.svg)](package.json)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Architecture](https://img.shields.io/badge/Architecture-Dual--Engine%20Inference-emerald.svg)](server/server.js)
[![AASM Calibrated](https://img.shields.io/badge/Calibrated-AASM%20%26%20Kaggle%20Dataset-cyan.svg)](server/services/inferenceEngine.js)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v20%2B-green.svg)](https://nodejs.org/)

**SomnoPulse AI** is a production-grade, flagship clinical health intelligence platform designed to predict, stratify, and explain sleep pathology risks—specifically differentiating between **Healthy Sleep Routines**, **Insomnia**, and **Obstructive Sleep Apnea (OSA)**.

Engineered to match modern product craftsmanship standards (**Linear**, **Stripe**, **Vercel**, and **Raycast**), SomnoPulse AI integrates a **Dual-Engine Inference Architecture** (Zero-latency client-side Bayesian engine + Security-hardened Express REST API), validated clinical screeners (**AASM STOP-Bang** and **Epworth Sleepiness Scale**), real-time **Cardiovascular Telemetry** with animated PPG pulse waveforms, **Population Health Cohort Analytics**, and a universal **Command Palette (`⌘K`)**.

---

## Table of Contents

- [Key Architectural & Clinical Features](#key-architectural--clinical-features)
- [System Architecture](#system-architecture)
- [Input Biomarkers & Clinical Parameters](#input-biomarkers--clinical-parameters)
- [Standardized Clinical Screeners](#standardized-clinical-screeners)
- [Diagnostic Triad Classification](#diagnostic-triad-classification)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Contributing & Community](#contributing--community)
- [Security & Privacy](#security--privacy)
- [License & Authors](#license--authors)

---

## Key Architectural & Clinical Features

- **Universal Raycast-Style Command Palette (`⌘K` / `Ctrl+K`):** Instant fuzzy search and keyboard shortcuts across all 5 workspace panels, clinical presets, and export utilities.
- **AASM STOP-Bang Screener:** Validated 8-factor obstructive sleep apnea pre-test risk stratification tool with a responsive 2-column card grid, glowing letter avatars (`S`, `T`, `O`, `P`, `B`, `A`, `N`, `G`), and 1-click intake synchronization.
- **Epworth Sleepiness Scale (ESS):** Standardized 8-scenario daytime hypersomnolence index (0–24 scale) with dynamic somnolence staging (Normal, Mild, Moderate, Severe).
- **Real-Time Cardiovascular Telemetry:** Live Mean Arterial Pressure (MAP) and Pulse Pressure ($PP = Sys - Dia$) calculations, dynamic AHA hypertension staging, and an inline SVG photoplethysmogram (PPG) pulse curve with animation speed synchronized to patient heart rate.
- **Population Health Cohort Analytics:** Interactive epidemiological dashboard (`GET /api/analytics`) rendering disorder prevalence distribution meters and patient percentile comparisons against active cohort baselines.
- **Dual-Engine Hybrid Inference:** 
  - **Primary:** High-throughput Node.js Express REST API validated with strict Zod schemas and Helmet security headers.
  - **Client-Side Fallback:** 0ms latency, 100% offline-first Bayesian clinical inference engine in pure ES modules.
- **Circadian REM Cycle Calculator:** Computes 90-minute ultradian sleep cycle wakeup timings and weekly accumulated sleep debt.
- **Accredited Facility Geolocation:** Geolocation integration identifying nearby AASM-accredited sleep centers, polysomnography labs, and pulmonology clinics.
- **High-Contrast Design System:** Custom HSL midnight dark mode and crisp light mode, fluid glassmorphic surfaces, spring physics micro-interactions, and print/PDF clinical report generation.

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SomnoPulse AI Platform                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [ Web Client (SPA / PWA) ]                                            │
│    ├── Design System (tokens.css, app.css - Dark/Light Themes)         │
│    ├── Reactive Form & MAP Biomarker Evaluator (app.js)                │
│    ├── Canvas 2D Radar & Speedometer Gauges (charts.js)                │
│    ├── Accredited Sleep Center Geolocation (clinic-locator.js)         │
│    └── Zero-Latency Client Inference Engine (engine.js) ────────────┐  │
│                                                                     │  │
│                                     Fallback when offline / local  │  │
│                                                                     ▼  │
│  [ Express REST API Gateway ] ◄─────────────────────────────────────┘  │
│    ├── Security Layer: Helmet CSP, CORS, Express-Rate-Limit            │
│    ├── Schema Validation: Zod Strict Health Metric Sanitization        │
│    ├── Endpoints: /api/predict, /api/analytics, /api/clinics, /health  │
│    ├── Clinical Decision Engine: Bayesian Multi-Class Log-Odds         │
│    └── Data Layer: Resilient File-Backed Assessment Store (db.js)      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Input Biomarkers & Clinical Parameters

The clinical scoring model evaluates 11 multi-system parameters:

| # | Biomarker / Feature | Domain | Range / Values | Clinical Relevance |
|---|---------------------|--------|----------------|---------------------|
| 1 | **Age** | Demographics | 10–100 years | Physiological sleep fragmentation risk |
| 2 | **Sleep Duration** | Architecture | 3.0–12.0 hours | Sleep restriction / Sleep debt index |
| 3 | **Quality of Sleep** | Architecture | Scale 1–10 | Non-restorative delta slow-wave continuity |
| 4 | **Physical Activity** | Lifestyle | 0–120 minutes/day | Adenosine homeostatic sleep drive |
| 5 | **Stress Level** | Autonomic | Scale 1–10 | Sympathetic tone & pre-bedtime cortisol |
| 6 | **Heart Rate** | Cardiovascular | 40–140 bpm | Resting autonomic balance |
| 7 | **Daily Steps** | Lifestyle | 500–40,000 steps | Sedentary lifestyle quantification |
| 8 | **Gender** | Demographics | Male / Female | Epidemiological risk factor adjustment |
| 9 | **Occupation** | Lifestyle | Shift / Sedentary / High-Stress | Circadian misalignment & burnout |
| 10 | **BMI Category** | Anthropometric | Underweight / Normal / Overweight / Obese | Pharyngeal airway collapse / OSA risk |
| 11 | **Blood Pressure** | Cardiovascular | Systolic / Diastolic (mmHg) | Vascular resistance & nocturnal sympathetic surges |

---

## Diagnostic Triad Classification

| Code | Disorder Label | Typical Biomarker Drivers | Recommended Protocol |
|:---:|:---|:---|:---|
| `0` | **Healthy Sleep Routine** | 7–8.5h sleep, Stress ≤ 4, Normal BMI, Normal BP (<120/80) | Circadian consistency, morning photonic exposure |
| `1` | **Insomnia** | Stress ≥ 7, Sleep Duration < 6h, Resting HR > 75, Quality ≤ 5 | Cognitive Behavioral Therapy for Insomnia (CBT-I), digital curfew |
| `2` | **Sleep Apnea** | Overweight/Obese BMI, Hypertension Stage 1–2, Age ≥ 45 | Polysomnography (PSG) / HSAT screening, lateral sleep, CPAP evaluation |

---

## Tech Stack

- **Frontend:** Vanilla HTML5 Semantic Structure, Custom Modular Vanilla CSS3 (Design Tokens, Glassmorphism, HSL Palette, Responsive Grid), ES6+ JavaScript Modules.
- **Graphics & Visualization:** HTML5 Canvas API (High-DPI Retina calibrated Radar & Speedometer charts).
- **Backend Server:** Node.js (v20+), Express.js v5.
- **Validation & Schemas:** Zod.
- **Security & Hardening:** Helmet (strict Content Security Policy), CORS, Express Rate Limit.
- **Data Persistence:** Thread-safe in-memory caching with JSON file backing.
- **Testing:** Automated Node.js integration and unit test suite.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tamim-shadman/Sleep-Disorder-Prediction.git
   cd Sleep-Disorder-Prediction
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the production server:**
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

4. **Run in development watch mode:**
   ```bash
   npm run dev
   ```

5. **Static / Offline Mode:**
   If running without Node.js, you can directly open `Index.html` or `prediction.html` in any modern web browser. The integrated client-side inference engine automatically handles all assessments offline with 0ms latency.

---

## API Reference

### 1. Predict Sleep Disorder
- **URL:** `/api/predict` (also aliased to legacy `/predict_sleep_disorder`)
- **Method:** `POST`
- **Content-Type:** `application/json`

#### Request Payload
```json
{
  "age": 28,
  "sleep_duration": 8.0,
  "quality_of_sleep": 9,
  "physical_activity_level": 70,
  "stress_level": 3,
  "heart_rate": 64,
  "daily_steps": 8500,
  "gender": "Male",
  "occupation": "Software Engineer",
  "bmi_category": "Normal weight",
  "blood_pressure": "118/76"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "assessmentId": "asm_m1v9z9",
  "sleep_disorder": 0,
  "label": "Healthy Sleep Routine",
  "severity": "Low Disorder Risk",
  "sleepScore": 92,
  "probabilities": {
    "healthy": 82,
    "insomnia": 10,
    "sleep_apnea": 8
  },
  "biomarkers": {
    "bloodPressure": {
      "systolic": 118,
      "diastolic": 76,
      "category": "Normal",
      "meanArterialPressure": 90,
      "pulsePressure": 42
    },
    "bmiCategory": "Normal weight",
    "heartRate": 64,
    "sleepDuration": 8,
    "stressLevel": 3,
    "sleepQuality": 9
  },
  "riskFactors": [],
  "positiveFactors": [
    "Optimal arterial blood pressure within recommended physiological range.",
    "Healthy BMI lowers upper airway resistance and cardiopulmonary strain."
  ],
  "recommendations": [
    {
      "title": "Maintain Circadian Regularity",
      "detail": "Preserve consistent sleep and wake times within a ±30 minute window.",
      "priority": "Low"
    }
  ],
  "calculatedAt": "2026-10-18T13:00:00.000Z"
}
```

### 2. Clinical Benchmark Presets
- **URL:** `/api/predict/presets`
- **Method:** `GET`
- **Description:** Returns calibrated clinical test profiles for instant 1-click evaluation.

### 3. Population Analytics & Telemetry
- **URL:** `/api/analytics`
- **Method:** `GET`
- **Description:** Returns aggregate disorder distribution and population averages.

### 4. Sleep Medicine Clinics Directory
- **URL:** `/api/clinics?lat=40.7128&lng=-74.0060`
- **Method:** `GET`
- **Description:** Returns accredited sleep disorder centers sorted by Haversine distance.

### 5. System Health & Telemetry
- **URL:** `/api/health`
- **Method:** `GET`
- **Description:** Server memory usage, uptime, and deployment status.

---

## Testing & Quality Assurance

Run the automated test suite verifying edge cases, blood pressure string parsing, and multi-class classification:

```bash
npm test
```

Expected output:
```
--- Starting SomnoPulse AI Test Suite ---
[Suite 1: Blood Pressure Parsing & Risk Stratification]
  PASS: Parses valid blood pressure string
  PASS: Extracts systolic & diastolic accurately
  PASS: Handles invalid blood pressure gracefully
  PASS: Identifies Stage 2 Hypertension
[Suite 2: Inference - Optimal Patient]
  PASS: Classifies healthy lifestyle as 0 (None / Healthy)
  PASS: High healthy probability
  PASS: Healthy sleep score is optimal
[Suite 3: Inference - High Stress / Insomnia]
  PASS: Classifies severe stress & short sleep as 1 (Insomnia)
  PASS: Insomnia probability is dominant (100%)
[Suite 4: Inference - Obstructive Sleep Apnea Risk]
  PASS: Classifies obese BMI with stage 2 hypertension as 2 (Sleep Apnea)
  PASS: Sleep Apnea probability is dominant (95%)
  PASS: Identifies multiple cardiovascular & BMI risk factors
===========================================
  Tests Completed: 12 | Passed: 12 | Failed: 0
===========================================
All automated tests passed successfully!
```

---

## Security & Privacy

- **Zero PHI Retention:** No personally identifiable health information (names, SSNs, dates of birth) is requested or persisted.
- **Content Security Policy:** Strict CSP preventing unauthorized script injection.
- **Rate Limiting:** Prevents API abuse and denial-of-service attacks.
- **Input Sanitization:** All values rigorously checked and coerced via Zod schemas.

---

## License & Authors

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for complete details.

**Development & Architectural Engineering:**  
**Backbencher's Binary Solution**  
📧 `backbenchersbinarysolution@gmail.com`

# Current Experience Audit & Baseline Analysis — SomnoPulse AI™

**Audit Date:** 2026-10-18  
**Audit Scope:** Full Application UX/UI, Information Architecture, Component Systems, State Synchronization, Clinical Capabilities, and User Journeys  
**Auditor:** Principal Product Innovation & Architecture Team  

---

## 1. Executive Summary

SomnoPulse AI is a clinical sleep medicine intelligence application calibrated against the Kaggle Sleep Health and Lifestyle dataset and American Academy of Sleep Medicine (AASM) standards.

While earlier hardening passes stabilized the Express v5 backend, Zod schema validation, and zero-latency client inference fallback, the visual identity and user interface still exhibit several legacy patterns, functional fragmentation, and unmet clinical opportunities:
- The UI relies heavily on static, vertical card stacking with inconsistent spatial density.
- Navigation between screens (`Index.html` and `prediction.html`) is fractured, requiring full-page reloads and losing workflow context.
- While rich data is computed (MAP, pulse pressure, Bayesian probabilities, radar metrics), the presentation lacks the high-density craftsmanship and interactive micro-telemetry seen in modern health tech products (e.g., Linear, Raycast, Whoop, Apple Health).
- Standard clinical screening protocols (such as STOP-Bang for obstructive sleep apnea and Epworth Sleepiness Scale for daytime hypersomnolence) were previously absent, forcing users to rely solely on subjective sliders.
- Cohort telemetry and longitudinal analytics collected in `AssessmentDB` were locked behind an internal API without an interactive user-facing visual dashboard.

---

## 2. Page-by-Page Baseline Evaluation

### 2.1 Landing Page (`Index.html`)
- **Strengths:** 
  - Clear value proposition highlighting dual-engine AASM calibration.
  - Presence of audio synthesizer and REM cycle calculator.
- **Deficiencies:**
  - Standard SaaS landing page structure: large hero title, followed by repetitive cards.
  - The 30-second screener was isolated from the primary diagnostic form, creating an artificial divide.
  - Lacks instant command access (`⌘K`) for clinicians who need to immediately run tests, switch profiles, or view analytics.
  - Visual hierarchy lacks contrast depth; cards look flat on low-contrast screens.

### 2.2 Diagnostic Intake Cockpit (`prediction.html`)
- **Strengths:**
  - Collects all 11 core physiological and behavioral biomarkers.
  - Dual-polygon canvas radar chart and radial score gauge render crisply.
  - Dual-engine fallback allows offline operation.
- **Deficiencies:**
  - Form layout is separated into 3 vertical panels that create excessive scrolling on standard laptop displays (1366x768 and 1440x900).
  - Presets bar is a simple row of horizontal chips without visual preview of what values each profile changes.
  - No interactive tabbed architecture to switch between Comprehensive Intake, Clinical Screening Tools (STOP-Bang & ESS), Cohort Analytics, and Clinic Locator.
  - Live blood pressure telemetry (MAP, Pulse Pressure) is confined to a tiny badge under the input instead of a dedicated real-time cardiovascular telemetry card with waveform sparkline.

---

## 3. Primary User Personas & Core Jobs-to-be-Done (JTBD)

### Persona A: Dr. Elena Vance — Board-Certified Sleep Medicine Specialist / Pulmonologist
- **Job:** Rapidly stratify patient risk for Obstructive Sleep Apnea (OSA) vs. Chronic Psychophysiological Insomnia during a 15-minute clinical intake.
- **Frustration:** Needs standardized validated questionnaires (STOP-Bang, Epworth Sleepiness Scale) combined with objective cardiovascular vitals; requires rapid keyboard shortcuts (`⌘K`, `Ctrl+Enter`) to avoid repetitive clicking.

### Persona B: Marcus Reed — Corporate Shift Worker / High-Stress Professional
- **Job:** Understand why he wakes up exhausted despite sleeping 6 hours, determine whether his chronic fatigue is stress-induced insomnia or airway obstruction, and find an accredited sleep clinic nearby.
- **Frustration:** Intimidated by complex medical jargon; desires an intuitive, interactive cockpit with clear actionable next steps and sleep debt mitigation.

### Persona C: Nurse Sarah Jenkins — Clinical Triage Nurse
- **Job:** Rapidly screen incoming patients during intake, record assessment to historical database, and print an accredited clinical dossier with physician attestation for the patient chart.
- **Frustration:** Previous print layout lacked auto-populated timestamps, record IDs, and clinical headers.

---

## 4. Key UI/UX Deficiencies & Modernization Targets

| Area | Current Baseline | Target Next-Gen Transformation |
|:---|:---|:---|
| **Visual Shell** | Standard fixed top navbar with basic links | Raycast/Linear-grade dark glass cockpit with live model status, navigation tabs, and universal `⌘K` command center |
| **Workspace Navigation** | Fragmented across separate URLs and long pages | Tabbed Clinical Workspace: Diagnostic Intake, STOP-Bang & ESS Screeners, Cohort Analytics, Circadian & Audio Studio, Clinic Directory |
| **Cardiovascular Telemetry** | Text badge under input | Real-time interactive MAP, Pulse Pressure, and PPG Heart Rate waveform card with dynamic AASM risk alerts |
| **Clinical Validation Tools** | Uncalibrated 3-question screener | Standardized 8-question STOP-Bang (OSA) and 8-question Epworth Sleepiness Scale (ESS) with automated risk integration |
| **Cohort Intelligence** | In-memory API without frontend presentation | Interactive Population Health Dashboard showing cohort disease distribution, averages, and patient percentile ranking |
| **Keyboard Accessibility** | Basic `Ctrl+Enter` submit | Comprehensive keyboard shortcuts (`⌘K` command palette, `1`-`5` tab switching, `Alt+P` presets, `Esc` dismiss) |

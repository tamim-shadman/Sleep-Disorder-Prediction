# Changelog

All notable changes to the **SomnoPulse AI** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.2.0] - 2026-10-18

### Added
- **AASM STOP-Bang Questionnaire:** Validated 8-factor obstructive sleep apnea pre-test screener with 2-column responsive card grid, glowing letter avatars (`S`, `T`, `O`, `P`, `B`, `A`, `N`, `G`), and 1-click intake pre-population.
- **Epworth Sleepiness Scale (ESS):** Standardized 8-scenario daytime hypersomnolence index (0–24 scale) with real-time risk classification and intake synchronization.
- **Real-Time Cardiovascular Telemetry:** Live Mean Arterial Pressure (MAP) and Pulse Pressure ($PP = Sys - Dia$) calculations, dynamic AHA hypertension staging badge, and heart-rate synchronized SVG photoplethysmogram (PPG) pulse waveform animation.
- **Population Health Cohort Analytics:** Dashboard connected to `GET /api/analytics` rendering demographic distribution meters and patient percentile comparisons against the Kaggle Sleep Health reference cohort.
- **Universal Command Palette (`⌘K` / `Ctrl+K`):** Raycast-style fuzzy search palette for zero-latency keyboard navigation between workspaces, presets, and reports.
- **5-Tab Clinical Workspace:** Segmented navigation architecture supporting keyboard shortcuts (`1`–`5`) and URL deep-linking (`?tab=...`).
- **Comprehensive Automated Test Suite:** Suite 8 added covering STOP-Bang scoring rules, ESS somnolence staging, and cohort aggregation (45 tests across 8 suites, 100% pass rate).
- **GitHub Community Standards:** Added `.github/workflows/ci.yml`, issue templates, PR template, `.gitignore`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`.

### Changed
- Re-architected Express static file caching headers (`Cache-Control: no-cache, must-revalidate` for `.html`, `.css`, `.js`) to ensure instant client revalidation.
- Upgraded design tokens and dark obsidian glassmorphism matching Linear/Raycast design standards.

---

## [2.0.0] - 2026-10-18

### Added
- **Dual-Engine Architecture:** High-throughput Node.js Express REST API paired with client-side zero-latency Bayesian inference engine fallback.
- **Security & Hardening:** Express-rate-limit, Helmet Content Security Policies, and Zod physiological boundary validation.
- **Circadian Audio Studio:** Web Audio API binaural beat synthesizer (Theta/Delta waves) and 90-minute REM cycle calculator.
- **AASM Sleep Clinic Locator:** Geolocation search and filtering for accredited sleep medicine facilities.
- **Assessment History Store:** Thread-safe, deduplicating paginated history with JSON and CSV exports.

---

## [1.0.0] - Initial Release
- Basic sleep disorder prediction prototype based on the Kaggle Sleep Health and Lifestyle dataset.

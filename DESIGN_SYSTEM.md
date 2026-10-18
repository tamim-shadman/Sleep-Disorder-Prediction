# Design System Specification — SomnoPulse AI™ Design Language (v2.2)

**Design Philosophy:** Linear / Raycast / Vercel Craftsmanship meets AASM Clinical Precision  
**Target Atmosphere:** Deep Nocturnal Glassmorphism, Zero-Clutter High Density, Tactical Keyboard Ergonomics, and Mission-Critical Medical Telemetry  

---

## 1. Color Palette & Surface Tokens

### 1.1 Foundation & Background Surfaces
The color system moves away from flat slate backgrounds to deep, multi-layered obsidian and midnight hues with subtle light refraction:

- **`--bg-base`**: `#080c14` (Deep obsidian background)
- **`--bg-surface`**: `rgba(15, 23, 42, 0.72)` (Translucent clinical glass with `backdrop-filter: blur(16px)`)
- **`--bg-surface-elevated`**: `rgba(30, 41, 59, 0.85)` (Elevated modal, menu, and card hover surface)
- **`--bg-card`**: `rgba(15, 23, 42, 0.65)` (Standard card body)
- **`--border-subtle`**: `rgba(255, 255, 255, 0.08)` (1px structural border)
- **`--border-medium`**: `rgba(255, 255, 255, 0.16)` (Interactive active borders)
- **`--border-glow`**: `rgba(99, 102, 241, 0.35)` (Focused / active element glow)

### 1.2 Clinical Accent & Semantic Status Colors
Color in SomnoPulse AI is strictly semantic; neutral surfaces allow vital alerts to immediately draw the clinical eye:

- **Primary Brand Accent**:
  - `--accent-primary`: `#6366f1` (Indigo / Sleep Architecture)
  - `--accent-glow`: `#818cf8` (High-contrast active text & icons)
- **Secondary Atmospheric Accent**:
  - `--accent-cyan`: `#06b6d4` (Cardiovascular & Oxygenation Telemetry)
  - `--accent-emerald`: `#10b981` (Optimal Physiological State / Class 0 Healthy)
  - `--accent-amber`: `#f59e0b` (Autonomic Strain / Class 1 Insomnia Warning)
  - `--accent-rose`: `#f43f5e` (Severe Airway Obstruction / Class 2 Apnea Crisis)
  - `--accent-purple`: `#a855f7` (Circadian REM & Sleep Cycle Phase)

---

## 2. Typography & Numerical Precision

- **Font Family Primary**: `Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Font Family Monospace**: `"JetBrains Mono", "SF Mono", Menlo, Consolas, Monaco, monospace`
- **Tabular Figures**: Every clinical vital (heart rate, blood pressure, sleep score, percentages) utilizes:
  ```css
  font-feature-settings: "tnum" 1, "cv02" 1, "cv03" 1, "cv04" 1;
  font-variant-numeric: tabular-nums;
  ```
  This eliminates spatial jumping and horizontal jitter when values update in real time.

---

## 3. Component Architecture & Conventions

### 3.1 Universal Command Palette (`⌘K` / `Ctrl+K`)
- Floating modal centered horizontally with `top: 15vh`, max width `640px`.
- Backdrop: `rgba(0, 0, 0, 0.7)` with `backdrop-filter: blur(12px)`.
- Input field: Auto-focused, borderless, with search icon and clear button.
- Categorized action list: Quick Navigation, Clinical Presets, Diagnostic Screeners, System Actions.
- Key navigation: `ArrowUp`, `ArrowDown`, `Enter` to select, `Escape` to close.

### 3.2 Tabbed Clinical Workspace
- Sticky segmented bar below the navigation header:
  - Tab 1: **Diagnostic Intake** (11-Biomarker Bayesian Classifier)
  - Tab 2: **Clinical Screeners** (STOP-Bang & Epworth Sleepiness Scale)
  - Tab 3: **Cohort Health Analytics** (Population Telemetry & Percentile Radar)
  - Tab 4: **Circadian & Audio Studio** (REM Cycles & Sleep Ambience)
  - Tab 5: **Care Network** (Accredited Sleep Centers Directory)
- Indicator: Crisp 2px active bottom bar in `--accent-primary` with smooth transition.

### 3.3 Real-Time Cardiovascular Telemetry Card
- Real-time computation of:
  - Mean Arterial Pressure ($MAP = \frac{2 \times Dia + Sys}{3}$)
  - Pulse Pressure ($PP = Sys - Dia$)
  - Animated SVG Photoplethysmography (PPG) pulse waveform matching the selected heart rate.
  - AHA Hypertension Staging Badge with pulsing status dot.

### 3.4 Standardized Screener Components (STOP-Bang & ESS)
- High-contrast segmented switch buttons (`Yes` / `No` for STOP-Bang; `0` to `3` for ESS).
- Live score counter and immediate risk tier badge.
- One-click "Apply to Intake Form" action that seamlessly pre-populates relevant sliders.

---

## 4. Responsive Breakpoints & Accessibility (WCAG 2.2 AA)

- **Mobile Viewports (< 640px):** Single-column layout, horizontal scrolling tab bar with drag support, touch-optimized input hit targets (minimum $44 \times 44\text{px}$).
- **Tablet Viewports (640px – 1024px):** 2-column grid for vitals; persistent sticky quick action bar.
- **Desktop & Widescreen (> 1024px):** 3-column dense clinical cockpit, dual-polygon radar chart side-by-side with Bayesian probability stratification.
- **Accessibility Safeguards:**
  - Full keyboard operability for all controls.
  - Visible 2px outline focus indicators (`outline: 2px solid var(--accent-glow); outline-offset: 2px;`).
  - High color contrast ratio exceeding 4.5:1 for body copy and 3.0:1 for large headings.
  - `prefers-reduced-motion` media queries disabling animations and smooth scrolls for sensitive users.

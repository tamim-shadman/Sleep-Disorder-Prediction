/**
 * SomnoPulse AI - Master Frontend Controller v2.0.0
 * Architecture: Linear / Stripe / Vercel Grade Craftsmanship
 */

import { ClientInferenceEngine } from './engine.js';
import { ChartRenderer } from './charts.js';
import { ClinicLocator } from './clinic-locator.js';
import { SleepAudioSynthesizer } from './audio-synth.js';

class SomnoPulseApp {
  constructor() {
    this.currentTheme = localStorage.getItem('somnopulse_theme') || 'dark';
    this.soundEnabled = localStorage.getItem('somnopulse_sound') !== 'false';
    this.assessmentsHistory = this.loadLocalHistory();
    this.lastResult = null;
    this.userCoords = null;
    this.audioSynth = new SleepAudioSynthesizer();
    this.calcMode = 'bedtime'; // 'bedtime' (wake times) or 'waketime' (bedtimes)
    this.isSubmitting = false;
    this.stopBangAnswers = {
      snoring: 0, tired: 0, observed: 0, pressure: 0, bmi: 0, age: 0, neck: 0, gender: 0
    };
    this.essAnswers = Array(8).fill(0);
    this.commandPaletteOpen = false;
    this.selectedCommandIndex = 0;
    this.commandsList = [];
    this.clinicsLoaded = false;

    this.initTheme();
    this.bindEvents();
    this.initCommandPalette();
    this.initWorkspaceTabs();
    this.initCardiovascularTelemetry();
    this.initStopBangScreener();
    this.initEpworthSleepinessScale();
    this.initCohortAnalytics();
    this.initLiveCalculations();
    this.initSleepCycleCalculator();
    this.initAudioSynthesizerUI();
    this.parseUrlParameters();
    this.syncHistoryWithServer();
  }

  parseUrlParameters() {
    try {
      const params = new URLSearchParams(window.location.search);
      const duration = params.get('duration');
      const quality = params.get('quality');
      const stress = params.get('stress');

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== null && !isNaN(parseFloat(val))) {
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };

      if (duration) setVal('sleepDuration', duration);
      if (quality) setVal('sleepQuality', quality);
      if (stress) setVal('stressLevel', stress);

      const tab = params.get('tab');
      if (tab) {
        this.switchTab(tab);
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }

  /* ==========================================================================
     Theme Management
     ========================================================================== */
  initTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.innerHTML = this.currentTheme === 'dark' 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('somnopulse_theme', this.currentTheme);
    this.initTheme();
    if (this.lastResult) {
      this.renderCharts(this.lastResult);
    }
  }

  /* ==========================================================================
     Chimes & Feedback
     ========================================================================== */
  playChime(type = 'success') {
    if (!this.soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(329.63, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }

  /* ==========================================================================
     Event Binding
     ========================================================================== */
  bindEvents() {
    // Theme Button
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Prediction Form Submission
    const form = document.getElementById('predictionForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });

      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          this.handleSubmit();
        }
      });
    }

    // Presets Bar
    const presetChips = document.querySelectorAll('.preset-chip');
    presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const presetId = chip.dataset.preset;
        this.loadPreset(presetId);
        presetChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    // Blood Pressure input
    const bpInput = document.getElementById('bloodPressure');
    if (bpInput) {
      bpInput.addEventListener('input', () => this.updateBloodPressureEvaluation());
    }

    // Clinic Finder Button
    const findClinicsBtn = document.getElementById('findClinicsBtn');
    if (findClinicsBtn) {
      findClinicsBtn.addEventListener('click', () => this.handleClinicSearch());
    }

    // Export PDF Report
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const printDateEl = document.getElementById('printDate');
        if (printDateEl) printDateEl.textContent = dateStr;
        const attestationDateEl = document.getElementById('attestationDate');
        if (attestationDateEl) attestationDateEl.textContent = now.toLocaleDateString('en-US');
        const printRecordId = document.getElementById('printRecordId');
        if (printRecordId && this.lastResult) {
          printRecordId.textContent = this.lastResult.assessmentId || ('ASM-' + Math.random().toString(36).substring(2, 9).toUpperCase());
        }
        window.print();
      });
    }

    // Export JSON Report
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => this.exportJsonReport());
    }

    // Export CSV History
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        window.location.href = '/api/history/export/csv';
      });
    }

    // Quick Screener on Landing Page
    const quickScreenerForm = document.getElementById('quickScreenerForm');
    if (quickScreenerForm) {
      quickScreenerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleQuickScreener();
      });
    }
  }

  /* ==========================================================================
     Real-Time Sliders and Vitals Binding
     ========================================================================== */
  initLiveCalculations() {
    const bindSlider = (sliderId, labelId, formatFn) => {
      const slider = document.getElementById(sliderId);
      const label = document.getElementById(labelId);
      if (slider && label) {
        const update = () => {
          label.textContent = formatFn ? formatFn(slider.value) : slider.value;
          slider.setAttribute('aria-valuenow', slider.value);
        };
        slider.addEventListener('input', update);
        update();
      }
    };

    bindSlider('sleepDuration', 'sleepDurationVal', val => `${parseFloat(val).toFixed(1)} hrs`);
    bindSlider('sleepQuality', 'sleepQualityVal', val => `${val} / 10`);
    bindSlider('physicalActivity', 'physicalActivityVal', val => `${val} mins`);
    bindSlider('stressLevel', 'stressLevelVal', val => `${val} / 10`);

    this.updateBloodPressureEvaluation();
  }

  updateBloodPressureEvaluation() {
    const bpInput = document.getElementById('bloodPressure');
    const badge = document.getElementById('bpStatusBadge');
    if (!bpInput || !badge) return;

    const { systolic, diastolic, valid } = ClientInferenceEngine.parseBloodPressure(bpInput.value);
    if (!valid || systolic < diastolic + 15) {
      badge.textContent = 'Format: 120/80 (Sys - Dia >= 15)';
      badge.className = 'bp-status-badge bp-elevated';
      return;
    }

    const bpInfo = ClientInferenceEngine.evaluateBloodPressureCategory(systolic, diastolic);
    const map = Math.round(((2 * diastolic) + systolic) / 3);
    const pp = systolic - diastolic;
    badge.textContent = `${bpInfo.category} (MAP: ${map} mmHg, PP: ${pp} mmHg)`;
    badge.className = `bp-status-badge ${bpInfo.alertClass}`;
  }

  /* ==========================================================================
     Preset Profiles
     ========================================================================== */
  loadPreset(presetId) {
    const presets = {
      optimal: {
        age: 28,
        sleepDuration: 8.0,
        sleepQuality: 9,
        physicalActivity: 70,
        stressLevel: 3,
        heartRate: 64,
        dailySteps: 8500,
        gender: 'Male',
        occupation: 'Software Engineer',
        bmiCategory: 'Normal weight',
        bloodPressure: '118/76'
      },
      insomnia: {
        age: 38,
        sleepDuration: 5.2,
        sleepQuality: 4,
        physicalActivity: 30,
        stressLevel: 8,
        heartRate: 82,
        dailySteps: 4200,
        gender: 'Female',
        occupation: 'Sales Representative',
        bmiCategory: 'Normal weight',
        bloodPressure: '126/82'
      },
      apnea: {
        age: 54,
        sleepDuration: 6.0,
        sleepQuality: 4,
        physicalActivity: 40,
        stressLevel: 6,
        heartRate: 78,
        dailySteps: 5100,
        gender: 'Male',
        occupation: 'Manager',
        bmiCategory: 'Overweight',
        bloodPressure: '142/92'
      },
      shift: {
        age: 46,
        sleepDuration: 5.8,
        sleepQuality: 5,
        physicalActivity: 80,
        stressLevel: 7,
        heartRate: 75,
        dailySteps: 9200,
        gender: 'Female',
        occupation: 'Nurse',
        bmiCategory: 'Overweight',
        bloodPressure: '135/88'
      }
    };

    const data = presets[presetId];
    if (!data) return;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    setVal('age', data.age);
    setVal('sleepDuration', data.sleepDuration);
    setVal('sleepQuality', data.sleepQuality);
    setVal('physicalActivity', data.physicalActivity);
    setVal('stressLevel', data.stressLevel);
    setVal('heartRate', data.heartRate);
    setVal('dailySteps', data.dailySteps);
    setVal('gender', data.gender);
    setVal('occupation', data.occupation);
    setVal('bmiCategory', data.bmiCategory);
    setVal('bloodPressure', data.bloodPressure);

    this.updateBloodPressureEvaluation();
    this.playChime('neutral');
  }

  /* ==========================================================================
     Submission & Hybrid Prediction Execution
     ========================================================================== */
  async handleSubmit() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const submitBtn = document.getElementById('predictSubmitBtn');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Predict';

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M4 12a8 8 0 0 1 8-8"></path>
          </svg>
          Analyzing Clinical Biomarkers...
        `;
      }

      const formData = {
        age: parseFloat(document.getElementById('age')?.value) || 30,
        sleep_duration: parseFloat(document.getElementById('sleepDuration')?.value) || 7.0,
        quality_of_sleep: parseFloat(document.getElementById('sleepQuality')?.value) || 7,
        physical_activity_level: parseFloat(document.getElementById('physicalActivity')?.value) || 50,
        stress_level: parseFloat(document.getElementById('stressLevel')?.value) || 5,
        heart_rate: parseFloat(document.getElementById('heartRate')?.value) || 70,
        daily_steps: parseFloat(document.getElementById('dailySteps')?.value) || 7000,
        gender: document.getElementById('gender')?.value || 'Male',
        occupation: document.getElementById('occupation')?.value || 'Professional',
        bmi_category: document.getElementById('bmiCategory')?.value || 'Normal weight',
        blood_pressure: document.getElementById('bloodPressure')?.value?.trim() || '120/80'
      };

      // Validate blood pressure
      const bpCheck = ClientInferenceEngine.parseBloodPressure(formData.blood_pressure);
      if (!bpCheck.valid || bpCheck.systolic < bpCheck.diastolic + 15) {
        alert('Please enter a physiologically valid Blood Pressure in format Systolic/Diastolic (e.g. 120/80). Systolic must exceed diastolic by at least 15 mmHg.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        this.isSubmitting = false;
        return;
      }

      // Hybrid prediction execution
      let result = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          result = await response.json();
        }
      } catch (err) {
        console.warn('Backend server unreachable, executing zero-latency client inference:', err.message);
      }

      // Offline client fallback
      if (!result || !result.probabilities) {
        result = ClientInferenceEngine.predict(formData);
      }

      this.lastResult = { ...result, input: formData };
      this.saveLocalAssessment(this.lastResult);
      this.renderResults(this.lastResult);
      this.playChime('success');

      // Accessibility screen-reader announcement
      const announcer = document.getElementById('a11yAnnouncer');
      if (announcer) {
        announcer.textContent = `Assessment complete. Primary prediction: ${result.label}. Sleep score: ${result.sleepScore} out of 100.`;
      }

      // Smooth scroll to results
      const resultsEl = document.getElementById('resultsContainer');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

    } catch (e) {
      console.error('Fatal assessment error:', e);
      alert('An error occurred while evaluating health metrics. Please verify inputs.');
    } finally {
      this.isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    }
  }

  /* ==========================================================================
     Results Rendering
     ========================================================================== */
  renderResults(result) {
    const container = document.getElementById('resultsContainer');
    if (!container) return;

    container.style.display = 'block';

    // 1. Hero Card
    const heroCard = document.getElementById('diagnosisHeroCard');
    const pill = document.getElementById('diagnosisPill');
    const heading = document.getElementById('diagnosisHeading');
    const desc = document.getElementById('diagnosisDesc');
    const scoreVal = document.getElementById('sleepScoreValue');

    if (heroCard) heroCard.className = `diagnosis-hero-card ${result.themeClass || 'healthy'}`;
    if (pill) {
      pill.textContent = result.severity || 'Evaluation Result';
      pill.className = `diagnosis-pill ${result.themeClass || 'healthy'}`;
    }
    if (heading) heading.textContent = result.label;
    if (desc) {
      if (result.sleep_disorder === 0) {
        desc.textContent = 'Your clinical metrics demonstrate a restorative sleep routine, normal cardiovascular baseline, and balanced autonomic stress regulation.';
      } else if (result.sleep_disorder === 1) {
        desc.textContent = 'Symptoms indicative of chronic insomnia: elevated autonomic stress, reduced sleep duration, and micro-awakenings impacting restorative sleep cycles.';
      } else {
        desc.textContent = 'Elevated clinical markers consistent with Obstructive Sleep Apnea (OSA): elevated blood pressure and BMI contributing to nocturnal airway resistance.';
      }
    }
    if (scoreVal) scoreVal.textContent = result.sleepScore || 85;

    // 2. Probability Bar
    const segHealthy = document.getElementById('segHealthy');
    const segInsomnia = document.getElementById('segInsomnia');
    const segApnea = document.getElementById('segApnea');
    const pctHealthy = document.getElementById('pctHealthy');
    const pctInsomnia = document.getElementById('pctInsomnia');
    const pctApnea = document.getElementById('pctApnea');

    const p = result.probabilities || { healthy: 60, insomnia: 20, sleep_apnea: 20 };
    if (segHealthy) segHealthy.style.width = `${p.healthy}%`;
    if (segInsomnia) segInsomnia.style.width = `${p.insomnia}%`;
    if (segApnea) segApnea.style.width = `${p.sleep_apnea}%`;

    if (pctHealthy) pctHealthy.textContent = `${p.healthy}%`;
    if (pctInsomnia) pctInsomnia.textContent = `${p.insomnia}%`;
    if (pctApnea) pctApnea.textContent = `${p.sleep_apnea}%`;

    // 3. Render Canvas Charts (Dual-Polygon Radar & Gauge)
    this.renderCharts(result);

    // 4. Clinical Findings / Risk Factors
    const findingsList = document.getElementById('findingsList');
    if (findingsList) {
      let html = '';
      if (result.riskFactors && result.riskFactors.length > 0) {
        result.riskFactors.forEach(rf => {
          html += `
            <div class="finding-item">
              <div class="finding-icon risk">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <div class="finding-content">
                <h4>${rf.metric}: ${rf.finding}</h4>
                <p>${rf.impact}</p>
              </div>
            </div>
          `;
        });
      }
      if (result.positiveFactors && result.positiveFactors.length > 0) {
        result.positiveFactors.forEach(pf => {
          html += `
            <div class="finding-item">
              <div class="finding-icon positive">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div class="finding-content">
                <h4>Physiological Protector</h4>
                <p>${pf}</p>
              </div>
            </div>
          `;
        });
      }
      findingsList.innerHTML = html;
    }

    // 5. Actionable Recommendations
    const recsList = document.getElementById('recommendationsList');
    if (recsList && result.recommendations) {
      recsList.innerHTML = result.recommendations.map(r => `
        <div class="rec-card">
          <div class="rec-header">
            <span class="rec-title">${r.title}</span>
            <span class="rec-badge">${r.priority} Priority</span>
          </div>
          <p class="rec-desc">${r.detail}</p>
        </div>
      `).join('');
    }

    // 6. Sleep Debt
    this.updateSleepDebtWithDuration(result.biomarkers?.sleepDuration || 7);

    // 7. Population Health Percentile Benchmark
    if (result.sleepScore) {
      this.updatePatientPercentile(result.sleepScore);
    }
  }

  renderCharts(result) {
    // 1. Dual-Polygon Radar Chart
    const radarCanvas = document.getElementById('radarChartCanvas');
    if (radarCanvas) {
      const b = result.biomarkers || {};
      const bp = b.bloodPressure || { systolic: 120 };
      ChartRenderer.drawRadarChart(radarCanvas, {
        sleepDuration: b.sleepDuration || 7,
        sleepQuality: b.sleepQuality || 7,
        physicalActivity: parseFloat(document.getElementById('physicalActivity')?.value) || 50,
        stressLevel: b.stressLevel || 5,
        heartRate: b.heartRate || 70,
        systolic: bp.systolic || 120
      });
    }

    // 2. Score Gauge
    const gaugeCanvas = document.getElementById('scoreGaugeCanvas');
    if (gaugeCanvas) {
      ChartRenderer.drawScoreGauge(gaugeCanvas, result.sleepScore || 85);
    }
  }

  /* ==========================================================================
     Dual-Mode Sleep Cycle Calculator
     ========================================================================== */
  initSleepCycleCalculator() {
    const calcBtn = document.getElementById('calcCyclesBtn');
    const modeBtn = document.getElementById('toggleCalcModeBtn');

    if (modeBtn) {
      modeBtn.addEventListener('click', () => {
        this.calcMode = this.calcMode === 'bedtime' ? 'waketime' : 'bedtime';
        const label = document.getElementById('calcTimeLabel');
        if (label) {
          label.textContent = this.calcMode === 'bedtime' ? 'Target Bedtime:' : 'Target Wake-up Time:';
        }
        modeBtn.textContent = this.calcMode === 'bedtime' 
          ? 'Switch to: Calculate Bedtime based on Wake Time' 
          : 'Switch to: Calculate Wake Time based on Bedtime';
        this.runCycleCalculation();
      });
    }

    if (calcBtn) {
      calcBtn.addEventListener('click', () => this.runCycleCalculation());
      this.runCycleCalculation();
    }
  }

  runCycleCalculation() {
    const inputEl = document.getElementById('calcBedtime');
    const timeVal = inputEl ? inputEl.value || '23:00' : '23:00';
    const container = document.getElementById('wakeCyclesList');
    if (!container) return;

    const [hours, minutes] = timeVal.split(':').map(Number);
    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);

    const cycles = [4, 5, 6]; // 6 hrs, 7.5 hrs, 9 hrs
    const results = [];

    if (this.calcMode === 'bedtime') {
      // Calculate wake times: Bedtime + 15m latency + (cycles * 90m)
      const sleepStart = new Date(targetDate.getTime() + 15 * 60 * 1000);
      cycles.forEach(c => {
        const wakeTime = new Date(sleepStart.getTime() + c * 90 * 60 * 1000);
        results.push({
          label: wakeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hours: (c * 1.5).toFixed(1),
          cycles: c,
          optimal: c === 5
        });
      });
    } else {
      // Calculate bedtimes in reverse: Wake Time - 15m latency - (cycles * 90m)
      cycles.forEach(c => {
        const bedTime = new Date(targetDate.getTime() - 15 * 60 * 1000 - c * 90 * 60 * 1000);
        results.push({
          label: bedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hours: (c * 1.5).toFixed(1),
          cycles: c,
          optimal: c === 5
        });
      });
    }

    container.innerHTML = results.map(t => `
      <div style="padding: 0.85rem 1.1rem; border-radius: var(--radius-md); background: ${t.optimal ? 'rgba(99, 102, 241, 0.16)' : 'var(--bg-surface)'}; border: 1px solid ${t.optimal ? 'var(--accent-primary)' : 'var(--border-subtle)'}; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <strong style="font-size: 1.15rem; font-family: var(--font-mono); color: ${t.optimal ? 'var(--accent-glow)' : 'var(--text-primary)'};">${t.label}</strong>
          <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.6rem;">(${t.hours} hrs &bull; ${t.cycles} ultradian cycles)</span>
        </div>
        ${t.optimal ? '<span style="font-size: 0.7rem; font-weight: 700; background: var(--accent-primary); color: white; padding: 0.2rem 0.6rem; border-radius: 4px; letter-spacing: 0.05em;">RECOMMENDED</span>' : ''}
      </div>
    `).join('');
  }

  updateSleepDebtWithDuration(duration) {
    const debtEl = document.getElementById('sleepDebtValue');
    const optimalPerNight = 8.0;
    const weeklyDebt = Math.round((optimalPerNight - duration) * 7 * 10) / 10;
    if (debtEl) {
      if (weeklyDebt > 0) {
        debtEl.textContent = `+${weeklyDebt} hrs accumulated debt`;
        debtEl.style.color = 'var(--accent-rose)';
      } else {
        debtEl.textContent = '0 hrs (Optimal physiological restoration)';
        debtEl.style.color = 'var(--accent-emerald)';
      }
    }
  }

  /* ==========================================================================
     Sleep Relaxation Audio Synthesizer UI
     ========================================================================== */
  initAudioSynthesizerUI() {
    const playBtn = document.getElementById('synthPlayBtn');
    const modeSelect = document.getElementById('synthModeSelect');
    const volSlider = document.getElementById('synthVolSlider');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (this.audioSynth.isPlaying) {
          this.audioSynth.stop();
          playBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Play Sleep Ambiance
          `;
          playBtn.className = 'btn btn-secondary btn-sm';
        } else {
          const mode = modeSelect ? modeSelect.value : 'brown';
          this.audioSynth.play(mode, 30);
          playBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            Pause Ambient Audio
          `;
          playBtn.className = 'btn btn-primary btn-sm';
        }
      });
    }

    if (modeSelect) {
      modeSelect.addEventListener('change', () => {
        this.audioSynth.setMode(modeSelect.value);
      });
    }

    if (volSlider) {
      volSlider.addEventListener('input', () => {
        this.audioSynth.setVolume(parseFloat(volSlider.value));
      });
    }
  }

  /* ==========================================================================
     Quick Screener on Landing Page
     ========================================================================== */
  handleQuickScreener() {
    const sleepDuration = parseFloat(document.getElementById('qsDuration')?.value) || 7.0;
    const sleepQuality = parseFloat(document.getElementById('qsQuality')?.value) || 7;
    const stress = parseFloat(document.getElementById('qsStress')?.value) || 5;

    const res = ClientInferenceEngine.predict({
      age: 30,
      sleep_duration: sleepDuration,
      quality_of_sleep: sleepQuality,
      physical_activity_level: 50,
      stress_level: stress,
      heart_rate: 70,
      daily_steps: 7000,
      gender: 'Male',
      occupation: 'Professional',
      bmi_category: 'Normal weight',
      blood_pressure: '120/80'
    });

    const resultBox = document.getElementById('qsResultBox');
    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="padding: 1.25rem; border-radius: var(--radius-md); background: ${res.themeClass === 'healthy' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}; border: 1px solid ${res.themeClass === 'healthy' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'};">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <strong style="font-size: 1.1rem; color: var(--text-primary);">${res.label}</strong>
            <span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan);">Sleep Score: ${res.sleepScore}/100</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
            Estimated Probability: <strong>${res.probabilities[res.themeClass === 'sleep-apnea' ? 'sleep_apnea' : res.themeClass]}%</strong>
          </p>
          <a href="prediction.html?duration=${sleepDuration}&quality=${sleepQuality}&stress=${stress}#mainContent" class="btn btn-primary btn-sm">Proceed to Complete 11-Biomarker Intake &rarr;</a>
        </div>
      `;
    }
  }

  /* ==========================================================================
     Clinic Locator
     ========================================================================== */
  async handleClinicSearch() {
    const btn = document.getElementById('findClinicsBtn');
    const container = document.getElementById('clinicsList');
    if (!container) return;

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Locating Accredited Centers...';
    }

    try {
      let lat = null;
      let lng = null;
      try {
        const coords = await ClinicLocator.requestUserLocation();
        lat = coords.lat;
        lng = coords.lng;
        this.userCoords = coords;
      } catch (locErr) {
        console.warn('Geolocation denied or unavailable:', locErr.message);
      }

      const clinics = await ClinicLocator.fetchClinics(lat, lng);
      const mapsUrl = ClinicLocator.getGoogleMapsSearchUrl(lat, lng, 'sleep disorder medical center');

      let html = clinics.map(c => `
        <div class="clinic-card">
          <div class="clinic-header">
            <div>
              <div class="clinic-name">${c.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${c.specialty}</div>
            </div>
            ${c.distanceText ? `<span class="clinic-dist">${c.distanceText}</span>` : ''}
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary);">
            📍 ${c.address} &bull; 📞 ${c.phone}
          </div>
          <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name + ' ' + c.address)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">Get Directions</a>
            <a href="tel:${c.phone}" class="btn btn-ghost btn-sm">Call Center</a>
          </div>
        </div>
      `).join('');

      html += `
        <div style="text-align: center; margin-top: 1rem;">
          <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            Explore All Nearby Facilities on Google Maps &rarr;
          </a>
        </div>
      `;

      container.innerHTML = html;
    } catch (e) {
      console.error('Error fetching clinics:', e);
      container.innerHTML = `<p style="color: var(--accent-rose); font-size: 0.85rem;">Could not locate facilities automatically. <a href="https://www.google.com/maps/search/sleep+disorder+clinic" target="_blank" rel="noopener noreferrer">Search on Google Maps</a></p>`;
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Refresh Nearby Facilities';
      }
    }
  }

  /* ==========================================================================
     History & Sync
     ========================================================================== */
  loadLocalHistory() {
    try {
      const data = localStorage.getItem('somnopulse_history');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveLocalAssessment(result) {
    const item = {
      id: result.assessmentId || 'asm_' + Date.now().toString(36),
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      label: result.label,
      score: result.sleepScore,
      themeClass: result.themeClass,
      probabilities: result.probabilities
    };
    this.assessmentsHistory.unshift(item);
    if (this.assessmentsHistory.length > 30) {
      this.assessmentsHistory = this.assessmentsHistory.slice(0, 30);
    }
    localStorage.setItem('somnopulse_history', JSON.stringify(this.assessmentsHistory));
    this.renderHistory();
  }

  async syncHistoryWithServer() {
    try {
      const res = await fetch('/api/history?limit=10');
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const serverItems = data.items.map(r => ({
            id: r.id,
            date: new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            label: r.prediction?.label || 'Assessment',
            score: r.prediction?.sleepScore || 70,
            themeClass: (r.prediction?.label || '').toLowerCase().includes('insomnia') ? 'insomnia' : (r.prediction?.label || '').toLowerCase().includes('apnea') ? 'sleep-apnea' : 'healthy',
            probabilities: r.prediction?.probabilities
          }));
          // Merge server items with local assessments without overwriting unsaved local items
          const map = new Map();
          serverItems.forEach(item => map.set(item.id, item));
          this.assessmentsHistory.forEach(item => {
            if (!map.has(item.id)) {
              map.set(item.id, item);
            }
          });
          this.assessmentsHistory = Array.from(map.values()).slice(0, 30);
          localStorage.setItem('somnopulse_history', JSON.stringify(this.assessmentsHistory));
          this.renderHistory();
        }
      }
    } catch (e) {
      this.renderHistory();
    }
  }

  async deleteHistoryItem(id) {
    if (!window.confirm('Are you sure you want to remove this assessment from your clinical history?')) {
      return;
    }
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
    } catch (e) {}
    this.assessmentsHistory = this.assessmentsHistory.filter(i => i.id !== id);
    localStorage.setItem('somnopulse_history', JSON.stringify(this.assessmentsHistory));
    this.renderHistory();
  }

  renderHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;

    if (this.assessmentsHistory.length === 0) {
      list.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 1rem;">No prior assessments recorded.</p>`;
      return;
    }

    list.innerHTML = this.assessmentsHistory.map(item => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-bottom: 1px solid var(--border-subtle); font-size: 0.85rem;">
        <div>
          <strong style="color: var(--text-primary);">${item.label}</strong>
          <div style="color: var(--text-muted); font-size: 0.75rem;">${item.date}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan);">
            Score: ${item.score}
          </span>
          <button type="button" class="btn btn-ghost btn-sm" style="color: var(--accent-rose); padding: 0.2rem 0.5rem;" title="Delete" data-del-id="${item.id}">
            &times;
          </button>
        </div>
      </div>
    `).join('');

    // Bind delete buttons
    list.querySelectorAll('[data-del-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.deleteHistoryItem(btn.dataset.delId);
      });
    });
  }

  exportJsonReport() {
    if (!this.lastResult) {
      this.showToast('Please perform an assessment before exporting.', 'warning');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.lastResult, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `SomnoPulse_Clinical_Report_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    this.showToast('Exported complete JSON report', 'success');
  }

  /* ==========================================================================
     Toast Notifications
     ========================================================================== */
  showToast(message, type = 'info') {
    let toast = document.getElementById('somnoToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'somnoToast';
      toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 9999;
        padding: 0.75rem 1.25rem;
        border-radius: var(--radius-md);
        background: var(--bg-surface);
        border: 1px solid var(--border-medium);
        color: var(--text-primary);
        font-size: 0.88rem;
        font-weight: 500;
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: 0.6rem;
        transform: translateY(20px);
        opacity: 0;
        transition: all var(--transition-normal);
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }

    const iconColor = type === 'success' ? 'var(--accent-emerald)' : type === 'warning' ? 'var(--accent-amber)' : 'var(--accent-glow)';
    toast.innerHTML = `
      <span style="color: ${iconColor}; font-weight: 800;">●</span>
      <span>${message}</span>
    `;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
    }, 2800);
  }

  /* ==========================================================================
     Universal Command Palette (Raycast / Linear Style)
     ========================================================================== */
  initCommandPalette() {
    this.commandsList = [
      { id: 'tab-intake', title: 'Switch to Diagnostic Intake Cockpit', category: 'Navigation', shortcut: '1', action: () => this.switchTab('intake') },
      { id: 'tab-screeners', title: 'Open Clinical Screeners (STOP-Bang & ESS)', category: 'Navigation', shortcut: '2', action: () => this.switchTab('screeners') },
      { id: 'tab-analytics', title: 'View Population Cohort Health Analytics', category: 'Navigation', shortcut: '3', action: () => this.switchTab('analytics') },
      { id: 'tab-studio', title: 'Open Circadian & Audio Studio', category: 'Navigation', shortcut: '4', action: () => this.switchTab('studio') },
      { id: 'tab-clinics', title: 'Find Accredited Sleep Medicine Centers', category: 'Navigation', shortcut: '5', action: () => this.switchTab('clinics') },
      { id: 'home', title: 'Return to Platform Home', category: 'Navigation', shortcut: 'H', action: () => { window.location.href = 'Index.html'; } },

      { id: 'preset-optimal', title: 'Load Preset: Optimal Baseline Profile', category: 'Clinical Presets', shortcut: 'P1', action: () => { this.switchTab('intake'); this.loadPreset('optimal'); this.showToast('Loaded Optimal Baseline Profile', 'success'); } },
      { id: 'preset-insomnia', title: 'Load Preset: High-Stress Insomnia Profile', category: 'Clinical Presets', shortcut: 'P2', action: () => { this.switchTab('intake'); this.loadPreset('insomnia'); this.showToast('Loaded High-Stress Insomnia Profile', 'warning'); } },
      { id: 'preset-apnea', title: 'Load Preset: Obstructive Sleep Apnea Risk', category: 'Clinical Presets', shortcut: 'P3', action: () => { this.switchTab('intake'); this.loadPreset('apnea'); this.showToast('Loaded Sleep Apnea Risk Profile', 'warning'); } },
      { id: 'preset-shift', title: 'Load Preset: Night Shift Healthcare Worker', category: 'Clinical Presets', shortcut: 'P4', action: () => { this.switchTab('intake'); this.loadPreset('shift'); this.showToast('Loaded Night Shift Profile', 'info'); } },

      { id: 'action-predict', title: 'Run Clinical Assessment & Risk Stratification', category: 'Diagnostic Actions', shortcut: 'Ctrl+↵', action: () => { this.switchTab('intake'); this.handleSubmit(); } },
      { id: 'action-print', title: 'Print Clinical Dossier & Physician Attestation', category: 'Diagnostic Actions', shortcut: 'P', action: () => { window.print(); } },
      { id: 'action-json', title: 'Export Clinical Assessment (JSON Report)', category: 'Export Tools', shortcut: 'J', action: () => this.exportJsonReport() },
      { id: 'action-csv', title: 'Download Full Assessment History (CSV Dataset)', category: 'Export Tools', shortcut: 'C', action: () => { window.location.href = '/api/history/export/csv'; } },
      { id: 'action-theme', title: 'Toggle Dark / Light Visual Theme', category: 'Preferences', shortcut: 'T', action: () => this.toggleTheme() },
      { id: 'action-audio', title: 'Play / Pause Deep Sleep Ambience', category: 'Sound Studio', shortcut: 'M', action: () => {
        const playBtn = document.getElementById('synthPlayBtn');
        if (playBtn) playBtn.click();
      }}
    ];

    const openBtn = document.getElementById('openCommandPaletteBtn');
    if (openBtn) {
      openBtn.addEventListener('click', () => this.openCommandPalette());
    }

    const backdrop = document.getElementById('commandPaletteModal');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeCommandPalette();
      });
    }

    const searchInput = document.getElementById('commandSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.renderCommandItems(searchInput.value.trim().toLowerCase()));
      searchInput.addEventListener('keydown', (e) => this.handleCommandKeydown(e));
    }

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggleCommandPalette();
      } else if (e.key === 'Escape' && this.commandPaletteOpen) {
        e.preventDefault();
        this.closeCommandPalette();
      }
    });

    this.renderCommandItems('');
  }

  toggleCommandPalette() {
    if (this.commandPaletteOpen) {
      this.closeCommandPalette();
    } else {
      this.openCommandPalette();
    }
  }

  openCommandPalette() {
    const modal = document.getElementById('commandPaletteModal');
    const input = document.getElementById('commandSearchInput');
    if (modal && input) {
      this.commandPaletteOpen = true;
      modal.classList.add('active');
      input.value = '';
      this.selectedCommandIndex = 0;
      this.renderCommandItems('');
      setTimeout(() => input.focus(), 60);
    }
  }

  closeCommandPalette() {
    const modal = document.getElementById('commandPaletteModal');
    if (modal) {
      this.commandPaletteOpen = false;
      modal.classList.remove('active');
    }
  }

  renderCommandItems(query = '') {
    const list = document.getElementById('commandItemsList');
    if (!list) return;

    const filtered = this.commandsList.filter(c => 
      !query || c.title.toLowerCase().includes(query) || c.category.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      list.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.88rem;">No matching commands found.</div>`;
      return;
    }

    const groups = {};
    filtered.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });

    let html = '';
    let flatIndex = 0;
    for (const [category, items] of Object.entries(groups)) {
      html += `<div class="command-group-heading">${category}</div>`;
      items.forEach(item => {
        const isSelected = flatIndex === this.selectedCommandIndex;
        html += `
          <div class="command-item ${isSelected ? 'selected' : ''}" data-cmd-idx="${flatIndex}" data-cmd-id="${item.id}" role="option" aria-selected="${isSelected}">
            <div class="command-item-left">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent-glow);"><polyline points="9 18 15 12 9 6"></polyline></svg>
              <span>${item.title}</span>
            </div>
            ${item.shortcut ? `<span class="command-kbd">${item.shortcut}</span>` : ''}
          </div>
        `;
        flatIndex++;
      });
    }

    list.innerHTML = html;

    list.querySelectorAll('.command-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.cmdIdx, 10);
        this.executeCommandByIndex(filtered, idx);
      });
    });
  }

  handleCommandKeydown(e) {
    const searchInput = document.getElementById('commandSearchInput');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const filtered = this.commandsList.filter(c => 
      !query || c.title.toLowerCase().includes(query) || c.category.toLowerCase().includes(query)
    );

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedCommandIndex = (this.selectedCommandIndex + 1) % filtered.length;
      this.renderCommandItems(query);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedCommandIndex = (this.selectedCommandIndex - 1 + filtered.length) % filtered.length;
      this.renderCommandItems(query);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.executeCommandByIndex(filtered, this.selectedCommandIndex);
    }
  }

  executeCommandByIndex(filtered, idx) {
    if (filtered[idx]) {
      this.closeCommandPalette();
      try {
        filtered[idx].action();
      } catch (err) {
        console.error('Command execution error:', err);
      }
    }
  }

  /* ==========================================================================
     Workspace Multi-Tab Navigation
     ========================================================================== */
  initWorkspaceTabs() {
    const tabBtns = document.querySelectorAll('.workspace-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName) || this.commandPaletteOpen) {
        return;
      }
      if (['1', '2', '3', '4', '5'].includes(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tabMap = { '1': 'intake', '2': 'screeners', '3': 'analytics', '4': 'studio', '5': 'clinics' };
        if (tabMap[e.key]) this.switchTab(tabMap[e.key]);
      }
    });
  }

  switchTab(tabId) {
    const tabBtns = document.querySelectorAll('.workspace-tab-btn');
    const panes = document.querySelectorAll('.workspace-tab-pane');
    if (!tabBtns.length || !panes.length) return;

    tabBtns.forEach(b => {
      const active = b.dataset.tab === tabId;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panes.forEach(p => {
      const active = p.id === `tabPane${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`;
      p.classList.toggle('active', active);
    });

    if (tabId === 'analytics') {
      this.fetchCohortAnalytics();
    } else if (tabId === 'clinics' && !this.clinicsLoaded) {
      this.handleClinicSearch();
      this.clinicsLoaded = true;
    }

    try {
      const url = new URL(window.location);
      url.searchParams.set('tab', tabId);
      window.history.replaceState({}, '', url);
    } catch (e) {}
  }

  /* ==========================================================================
     Real-Time Cardiovascular Telemetry
     ========================================================================== */
  initCardiovascularTelemetry() {
    const bpInput = document.getElementById('bloodPressure');
    const hrInput = document.getElementById('heartRate');

    const updateTelemetry = () => {
      const bpVal = bpInput ? bpInput.value.trim() : '120/80';
      const hrVal = hrInput ? parseFloat(hrInput.value) || 70 : 70;

      const { systolic, diastolic, valid } = ClientInferenceEngine.parseBloodPressure(bpVal);
      const mapEl = document.getElementById('telemetryMapVal');
      const ppEl = document.getElementById('telemetryPpVal');
      const hrEl = document.getElementById('telemetryHrDisplay');
      const stageEl = document.getElementById('telemetryAhaStage');
      const ppgPath = document.getElementById('ppgWaveformPath');

      if (hrEl) hrEl.textContent = hrVal;

      if (!valid || systolic < diastolic + 15) {
        if (mapEl) mapEl.textContent = '--';
        if (ppEl) ppEl.textContent = '--';
        if (stageEl) {
          stageEl.textContent = 'Invalid Format (Sys - Dia >= 15)';
          stageEl.className = 'bp-status-badge bp-elevated';
        }
        return;
      }

      const map = Math.round(((2 * diastolic) + systolic) / 3);
      const pp = systolic - diastolic;
      const bpInfo = ClientInferenceEngine.evaluateBloodPressureCategory(systolic, diastolic);

      if (mapEl) mapEl.textContent = map;
      if (ppEl) ppEl.textContent = pp;
      if (stageEl) {
        stageEl.textContent = bpInfo.category;
        stageEl.className = `bp-status-badge ${bpInfo.alertClass}`;
      }

      if (ppgPath) {
        const animDuration = Math.max(0.8, Math.min(4.0, (60 / hrVal) * 2.2));
        ppgPath.style.animationDuration = `${animDuration.toFixed(2)}s`;
      }
    };

    if (bpInput) bpInput.addEventListener('input', updateTelemetry);
    if (hrInput) hrInput.addEventListener('input', updateTelemetry);
    updateTelemetry();
  }

  /* ==========================================================================
     Standardized AASM STOP-Bang Questionnaire
     ========================================================================== */
  initStopBangScreener() {
    const toggleBtns = document.querySelectorAll('.screener-toggle-btn[data-sb-key]');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.sbKey;
        const val = parseInt(btn.dataset.sbVal, 10);
        this.stopBangAnswers[key] = val;

        const card = btn.closest('.stopbang-card') || btn.closest('.stopbang-item');
        const parent = btn.parentElement;
        parent.querySelectorAll('.screener-toggle-btn').forEach(b => {
          b.classList.remove('active-yes', 'active-no');
        });
        if (val === 1) {
          btn.classList.add('active-yes');
          if (card) card.classList.add('card-active-risk');
        } else {
          btn.classList.add('active-no');
          if (card) card.classList.remove('card-active-risk');
        }

        this.updateStopBangScore();
      });
    });

    const applyBtn = document.getElementById('applyStopBangToIntakeBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyStopBangToIntake());
    }

    this.updateStopBangScore();
  }

  updateStopBangScore() {
    const score = Object.values(this.stopBangAnswers).reduce((a, b) => a + b, 0);
    const scoreEl = document.getElementById('sbTotalScore');
    const badgeEl = document.getElementById('stopbangRiskBadge');

    if (scoreEl) scoreEl.textContent = score;

    const stopCount = (this.stopBangAnswers.snoring || 0) + 
                      (this.stopBangAnswers.tired || 0) + 
                      (this.stopBangAnswers.observed || 0) + 
                      (this.stopBangAnswers.pressure || 0);

    let riskLevel = 'Low Risk for Obstructive Sleep Apnea';
    let badgeClass = 'healthy';

    if (score >= 5 || (stopCount >= 2 && this.stopBangAnswers.gender === 1) || (stopCount >= 2 && this.stopBangAnswers.bmi === 1)) {
      riskLevel = 'High Risk for OSA (Polysomnography Indicated)';
      badgeClass = 'sleep-apnea';
    } else if (score >= 3) {
      riskLevel = 'Intermediate Risk for Obstructive Sleep Apnea';
      badgeClass = 'insomnia';
    }

    if (badgeEl) {
      badgeEl.textContent = `${riskLevel} (${score}/8)`;
      badgeEl.className = `diagnosis-pill ${badgeClass}`;
    }
  }

  applyStopBangToIntake() {
    const a = this.stopBangAnswers;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    if (a.bmi === 1) setVal('bmiCategory', 'Obese');
    if (a.gender === 1) setVal('gender', 'Male');
    if (a.age === 1) setVal('age', 54);
    if (a.pressure === 1) setVal('bloodPressure', '142/92');
    if (a.tired === 1) setVal('sleepQuality', 4);

    this.switchTab('intake');
    this.showToast('STOP-Bang vitals synchronized with Diagnostic Intake!', 'success');
  }

  /* ==========================================================================
     Standardized Epworth Sleepiness Scale (ESS)
     ========================================================================== */
  initEpworthSleepinessScale() {
    const questions = [
      'Sitting and reading quietly',
      'Watching television in the evening',
      'Sitting inactive in a public place (e.g. theater or meeting)',
      'As a passenger in a car for an hour without a break',
      'Lying down to rest in the afternoon when circumstances permit',
      'Sitting and talking to someone in a relaxed setting',
      'Sitting quietly after lunch without alcohol consumption',
      'In a car, while stopped for a few minutes in traffic'
    ];

    const tbody = document.getElementById('essQuestionsTableBody');
    if (!tbody) return;

    tbody.innerHTML = questions.map((q, idx) => `
      <tr class="ess-row">
        <td>
          <strong>${idx + 1}. ${q}</strong>
        </td>
        <td>
          <div class="ess-options-group" data-q-idx="${idx}">
            <button type="button" class="ess-opt-btn active" data-val="0" title="Never doze (0)">0</button>
            <button type="button" class="ess-opt-btn" data-val="1" title="Slight chance (1)">1</button>
            <button type="button" class="ess-opt-btn" data-val="2" title="Moderate chance (2)">2</button>
            <button type="button" class="ess-opt-btn" data-val="3" title="High chance (3)">3</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.ess-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.closest('.ess-options-group');
        const qIdx = parseInt(group.dataset.qIdx, 10);
        const val = parseInt(btn.dataset.val, 10);

        this.essAnswers[qIdx] = val;
        group.querySelectorAll('.ess-opt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.updateEssScore();
      });
    });

    const applyBtn = document.getElementById('applyEssToIntakeBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyEssToIntake());
    }

    this.updateEssScore();
  }

  updateEssScore() {
    const total = this.essAnswers.reduce((a, b) => a + b, 0);
    const scoreEl = document.getElementById('essTotalScore');
    const badgeEl = document.getElementById('essRiskBadge');

    if (scoreEl) scoreEl.textContent = total;

    let label = 'Normal Daytime Alertness';
    let badgeClass = 'healthy';

    if (total >= 18) {
      label = 'Severe Excessive Daytime Sleepiness';
      badgeClass = 'sleep-apnea';
    } else if (total >= 15) {
      label = 'Moderate Daytime Somnolence';
      badgeClass = 'insomnia';
    } else if (total >= 11) {
      label = 'Mild Daytime Somnolence (Borderline)';
      badgeClass = 'insomnia';
    }

    if (badgeEl) {
      badgeEl.textContent = `${label} (${total}/24)`;
      badgeEl.className = `diagnosis-pill ${badgeClass}`;
    }
  }

  applyEssToIntake() {
    const total = this.essAnswers.reduce((a, b) => a + b, 0);
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    if (total >= 15) {
      setVal('sleepQuality', 3);
      setVal('stressLevel', 8);
    } else if (total >= 11) {
      setVal('sleepQuality', 5);
      setVal('stressLevel', 6);
    } else {
      setVal('sleepQuality', 8);
    }

    this.switchTab('intake');
    this.showToast('Daytime hypersomnolence synchronized with intake form!', 'success');
  }

  /* ==========================================================================
     Population Health Cohort Analytics
     ========================================================================== */
  initCohortAnalytics() {
    const refreshBtn = document.getElementById('refreshAnalyticsBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.fetchCohortAnalytics();
        this.showToast('Cohort epidemiology telemetry updated!', 'info');
      });
    }
  }

  async fetchCohortAnalytics() {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          this.renderCohortAnalytics(json.data);
        }
      }
    } catch (e) {
      console.warn('Could not fetch cohort analytics:', e);
    }
  }

  renderCohortAnalytics(data) {
    const stats = data.stats || {};
    const dist = stats.distribution || { healthy: 58, insomnia: 21, sleepApnea: 21 };

    const totalEl = document.getElementById('statTotalEvaluations');
    const healthyEl = document.getElementById('statHealthyPct');
    const insomniaEl = document.getElementById('statInsomniaPct');
    const apneaEl = document.getElementById('statApneaPct');

    if (totalEl) totalEl.textContent = stats.totalAssessments || 3;
    if (healthyEl) healthyEl.textContent = `${dist.healthy}%`;
    if (insomniaEl) insomniaEl.textContent = `${dist.insomnia}%`;
    if (apneaEl) apneaEl.textContent = `${dist.sleepApnea}%`;

    const barHealthy = document.getElementById('barHealthyTrack');
    const barInsomnia = document.getElementById('barInsomniaTrack');
    const barApnea = document.getElementById('barApneaTrack');
    const valHealthy = document.getElementById('barHealthyVal');
    const valInsomnia = document.getElementById('barInsomniaVal');
    const valApnea = document.getElementById('barApneaVal');

    if (barHealthy) barHealthy.style.width = `${dist.healthy}%`;
    if (barInsomnia) barInsomnia.style.width = `${dist.insomnia}%`;
    if (barApnea) barApnea.style.width = `${dist.sleepApnea}%`;

    if (valHealthy) valHealthy.textContent = `${dist.healthy}%`;
    if (valInsomnia) valInsomnia.textContent = `${dist.insomnia}%`;
    if (valApnea) valApnea.textContent = `${dist.sleepApnea}%`;

    if (this.lastResult) {
      this.updatePatientPercentile(this.lastResult.sleepScore);
    }
  }

  updatePatientPercentile(sleepScore = 85) {
    const scoreEl = document.getElementById('patientPercentileScore');
    const descEl = document.getElementById('patientPercentileDesc');
    if (!scoreEl || !descEl) return;

    let percentile = 82;
    let description = '';

    if (sleepScore >= 92) {
      percentile = 96;
      description = `Your sleep score of ${sleepScore}/100 places you in the top 4% of the population, demonstrating optimal cardiovascular and circadian sleep architecture.`;
    } else if (sleepScore >= 80) {
      percentile = 84;
      description = `Your sleep score of ${sleepScore}/100 exceeds 84% of evaluated cohort profiles, showing robust restorative delta sleep cycles.`;
    } else if (sleepScore >= 68) {
      percentile = 62;
      description = `Your score of ${sleepScore}/100 sits at the 62nd percentile, indicating mild lifestyle or stress friction with moderate recovery capacity.`;
    } else if (sleepScore >= 50) {
      percentile = 34;
      description = `Your score of ${sleepScore}/100 ranks in the 34th percentile, reflecting elevated autonomic stress or nocturnal oxygen desaturations.`;
    } else {
      percentile = 15;
      description = `Your score of ${sleepScore}/100 falls into the 15th percentile. Clinical consultation with an accredited sleep specialist is strongly advised.`;
    }

    scoreEl.textContent = `${percentile}th`;
    descEl.textContent = description;
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.somnoPulseApp = new SomnoPulseApp();
});

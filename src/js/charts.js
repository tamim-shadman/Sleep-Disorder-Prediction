/**
 * SomnoPulse AI - Ultra-Crisp HTML5 Canvas Charts
 * Zero third-party dependencies, Retina/High-DPI display calibration.
 * Features: Dual-Polygon Radar Comparison (User vs Clinical Benchmark) and Radial Sleep Score Gauge.
 */

export const ChartRenderer = {
  setupCanvas(canvas) {
    if (!canvas) return null;
    const dpr = window.devicePixelRatio || 1;
    // Store original logical dimensions to prevent exponential canvas scaling on re-render
    const baseWidth = parseFloat(canvas.dataset.baseWidth) || parseFloat(canvas.getAttribute('width')) || 320;
    const baseHeight = parseFloat(canvas.dataset.baseHeight) || parseFloat(canvas.getAttribute('height')) || 320;
    canvas.dataset.baseWidth = baseWidth;
    canvas.dataset.baseHeight = baseHeight;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : baseWidth;
    const height = rect.height > 0 ? rect.height : baseHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width, height };
  },

  /**
   * Draws a Dual-Polygon Clinical Biomarker Radar Chart
   * Overlays Patient Profile on top of Clinical Optimal Benchmark (AASM Standards)
   */
  drawRadarChart(canvas, metrics) {
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const centerX = width / 2;
    const centerY = height / 2 - 10;
    const radius = Math.min(centerX, centerY) - 44;

    // 6 Metric Axes (normalized 0 to 1)
    const axes = [
      { label: 'Sleep Duration', userVal: Math.min((metrics.sleepDuration || 7) / 8.5, 1), benchVal: 0.94 },
      { label: 'Sleep Quality', userVal: (metrics.sleepQuality || 7) / 10, benchVal: 0.90 },
      { label: 'Activity Index', userVal: Math.min(((metrics.physicalActivity > 10 ? metrics.physicalActivity : metrics.physicalActivity * 10) || 50) / 100, 1), benchVal: 0.85 },
      { label: 'Stress Resilience', userVal: (11 - (metrics.stressLevel || 5)) / 10, benchVal: 0.85 },
      { label: 'Cardio Stability', userVal: Math.max(0, 1 - ((metrics.heartRate || 70) - 60) / 40), benchVal: 0.90 },
      { label: 'Vascular Index', userVal: Math.max(0, 1 - ((metrics.systolic || 120) - 115) / 40), benchVal: 0.95 }
    ];

    const numAxes = axes.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background Concentric Polygons
    const levels = 4;
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius / levels) * level;
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = i * angleSlice - Math.PI / 2;
        const x = centerX + Math.cos(angle) * levelRadius;
        const y = centerY + Math.sin(angle) * levelRadius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = level === levels ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 2. Draw Spokes and Axis Labels
    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleSlice - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.stroke();

      // Axis text labels
      const labelDistance = radius + 22;
      const labelX = centerX + Math.cos(angle) * labelDistance;
      const labelY = centerY + Math.sin(angle) * labelDistance;

      ctx.font = '600 10.5px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(axes[i].label, labelX, labelY);
    }

    // 3. Layer A: Clinical Optimal Benchmark Polygon (Dashed Green)
    ctx.beginPath();
    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleSlice - Math.PI / 2;
      const val = axes[i].benchVal;
      const x = centerX + Math.cos(angle) * (radius * val);
      const y = centerY + Math.sin(angle) * (radius * val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.fill();
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    // 4. Layer B: Patient Evaluated Polygon (Indigo/Cyan Gradient)
    ctx.beginPath();
    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleSlice - Math.PI / 2;
      const val = Math.max(0.12, Math.min(1, axes[i].userVal));
      const x = centerX + Math.cos(angle) * (radius * val);
      const y = centerY + Math.sin(angle) * (radius * val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.20)');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Vertex node points
    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleSlice - Math.PI / 2;
      const val = Math.max(0.12, Math.min(1, axes[i].userVal));
      const x = centerX + Math.cos(angle) * (radius * val);
      const y = centerY + Math.sin(angle) * (radius * val);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 5. Chart Legend Footer
    const legendY = height - 12;
    ctx.font = '500 10px Plus Jakarta Sans, sans-serif';
    
    // User profile legend item
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(centerX - 95, legendY - 6, 10, 10);
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'left';
    ctx.fillText('Patient Profile', centerX - 80, legendY);

    // Benchmark legend item
    ctx.fillStyle = '#10b981';
    ctx.fillRect(centerX + 15, legendY - 6, 10, 10);
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'left';
    ctx.fillText('AASM Benchmark', centerX + 30, legendY);
  },

  /**
   * Draws a Circular Arc Radial Gauge for Sleep Score (0-100)
   */
  drawScoreGauge(canvas, score) {
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 12;
    const lineWidth = 10;

    ctx.clearRect(0, 0, width, height);

    // Track Arc (270 degrees)
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Active Score Arc
    const scoreFrac = Math.max(0, Math.min(100, score)) / 100;
    const currentAngle = startAngle + (endAngle - startAngle) * scoreFrac;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, currentAngle);

    // Color gradient based on score tier
    const gradient = ctx.createLinearGradient(0, height, width, 0);
    if (score >= 80) {
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(1, '#06b6d4');
    } else if (score >= 60) {
      gradient.addColorStop(0, '#f59e0b');
      gradient.addColorStop(1, '#6366f1');
    } else {
      gradient.addColorStop(0, '#f43f5e');
      gradient.addColorStop(1, '#f59e0b');
    }

    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
};

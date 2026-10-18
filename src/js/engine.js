/**
 * SomnoPulse AI - Client-Side Clinical ML Inference Engine
 * Zero-latency offline fallback mirroring the backend Bayesian & Clinical scoring model.
 */

export const ClientInferenceEngine = {
  parseBloodPressure(bpString) {
    if (typeof bpString !== 'string') return { systolic: 120, diastolic: 80, valid: false };
    const parts = bpString.trim().split('/');
    if (parts.length !== 2) return { systolic: 120, diastolic: 80, valid: false };
    const systolic = parseFloat(parts[0]);
    const diastolic = parseFloat(parts[1]);
    if (isNaN(systolic) || isNaN(diastolic) || systolic < 70 || systolic > 250 || diastolic < 40 || diastolic > 160 || (systolic - diastolic) < 15) {
      return { systolic: 120, diastolic: 80, valid: false };
    }
    return { systolic, diastolic, valid: true };
  },

  evaluateBloodPressureCategory(systolic, diastolic) {
    if (systolic < 120 && diastolic < 80) {
      return { category: 'Normal', stage: 0, alertClass: 'bp-normal' };
    } else if (systolic <= 129 && diastolic < 80) {
      return { category: 'Elevated', stage: 1, alertClass: 'bp-elevated' };
    } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
      return { category: 'Hypertension Stage 1', stage: 2, alertClass: 'bp-stage1' };
    } else {
      return { category: 'Hypertension Stage 2 / Crisis', stage: 3, alertClass: 'bp-stage2' };
    }
  },

  predict(input) {
    const age = Number(input.age) || 30;
    const sleepDuration = Number(input.sleep_duration) || 7.0;
    const sleepQuality = Number(input.quality_of_sleep) || 7;
    const physicalActivity = Number(input.physical_activity_level) || 50;
    const stressLevel = Number(input.stress_level) || 5;
    const heartRate = Number(input.heart_rate) || 70;
    const dailySteps = Number(input.daily_steps) || 7000;
    const gender = (input.gender || 'Male').toLowerCase();
    const occupation = (input.occupation || 'Professional').toLowerCase();
    const bmiCategoryRaw = (input.bmi_category || 'Normal weight').toLowerCase();

    const { systolic, diastolic } = this.parseBloodPressure(input.blood_pressure || '120/80');
    const bpInfo = this.evaluateBloodPressureCategory(systolic, diastolic);
    const meanArterialPressure = Math.round(((2 * diastolic) + systolic) / 3);

    const isOverweight = bmiCategoryRaw.includes('overweight');
    const isObese = bmiCategoryRaw.includes('obese');
    const isNormalBMI = bmiCategoryRaw.includes('normal') || bmiCategoryRaw.includes('underweight');

    let scoreHealthy = 2.0;
    let scoreInsomnia = -0.5;
    let scoreApnea = -0.5;

    const riskFactors = [];
    const positiveFactors = [];

    // Blood Pressure
    if (systolic >= 140 || diastolic >= 90) {
      scoreApnea += 2.8;
      scoreInsomnia += 0.8;
      scoreHealthy -= 2.2;
      riskFactors.push({
        metric: 'Cardiovascular Risk',
        finding: `Stage 2 Hypertension (${systolic}/${diastolic} mmHg)`,
        impact: 'High statistical correlation with Obstructive Sleep Apnea (OSA) and systemic vascular resistance.'
      });
    } else if (systolic >= 130 || diastolic >= 85) {
      scoreApnea += 1.8;
      scoreInsomnia += 0.5;
      scoreHealthy -= 1.2;
      riskFactors.push({
        metric: 'Blood Pressure',
        finding: `Stage 1 Hypertension (${systolic}/${diastolic} mmHg)`,
        impact: 'Associated with elevated nocturnal sympathetic tone.'
      });
    } else {
      scoreHealthy += 1.2;
      positiveFactors.push('Optimal arterial blood pressure within normal physiological range.');
    }

    // BMI
    if (isObese) {
      scoreApnea += 3.2;
      scoreInsomnia += 0.4;
      scoreHealthy -= 2.5;
      riskFactors.push({
        metric: 'Body Mass Index',
        finding: 'Obese Classification',
        impact: 'Key driver of pharyngeal airway narrowing and nocturnal oxygen desaturations.'
      });
    } else if (isOverweight) {
      scoreApnea += 1.9;
      scoreInsomnia += 0.6;
      scoreHealthy -= 1.0;
      riskFactors.push({
        metric: 'Body Mass Index',
        finding: 'Overweight Classification',
        impact: 'Contributes to upper airway resistance during deep sleep.'
      });
    } else if (isNormalBMI) {
      scoreHealthy += 1.6;
      scoreApnea -= 1.5;
      positiveFactors.push('Healthy BMI lowers cardiopulmonary and airway strain.');
    }

    // Stress Level
    if (stressLevel >= 8) {
      scoreInsomnia += 3.4;
      scoreHealthy -= 2.2;
      scoreApnea += 0.3;
      riskFactors.push({
        metric: 'Autonomic Stress Index',
        finding: `Severe Stress Level (${stressLevel}/10)`,
        impact: 'Hyperactive hypothalamic-pituitary-adrenal (HPA) axis elevating bedtime cortisol.'
      });
    } else if (stressLevel >= 6) {
      scoreInsomnia += 1.6;
      scoreHealthy -= 0.8;
      riskFactors.push({
        metric: 'Stress Level',
        finding: `Moderate-High Stress (${stressLevel}/10)`,
        impact: 'Increases nocturnal micro-awakenings and latency to sleep onset.'
      });
    } else if (stressLevel <= 4) {
      scoreHealthy += 1.4;
      scoreInsomnia -= 1.5;
      positiveFactors.push('Low stress score fosters parasympathetic dominance and rapid sleep initiation.');
    }

    // Sleep Duration
    if (sleepDuration < 5.8) {
      scoreInsomnia += 2.8;
      scoreApnea += 1.0;
      scoreHealthy -= 2.5;
      riskFactors.push({
        metric: 'Sleep Duration',
        finding: `Severe Sleep Restriction (${sleepDuration}h)`,
        impact: 'Accumulates chronic sleep debt, impairing executive and autonomic restorative cycles.'
      });
    } else if (sleepDuration <= 6.5) {
      scoreInsomnia += 1.4;
      scoreApnea += 0.8;
      scoreHealthy -= 0.8;
      riskFactors.push({
        metric: 'Sleep Duration',
        finding: `Sub-optimal Duration (${sleepDuration}h)`,
        impact: 'Below the recommended 7-9 hours for adult cellular restoration.'
      });
    } else if (sleepDuration >= 7.0 && sleepDuration <= 8.5) {
      scoreHealthy += 2.0;
      scoreInsomnia -= 1.8;
      positiveFactors.push(`Optimal nocturnal sleep duration of ${sleepDuration} hours aligns with natural circadian cycle.`);
    }

    // Sleep Quality
    if (sleepQuality <= 4) {
      scoreInsomnia += 2.2;
      scoreApnea += 1.5;
      scoreHealthy -= 2.0;
      riskFactors.push({
        metric: 'Subjective Sleep Quality',
        finding: `Low Sleep Quality (${sleepQuality}/10)`,
        impact: 'Indicates non-restorative sleep or architectural sleep fragmentation.'
      });
    } else if (sleepQuality >= 8) {
      scoreHealthy += 1.8;
      scoreInsomnia -= 1.5;
      positiveFactors.push('High subjective sleep quality reflects strong delta slow-wave sleep architecture.');
    }

    // Heart Rate
    if (heartRate >= 80) {
      scoreInsomnia += 1.5;
      scoreApnea += 1.2;
      scoreHealthy -= 1.2;
      riskFactors.push({
        metric: 'Resting Heart Rate',
        finding: `Elevated Pulse (${heartRate} bpm)`,
        impact: 'Indicates resting sympathetic autonomic hyperarousal.'
      });
    } else if (heartRate <= 70) {
      scoreHealthy += 0.8;
      positiveFactors.push(`Optimal resting heart rate (${heartRate} bpm) indicates good parasympathetic tone.`);
    }

    // Modifiers
    if (age >= 50 && (isOverweight || isObese || systolic >= 130)) {
      scoreApnea += 1.4;
    }
    if (occupation.includes('nurse') || occupation.includes('sales')) {
      if (isOverweight || isObese) scoreApnea += 1.0;
      else if (stressLevel >= 6) scoreInsomnia += 1.2;
    } else if (occupation.includes('engineer') || occupation.includes('doctor')) {
      if (stressLevel >= 7) scoreInsomnia += 1.0;
    }

    // Gender-Specific Epidemiological Weighting
    if (gender === 'male' && age >= 45 && (isOverweight || isObese || systolic >= 130)) {
      scoreApnea += 0.8;
    } else if (gender === 'female' && stressLevel >= 7) {
      scoreInsomnia += 0.6;
    }

    const activityScore = physicalActivity > 10 ? physicalActivity : physicalActivity * 10;
    if (activityScore < 30 || dailySteps < 4000) {
      scoreInsomnia += 0.8;
      scoreApnea += 0.6;
      scoreHealthy -= 0.6;
    } else if (activityScore >= 60 || dailySteps >= 8000) {
      scoreHealthy += 1.0;
      scoreInsomnia -= 0.6;
      positiveFactors.push('Regular daily physical activity builds sufficient adenosine pressure for deep sleep.');
    }

    // Softmax
    const maxScore = Math.max(scoreHealthy, scoreInsomnia, scoreApnea);
    const expHealthy = Math.exp(scoreHealthy - maxScore);
    const expInsomnia = Math.exp(scoreInsomnia - maxScore);
    const expApnea = Math.exp(scoreApnea - maxScore);
    const sumExp = expHealthy + expInsomnia + expApnea;

    const probHealthy = Math.round((expHealthy / sumExp) * 100);
    const probInsomnia = Math.round((expInsomnia / sumExp) * 100);
    const probApnea = Math.max(0, 100 - probHealthy - probInsomnia);

    let predictedClass = 0;
    let disorderLabel = 'Healthy Sleep Routine';
    let severity = 'Optimal Physiological State';
    let themeClass = 'healthy';

    if (probInsomnia > probHealthy && probInsomnia >= probApnea) {
      predictedClass = 1;
      disorderLabel = 'Insomnia';
      severity = probInsomnia >= 75 ? 'High Clinical Probability' : 'Moderate Probability';
      themeClass = 'insomnia';
    } else if (probApnea > probHealthy && probApnea > probInsomnia) {
      predictedClass = 2;
      disorderLabel = 'Sleep Apnea';
      severity = probApnea >= 75 ? 'High Clinical Probability' : 'Moderate Probability';
      themeClass = 'sleep-apnea';
    }

    const recommendations = [];
    if (predictedClass === 2) {
      recommendations.push({
        title: 'Diagnostic Sleep Study (Polysomnography / HSAT)',
        detail: 'Given elevated blood pressure and BMI correlation, clinical evaluation via an overnight Home Sleep Apnea Test or in-lab Polysomnography is strongly recommended.',
        priority: 'High'
      });
      recommendations.push({
        title: 'Positional Sleep Therapy',
        detail: 'Sleep in the lateral (side) position to prevent gravitational airway collapse. Avoid back sleeping.',
        priority: 'Medium'
      });
      recommendations.push({
        title: 'Cardiovascular Risk Management',
        detail: 'Maintain regular follow-up regarding blood pressure monitoring and cardiopulmonary fitness.',
        priority: 'Medium'
      });
    } else if (predictedClass === 1) {
      recommendations.push({
        title: 'Cognitive Behavioral Therapy for Insomnia (CBT-I)',
        detail: 'Implement stimulus control therapy (using bed strictly for sleeping) and sleep restriction protocol under clinical guidance.',
        priority: 'High'
      });
      recommendations.push({
        title: 'Digital Curfew & Melatonin Protection',
        detail: 'Eliminate artificial blue screen illumination 60-90 minutes prior to target bedtime.',
        priority: 'High'
      });
      recommendations.push({
        title: 'Autonomic Relaxation Protocol',
        detail: 'Practice 4-7-8 breathing or NSDR (Non-Sleep Deep Rest) to lower heart rate and sympathetic tone before bed.',
        priority: 'Medium'
      });
    } else {
      recommendations.push({
        title: 'Anchor Circadian Sleep-Wake Schedule',
        detail: 'Maintain consistent rise and bedtimes within ±30 minutes to synchronize clock genes.',
        priority: 'Optimal'
      });
      recommendations.push({
        title: 'Morning Natural Photonic Exposure',
        detail: 'View natural sunlight for 10-15 minutes after waking to promote evening melatonin production.',
        priority: 'Optimal'
      });
    }

    let sleepScore = Math.round(
      (sleepQuality * 5.0) +
      (Math.min(sleepDuration, 8.5) / 8.5 * 30.0) -
      (stressLevel * 2.5) +
      (activityScore >= 50 ? 10 : activityScore * 0.2) -
      (bpInfo.stage * 4.0) +
      (isNormalBMI ? 5 : 0)
    );
    sleepScore = Math.max(15, Math.min(99, sleepScore));

    return {
      sleep_disorder: predictedClass,
      label: disorderLabel,
      severity,
      themeClass,
      sleepScore,
      probabilities: {
        healthy: probHealthy,
        insomnia: probInsomnia,
        sleep_apnea: probApnea
      },
      biomarkers: {
        bloodPressure: {
          systolic,
          diastolic,
          category: bpInfo.category,
          meanArterialPressure,
          pulsePressure: systolic - diastolic,
          alertClass: bpInfo.alertClass
        },
        bmiCategory: input.bmi_category,
        heartRate,
        sleepDuration,
        stressLevel,
        sleepQuality
      },
      riskFactors,
      positiveFactors,
      recommendations,
      calculatedAt: new Date().toISOString()
    };
  }
};

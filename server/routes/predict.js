/**
 * SomnoPulse AI - Prediction & Diagnostic Endpoints
 */

import { Router } from 'express';
import { validatePredictionBody } from '../middleware/validator.js';
import { predictSleepDisorder } from '../services/inferenceEngine.js';
import { AssessmentDB } from '../services/db.js';

const router = Router();

// Benchmark Clinical Presets for Instant 1-Click Evaluation
const PRESETS = [
  {
    id: 'optimal',
    name: 'Optimal Health Profile',
    tagline: 'Balanced circadian rhythm & optimal vitals',
    data: {
      age: 28,
      sleep_duration: 8.0,
      quality_of_sleep: 9,
      physical_activity_level: 70,
      stress_level: 3,
      heart_rate: 64,
      daily_steps: 8500,
      gender: 'Male',
      occupation: 'Software Engineer',
      bmi_category: 'Normal weight',
      blood_pressure: '118/76'
    }
  },
  {
    id: 'insomnia-stress',
    name: 'High-Stress Professional',
    tagline: 'High autonomic arousal, fragmented sleep (<5.5h)',
    data: {
      age: 38,
      sleep_duration: 5.2,
      quality_of_sleep: 4,
      physical_activity_level: 30,
      stress_level: 8,
      heart_rate: 82,
      daily_steps: 4200,
      gender: 'Female',
      occupation: 'Sales Representative',
      bmi_category: 'Normal weight',
      blood_pressure: '126/82'
    }
  },
  {
    id: 'sleep-apnea-cvd',
    name: 'Obstructive Apnea Risk',
    tagline: 'Overweight, Stage 2 Hypertension & daytime somnolence',
    data: {
      age: 54,
      sleep_duration: 6.0,
      quality_of_sleep: 4,
      physical_activity_level: 40,
      stress_level: 6,
      heart_rate: 78,
      daily_steps: 5100,
      gender: 'Male',
      occupation: 'Manager',
      bmi_category: 'Overweight',
      blood_pressure: '142/92'
    }
  },
  {
    id: 'night-shift',
    name: 'Healthcare Shift Worker',
    tagline: 'High physical strain, disrupted circadian rhythm',
    data: {
      age: 46,
      sleep_duration: 5.8,
      quality_of_sleep: 5,
      physical_activity_level: 80,
      stress_level: 7,
      heart_rate: 75,
      daily_steps: 9200,
      gender: 'Female',
      occupation: 'Nurse',
      bmi_category: 'Overweight',
      blood_pressure: '135/88'
    }
  }
];

router.get('/presets', (req, res) => {
  res.json({
    success: true,
    presets: PRESETS
  });
});

router.post('/', validatePredictionBody, (req, res) => {
  try {
    const input = req.validatedBody;
    const result = predictSleepDisorder(input);

    // Save record to persistent database
    const record = AssessmentDB.add({
      ...input,
      prediction: result
    });

    res.json({
      success: true,
      assessmentId: record.id,
      ...result
    });
  } catch (error) {
    console.error('Inference error:', error);
    res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing the clinical assessment.'
    });
  }
});

export default router;
export { PRESETS };

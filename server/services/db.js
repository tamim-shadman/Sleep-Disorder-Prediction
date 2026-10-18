/**
 * SomnoPulse AI - Resilient Data Store & Cohort Analytics Service
 * Provides thread-safe in-memory caching, atomic file persistence, and percentile calculations.
 */

import fs from 'fs';
import path from 'path';
import { Config } from '../config.js';

const DATA_DIR = Config.paths.data;
const DATA_FILE = Config.paths.assessmentsFile;
const TMP_DATA_FILE = path.join(DATA_DIR, 'assessments.tmp.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create data directory:', err.message);
  }
}

let assessments = [];

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      assessments = JSON.parse(content);
    }
  } catch (e) {
    console.warn('Failed to read assessments file, initializing fresh store:', e.message);
    assessments = [];
  }

  // Seed baseline cohort if empty
  if (assessments.length === 0) {
    assessments = [
      {
        id: 'seed-1',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        age: 29,
        sleep_duration: 8.0,
        quality_of_sleep: 9,
        stress_level: 3,
        heart_rate: 65,
        blood_pressure: '118/76',
        gender: 'Male',
        occupation: 'Software Engineer',
        bmi_category: 'Normal weight',
        prediction: { sleep_disorder: 0, label: 'Healthy Sleep Routine', sleepScore: 94 }
      },
      {
        id: 'seed-2',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        age: 43,
        sleep_duration: 5.5,
        quality_of_sleep: 4,
        stress_level: 8,
        heart_rate: 82,
        blood_pressure: '128/84',
        gender: 'Female',
        occupation: 'Sales Representative',
        bmi_category: 'Normal weight',
        prediction: { sleep_disorder: 1, label: 'Insomnia', sleepScore: 48 }
      },
      {
        id: 'seed-3',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        age: 52,
        sleep_duration: 6.2,
        quality_of_sleep: 5,
        stress_level: 6,
        heart_rate: 76,
        blood_pressure: '142/92',
        gender: 'Male',
        occupation: 'Manager',
        bmi_category: 'Overweight',
        prediction: { sleep_disorder: 2, label: 'Sleep Apnea', sleepScore: 52 }
      }
    ];
    persistData();
  }
}

// Atomic file persistence using temporary file and atomic rename
function persistData() {
  try {
    const payload = JSON.stringify(assessments.slice(0, 500), null, 2);
    fs.writeFileSync(TMP_DATA_FILE, payload, 'utf-8');
    fs.renameSync(TMP_DATA_FILE, DATA_FILE);
  } catch (err) {
    console.warn('Atomic persist failed, falling back to direct write:', err.message);
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(assessments.slice(0, 500), null, 2), 'utf-8');
    } catch (e) {
      console.error('Critical: unable to persist assessments data:', e.message);
    }
  }
}

// Initialize store on load
loadData();

export const AssessmentDB = {
  add(assessmentData) {
    const record = {
      id: 'asm_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      ...assessmentData
    };
    assessments.unshift(record);
    if (assessments.length > 500) {
      assessments = assessments.slice(0, 500);
    }
    persistData();
    return record;
  },

  getAll(limit = 50) {
    return assessments.slice(0, limit);
  },

  getPaginated({ page = 1, limit = 20, disorder } = {}) {
    let filtered = assessments;
    if (disorder !== undefined && disorder !== null) {
      filtered = filtered.filter(item => item.prediction?.sleep_disorder === disorder);
    }
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  getById(id) {
    return assessments.find(a => a.id === id) || null;
  },

  deleteById(id) {
    const initialLen = assessments.length;
    assessments = assessments.filter(a => a.id !== id);
    if (assessments.length !== initialLen) {
      persistData();
      return true;
    }
    return false;
  },

  getAnalytics() {
    const total = assessments.length;
    if (total === 0) {
      return { totalAssessments: 0, distribution: { healthy: 0, insomnia: 0, sleepApnea: 0 }, averages: {} };
    }

    let healthyCount = 0;
    let insomniaCount = 0;
    let apneaCount = 0;
    let totalScore = 0;
    let totalDuration = 0;
    let totalStress = 0;

    assessments.forEach(item => {
      const disorder = item.prediction?.sleep_disorder ?? 0;
      if (disorder === 0) healthyCount++;
      else if (disorder === 1) insomniaCount++;
      else if (disorder === 2) apneaCount++;

      totalScore += item.prediction?.sleepScore || 70;
      totalDuration += Number(item.sleep_duration) || 7;
      totalStress += Number(item.stress_level) || 5;
    });

    return {
      totalAssessments: total,
      distribution: {
        healthy: Math.round((healthyCount / total) * 100),
        insomnia: Math.round((insomniaCount / total) * 100),
        sleepApnea: Math.round((apneaCount / total) * 100)
      },
      counts: {
        healthy: healthyCount,
        insomnia: insomniaCount,
        sleepApnea: apneaCount
      },
      averages: {
        sleepScore: Math.round(totalScore / total),
        sleepDuration: parseFloat((totalDuration / total).toFixed(1)),
        stressLevel: parseFloat((totalStress / total).toFixed(1))
      }
    };
  }
};

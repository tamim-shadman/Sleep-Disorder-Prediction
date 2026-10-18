/**
 * SomnoPulse AI - Analytics & Cohort Population Intelligence
 */

import { Router } from 'express';
import { AssessmentDB } from '../services/db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const stats = AssessmentDB.getAnalytics();
    const recent = AssessmentDB.getAll(10);

    res.json({
      success: true,
      data: {
        stats,
        recentAssessments: recent.map(r => ({
          id: r.id,
          createdAt: r.createdAt,
          sleep_disorder: r.prediction?.sleep_disorder,
          label: r.prediction?.label,
          sleepScore: r.prediction?.sleepScore,
          sleep_duration: r.sleep_duration,
          stress_level: r.stress_level,
          blood_pressure: r.blood_pressure
        })),
        populationBenchmarks: {
          healthyPrevalence: '58.2%',
          insomniaPrevalence: '20.6%',
          sleepApneaPrevalence: '21.2%',
          benchmarkAverageSleepScore: 78,
          averageRestingHeartRate: 70
        }
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, error: 'Could not fetch analytics' });
  }
});

export default router;

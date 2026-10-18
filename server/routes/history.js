/**
 * SomnoPulse AI - Assessment History API Routes
 * Supports pagination, filtering, single record lookup, deletion, and CSV export.
 */

import { Router } from 'express';
import { AssessmentDB } from '../services/db.js';
import { validateHistoryQuery } from '../middleware/validator.js';

const router = Router();

// GET /api/history - Paginated list of assessments
router.get('/', validateHistoryQuery, (req, res) => {
  try {
    const { page, limit, disorder } = req.validatedQuery;
    const result = AssessmentDB.getPaginated({ page, limit, disorder });
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ success: false, error: 'Could not retrieve assessment history.' });
  }
});

// GET /api/history/export/csv - Export assessment records as CSV
router.get('/export/csv', (req, res) => {
  try {
    const records = AssessmentDB.getAll(500);
    const headers = [
      'ID', 'Date', 'Age', 'Gender', 'Occupation', 'BMI_Category',
      'Sleep_Duration_Hours', 'Sleep_Quality_1_10', 'Physical_Activity_Min',
      'Stress_Level_1_10', 'Heart_Rate_BPM', 'Blood_Pressure',
      'Predicted_Disorder', 'Disorder_Label', 'Sleep_Score',
      'Prob_Healthy', 'Prob_Insomnia', 'Prob_Apnea'
    ];

    const rows = records.map(r => {
      const p = r.prediction || {};
      const probs = p.probabilities || {};
      return [
        r.id,
        r.createdAt,
        r.age,
        `"${r.gender || ''}"`,
        `"${r.occupation || ''}"`,
        `"${r.bmi_category || ''}"`,
        r.sleep_duration,
        r.quality_of_sleep,
        r.physical_activity_level,
        r.stress_level,
        r.heart_rate,
        `"${r.blood_pressure || ''}"`,
        p.sleep_disorder ?? '',
        `"${p.label || ''}"`,
        p.sleepScore ?? '',
        probs.healthy ?? '',
        probs.insomnia ?? '',
        probs.sleep_apnea ?? ''
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="SomnoPulse_Assessments_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) {
    console.error('CSV Export error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate CSV export.' });
  }
});

// GET /api/history/:id - Single assessment lookup
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const record = AssessmentDB.getById(id);
  if (!record) {
    return res.status(404).json({ success: false, error: 'Assessment record not found.' });
  }
  res.json({ success: true, record });
});

// DELETE /api/history/:id - Remove assessment record
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = AssessmentDB.deleteById(id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Assessment record not found or already removed.' });
  }
  res.json({ success: true, message: `Assessment ${id} deleted successfully.` });
});

export default router;

/**
 * SomnoPulse AI - Input Validation & Sanitization Middleware
 * Powered by Zod schema definitions with physiological boundary verification.
 */

import { z } from 'zod';

// Helper to sanitize strings from potential injection or HTML entities
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim();
}

export const PredictionInputSchema = z.object({
  age: z.coerce.number()
    .min(10, 'Patient age must be at least 10 years')
    .max(110, 'Patient age must be 110 years or under'),

  sleep_duration: z.coerce.number()
    .min(2.0, 'Sleep duration must be at least 2 hours')
    .max(16.0, 'Sleep duration cannot exceed 16 hours'),

  quality_of_sleep: z.coerce.number()
    .min(1, 'Sleep quality must be between 1 and 10')
    .max(10, 'Sleep quality must be between 1 and 10'),

  physical_activity_level: z.coerce.number()
    .min(0, 'Physical activity cannot be negative')
    .max(180, 'Physical activity cannot exceed 180 minutes/day'),

  stress_level: z.coerce.number()
    .min(1, 'Stress level must be between 1 and 10')
    .max(10, 'Stress level must be between 1 and 10'),

  heart_rate: z.coerce.number()
    .min(35, 'Resting heart rate must be at least 35 bpm')
    .max(200, 'Resting heart rate must be 200 bpm or less'),

  daily_steps: z.coerce.number()
    .min(0, 'Daily steps cannot be negative')
    .max(50000, 'Daily steps must be 50,000 or less'),

  gender: z.string().transform(sanitizeString)
    .refine(val => ['male', 'female', 'other'].includes(val.toLowerCase()), {
      message: 'Gender must be Male, Female, or Other'
    })
    .default('Male'),

  occupation: z.string().transform(sanitizeString)
    .default('Professional'),

  bmi_category: z.string().transform(sanitizeString)
    .default('Normal weight'),

  blood_pressure: z.string().transform(sanitizeString)
    .refine(val => {
      const parts = val.split('/');
      if (parts.length !== 2) return false;
      const sys = parseFloat(parts[0]);
      const dia = parseFloat(parts[1]);
      if (isNaN(sys) || isNaN(dia)) return false;
      // Physiological viability: Systolic between 70-250, Diastolic between 40-160, Pulse Pressure >= 15
      return sys >= 70 && sys <= 250 && dia >= 40 && dia <= 160 && (sys - dia) >= 15;
    }, {
      message: 'Invalid blood pressure. Must be in format Systolic/Diastolic (e.g. 120/80) with systolic exceeding diastolic by at least 15 mmHg.'
    })
});

export const HistoryQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  page: z.coerce.number().min(1).default(1),
  disorder: z.coerce.number().min(0).max(2).optional()
});

export const ClinicQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  q: z.string().max(100, 'Search query cannot exceed 100 characters').transform(sanitizeString).optional(),
  query: z.string().max(100, 'Search query cannot exceed 100 characters').transform(sanitizeString).optional()
});

export function validatePredictionBody(req, res, next) {
  const result = PredictionInputSchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    return res.status(400).json({
      success: false,
      error: 'Validation failed for submitted clinical biomarkers.',
      details: formattedErrors
    });
  }
  req.validatedBody = result.data;
  next();
}

export function validateHistoryQuery(req, res, next) {
  const result = HistoryQuerySchema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid history query parameters.',
      details: result.error.errors
    });
  }
  req.validatedQuery = result.data;
  next();
}

export function validateClinicQuery(req, res, next) {
  const result = ClinicQuerySchema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid clinic query parameters.',
      details: result.error.errors
    });
  }
  req.validatedQuery = result.data;
  next();
}

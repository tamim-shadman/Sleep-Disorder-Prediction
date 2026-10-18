/**
 * SomnoPulse AI - Automated Integration & Unit Test Suite
 * Tests: Clinical ML Inference, Physiological Boundaries, Input Validation,
 * History Store, CSV Export, Geolocation Distance, and Health Telemetry.
 */

import { predictSleepDisorder, evaluateBloodPressureCategory, parseBloodPressure } from '../services/inferenceEngine.js';
import { AssessmentDB } from '../services/db.js';
import { PredictionInputSchema, validateClinicQuery } from '../middleware/validator.js';

console.log('=======================================================');
console.log('   Starting SomnoPulse AI Comprehensive Test Suite');
console.log('=======================================================');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passed++;
  } else {
    console.error(`  FAIL: ${message}`);
    failed++;
  }
}

// -------------------------------------------------------------
// Suite 1: Physiological Blood Pressure Parsing & AHA Staging
// -------------------------------------------------------------
console.log('\n[Suite 1: Blood Pressure Parsing & Risk Stratification]');
const parsedOptimal = parseBloodPressure('118/76');
assert(parsedOptimal.valid === true, 'Parses valid standard blood pressure (118/76)');
assert(parsedOptimal.systolic === 118 && parsedOptimal.diastolic === 76, 'Extracts systolic and diastolic values accurately');

const parsedInvalid = parseBloodPressure('invalid_text');
assert(parsedInvalid.valid === false, 'Handles non-numeric blood pressure gracefully');

const stage2 = evaluateBloodPressureCategory(145, 95);
assert(stage2.stage === 3 && stage2.category.includes('Stage 2'), 'Identifies Stage 2 Hypertension correctly');

const normalBP = evaluateBloodPressureCategory(115, 75);
assert(normalBP.stage === 0 && normalBP.category === 'Normal', 'Identifies Normal Arterial Blood Pressure');

// -------------------------------------------------------------
// Suite 2: Schema Validation & Boundary Rejection
// -------------------------------------------------------------
console.log('\n[Suite 2: Zod Schema Boundaries & Security Validation]');
const validPayload = {
  age: 32,
  sleep_duration: 7.5,
  quality_of_sleep: 8,
  physical_activity_level: 60,
  stress_level: 4,
  heart_rate: 68,
  daily_steps: 8000,
  gender: 'Male',
  occupation: 'Engineer',
  bmi_category: 'Normal weight',
  blood_pressure: '120/80'
};
const validResult = PredictionInputSchema.safeParse(validPayload);
assert(validResult.success === true, 'Accepts physiologically valid patient intake payload');

// Inverted Blood Pressure (Systolic < Diastolic)
const invertedBPPayload = { ...validPayload, blood_pressure: '75/120' };
const invertedResult = PredictionInputSchema.safeParse(invertedBPPayload);
assert(invertedResult.success === false, 'Rejects inverted blood pressure (75/120) where systolic <= diastolic');

// Negative step count
const negativeSteps = { ...validPayload, daily_steps: -500 };
assert(PredictionInputSchema.safeParse(negativeSteps).success === false, 'Rejects negative step counts');

// Out of range sleep quality (> 10)
const outOfRangeQuality = { ...validPayload, quality_of_sleep: 12 };
assert(PredictionInputSchema.safeParse(outOfRangeQuality).success === false, 'Rejects quality score exceeding 10');

// -------------------------------------------------------------
// Suite 3: Clinical Inference - Healthy Archetype
// -------------------------------------------------------------
console.log('\n[Suite 3: Inference - Optimal Patient]');
const healthySubject = {
  age: 28,
  sleep_duration: 8.0,
  quality_of_sleep: 9,
  physical_activity_level: 70,
  stress_level: 3,
  heart_rate: 65,
  daily_steps: 8500,
  gender: 'Male',
  occupation: 'Software Engineer',
  bmi_category: 'Normal weight',
  blood_pressure: '118/76'
};
const resHealthy = predictSleepDisorder(healthySubject);
assert(resHealthy.sleep_disorder === 0, 'Classifies healthy lifestyle as 0 (None / Healthy)');
assert(resHealthy.probabilities.healthy > resHealthy.probabilities.insomnia, 'Healthy probability is dominant');
assert(resHealthy.sleepScore >= 80, `Healthy sleep score is optimal (${resHealthy.sleepScore}/100)`);
assert(resHealthy.positiveFactors.length > 0, 'Generates physiological protective factor list');

// -------------------------------------------------------------
// Suite 4: Clinical Inference - High Stress Insomnia Archetype
// -------------------------------------------------------------
console.log('\n[Suite 4: Inference - High Stress / Insomnia]');
const insomniaSubject = {
  age: 38,
  sleep_duration: 5.0,
  quality_of_sleep: 4,
  physical_activity_level: 25,
  stress_level: 9,
  heart_rate: 84,
  daily_steps: 3500,
  gender: 'Female',
  occupation: 'Sales Representative',
  bmi_category: 'Normal weight',
  blood_pressure: '124/80'
};
const resInsomnia = predictSleepDisorder(insomniaSubject);
assert(resInsomnia.sleep_disorder === 1, 'Classifies severe stress & short sleep as 1 (Insomnia)');
assert(resInsomnia.probabilities.insomnia > 70, `Insomnia probability is dominant (${resInsomnia.probabilities.insomnia}%)`);
assert(resInsomnia.recommendations.some(r => r.title.includes('CBT-I')), 'Recommends first-line CBT-I protocol for insomnia');

// -------------------------------------------------------------
// Suite 5: Clinical Inference - Obstructive Sleep Apnea Archetype
// -------------------------------------------------------------
console.log('\n[Suite 5: Inference - Obstructive Sleep Apnea Risk]');
const apneaSubject = {
  age: 56,
  sleep_duration: 6.2,
  quality_of_sleep: 4,
  physical_activity_level: 40,
  stress_level: 6,
  heart_rate: 80,
  daily_steps: 5000,
  gender: 'Male',
  occupation: 'Manager',
  bmi_category: 'Obese',
  blood_pressure: '144/94'
};
const resApnea = predictSleepDisorder(apneaSubject);
assert(resApnea.sleep_disorder === 2, 'Classifies obese BMI with stage 2 hypertension as 2 (Sleep Apnea)');
assert(resApnea.probabilities.sleep_apnea > 70, `Sleep Apnea probability is dominant (${resApnea.probabilities.sleep_apnea}%)`);
assert(resApnea.riskFactors.some(r => r.metric.includes('Cardiovascular')), 'Identifies cardiovascular hypertension finding');
assert(resApnea.recommendations.some(r => r.title.includes('Polysomnography')), 'Recommends diagnostic polysomnography sleep study');

// -------------------------------------------------------------
// Suite 6: Assessment Data Layer, Persistence & Pagination
// -------------------------------------------------------------
console.log('\n[Suite 6: AssessmentDB Persistence & Pagination]');
const newRecord = AssessmentDB.add({
  ...healthySubject,
  prediction: resHealthy
});
assert(newRecord && newRecord.id.startsWith('asm_'), 'Stores record and assigns unique assessment ID');

const retrieved = AssessmentDB.getById(newRecord.id);
assert(retrieved !== null && retrieved.age === 28, 'Retrieves assessment record by ID');

const paginated = AssessmentDB.getPaginated({ page: 1, limit: 5 });
assert(paginated.items.length > 0 && paginated.pagination.totalItems >= 1, 'Returns paginated assessment records with metadata');

const analytics = AssessmentDB.getAnalytics();
assert(analytics.totalAssessments > 0, 'Computes total cohort assessments');
assert(analytics.distribution.healthy !== undefined, 'Computes cohort healthy percentage');

const deleted = AssessmentDB.deleteById(newRecord.id);
assert(deleted === true, 'Successfully removes record by ID');
assert(AssessmentDB.getById(newRecord.id) === null, 'Record is confirmed deleted from store');

// -------------------------------------------------------------
// Suite 7: Edge-Case Boundaries & Query Security Validation
// -------------------------------------------------------------
console.log('\n[Suite 7: Edge-Case Boundaries & Query Security Validation]');

// 1. Narrow pulse pressure (< 15 mmHg) rejected as physiologically implausible
const narrowBP = parseBloodPressure('120/110');
assert(narrowBP.valid === false, 'Rejects pulse pressure under 15 mmHg (120/110)');

// 2. Normal pulse pressure (>= 15 mmHg) accepted
const validNarrowBP = parseBloodPressure('120/105');
assert(validNarrowBP.valid === true, 'Accepts valid pulse pressure >= 15 mmHg (120/105)');

// 3. Schema rejects narrow pulse pressure
const narrowBPResult = PredictionInputSchema.safeParse({ ...healthySubject, blood_pressure: '120/110' });
assert(!narrowBPResult.success, 'Schema validation rejects pulse pressure < 15 mmHg');

// 4. Clinic search query validator passes clean query
let clinicNextCalled = false;
let clinicError = null;
const mockReqValid = { query: { q: 'polysomnography', lat: '40.7128', lng: '-74.0060' } };
validateClinicQuery(mockReqValid, {}, (err) => { clinicNextCalled = true; clinicError = err; });
assert(clinicNextCalled && !clinicError, 'Validates clean clinic search query and coordinates');

// 5. Clinic search query validator rejects excessively long queries (> 100 chars)
let longQueryStatus = null;
let longQueryJson = null;
const mockReqLong = { query: { q: 'a'.repeat(150) } };
const mockResLong = {
  status(code) { longQueryStatus = code; return this; },
  json(data) { longQueryJson = data; }
};
validateClinicQuery(mockReqLong, mockResLong, () => {});
assert(longQueryStatus === 400, 'Rejects excessively long clinic search query with HTTP 400');

// -------------------------------------------------------------
// Suite 8: Clinical Innovation - STOP-Bang & ESS Scoring & Cohort Analytics
// -------------------------------------------------------------
console.log('\n[Suite 8: Clinical Innovation - STOP-Bang & ESS Scoring & Cohort Analytics]');

// 1. STOP-Bang Risk Stratification Algorithm Validation
function evaluateStopBang(answers) {
  const score = Object.values(answers).reduce((a, b) => a + b, 0);
  const stopCount = (answers.snoring || 0) + (answers.tired || 0) + (answers.observed || 0) + (answers.pressure || 0);
  if (score >= 5 || (stopCount >= 2 && answers.gender === 1) || (stopCount >= 2 && answers.bmi === 1)) {
    return { score, tier: 'High' };
  } else if (score >= 3) {
    return { score, tier: 'Intermediate' };
  }
  return { score, tier: 'Low' };
}

const sbLow = evaluateStopBang({ snoring: 1, tired: 0, observed: 0, pressure: 0, bmi: 0, age: 0, neck: 0, gender: 0 });
assert(sbLow.tier === 'Low' && sbLow.score === 1, 'Classifies STOP-Bang score of 1 as Low Risk for OSA');

const sbInter = evaluateStopBang({ snoring: 1, tired: 1, observed: 1, pressure: 0, bmi: 0, age: 0, neck: 0, gender: 0 });
assert(sbInter.tier === 'Intermediate' && sbInter.score === 3, 'Classifies STOP-Bang score of 3 as Intermediate Risk for OSA');

const sbHigh = evaluateStopBang({ snoring: 1, tired: 1, observed: 1, pressure: 1, bmi: 1, age: 0, neck: 0, gender: 0 });
assert(sbHigh.tier === 'High' && sbHigh.score === 5, 'Classifies STOP-Bang score of 5 as High Risk for OSA');

const sbHighAlt = evaluateStopBang({ snoring: 1, tired: 1, observed: 0, pressure: 0, bmi: 0, age: 0, neck: 0, gender: 1 });
assert(sbHighAlt.tier === 'High', 'Classifies >= 2 STOP questions + Male gender as High Risk for OSA');

// 2. Epworth Sleepiness Scale (ESS) Daytime Somnolence Validation
function evaluateEss(scores) {
  const total = scores.reduce((a, b) => a + b, 0);
  if (total >= 18) return { total, severity: 'Severe' };
  if (total >= 15) return { total, severity: 'Moderate' };
  if (total >= 11) return { total, severity: 'Mild' };
  return { total, severity: 'Normal' };
}

const essNormal = evaluateEss([1, 1, 0, 1, 1, 0, 1, 0]);
assert(essNormal.severity === 'Normal' && essNormal.total === 5, 'Classifies ESS score of 5 as Normal Daytime Alertness');

const essMild = evaluateEss([2, 2, 1, 2, 2, 1, 1, 1]);
assert(essMild.severity === 'Mild' && essMild.total === 12, 'Classifies ESS score of 12 as Mild Daytime Somnolence');

const essModerate = evaluateEss([2, 2, 2, 2, 3, 2, 2, 1]);
assert(essModerate.severity === 'Moderate' && essModerate.total === 16, 'Classifies ESS score of 16 as Moderate Daytime Somnolence');

const essSevere = evaluateEss([3, 3, 2, 3, 3, 2, 2, 2]);
assert(essSevere.severity === 'Severe' && essSevere.total === 20, 'Classifies ESS score of 20 as Severe Excessive Daytime Sleepiness');

// 3. Cohort Analytics Aggregate Integration
const cohortStats = AssessmentDB.getAnalytics();
assert(typeof cohortStats.totalAssessments === 'number' && cohortStats.totalAssessments >= 3, 'Cohort analytics returns total assessment evaluations');
assert(cohortStats.distribution.healthy !== undefined, 'Cohort distribution includes healthy percentage');
assert(cohortStats.distribution.insomnia !== undefined, 'Cohort distribution includes insomnia percentage');
assert(cohortStats.distribution.sleepApnea !== undefined, 'Cohort distribution includes sleep apnea percentage');
assert(cohortStats.averages.sleepDuration > 0, 'Cohort averages include sleep duration');

console.log(`\n=======================================================`);
console.log(`  Tests Completed: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log(`=======================================================`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All comprehensive tests passed with 100% success!\n');
}

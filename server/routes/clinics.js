/**
 * SomnoPulse AI - Sleep Medicine Clinics & Hospital Locator Endpoint
 */

import { Router } from 'express';
import { validateClinicQuery } from '../middleware/validator.js';

const router = Router();

// Sample accredited clinical sleep centers
const CLINICS = [
  {
    id: 'center-1',
    name: 'SomnoHealth Comprehensive Sleep Medicine Center',
    specialty: 'AASM Accredited Polysomnography & CPAP Titration',
    rating: 4.9,
    reviews: 148,
    phone: '+1 (555) 329-7533',
    address: 'Suite 400, 100 Medical Center Parkway',
    coordinates: { lat: 40.7589, lng: -73.9851 }, // NYC example fallback
    services: ['Home Sleep Apnea Testing (HSAT)', 'In-Lab Polysomnography', 'CBT-I Therapy', 'Oral Appliance Referral'],
    emergencyAvailable: false
  },
  {
    id: 'center-2',
    name: 'University Sleep & Circadian Biology Institute',
    specialty: 'Clinical Research & Complex Sleep Pathology',
    rating: 4.8,
    reviews: 212,
    phone: '+1 (555) 782-9901',
    address: 'East Pavilion, 450 Health Sciences Drive',
    coordinates: { lat: 40.7484, lng: -73.9857 },
    services: ['Pediatric & Adult Sleep Studies', 'Restless Legs Syndrome Clinic', 'Narcolepsy & Hypersomnia Evaluation'],
    emergencyAvailable: false
  },
  {
    id: 'center-3',
    name: 'Metropolitan Pulmonary & Sleep Specialists',
    specialty: 'Obstructive Sleep Apnea & Respiratory Failure',
    rating: 4.7,
    reviews: 94,
    phone: '+1 (555) 614-2200',
    address: 'Tower B, 820 Lexington Avenue',
    coordinates: { lat: 40.7645, lng: -73.9685 },
    services: ['CPAP/BiPAP Compliance Monitoring', 'Inspire Hypoglossal Nerve Evaluation', 'Diagnostic Spirometry'],
    emergencyAvailable: false
  },
  {
    id: 'center-4',
    name: 'Integrative Mind-Body Sleep & Insomnia Clinic',
    specialty: 'CBT-I, Chronobiology & Non-Pharmacological Care',
    rating: 4.9,
    reviews: 116,
    phone: '+1 (555) 902-4411',
    address: 'Floor 7, 250 Hudson Street',
    coordinates: { lat: 40.7258, lng: -74.0084 },
    services: ['Digital & In-Person CBT-I', 'Circadian Phase Assessment', 'Melatonin & Light Therapy Protocols'],
    emergencyAvailable: false
  }
];

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c * 0.621371).toFixed(1)); // Convert to miles
}

router.get('/', validateClinicQuery, (req, res) => {
  const { lat, lng, query } = req.validatedQuery || req.query;

  let clinicsList = CLINICS.map(clinic => ({ ...clinic }));

  // Filter by search query if provided (matches name, specialty, or services)
  if (query && query.trim().length > 0) {
    const q = query.trim().toLowerCase();
    clinicsList = clinicsList.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.specialty.toLowerCase().includes(q) ||
      c.services.some(s => s.toLowerCase().includes(q))
    );
  }

  // Calculate distance if coordinates provided
  if (lat !== undefined && lng !== undefined && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    clinicsList = clinicsList.map(c => {
      const distanceMiles = haversineDistance(userLat, userLng, c.coordinates.lat, c.coordinates.lng);
      return {
        ...c,
        distanceMiles: distanceMiles,
        distanceText: `${distanceMiles} miles away`
      };
    });
    clinicsList.sort((a, b) => a.distanceMiles - b.distanceMiles);
  }

  res.json({
    success: true,
    count: clinicsList.length,
    clinics: clinicsList
  });
});

export default router;

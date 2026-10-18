/**
 * SomnoPulse AI - Clinical Sleep Medicine Center Locator
 */

export const ClinicLocator = {
  defaultClinics: [
    {
      name: 'SomnoHealth Comprehensive Sleep Medicine Center',
      specialty: 'AASM Accredited Polysomnography & CPAP Titration',
      address: 'Suite 400, 100 Medical Center Parkway',
      rating: 4.9,
      phone: '+1 (555) 329-7533',
      services: ['Home Sleep Apnea Testing (HSAT)', 'In-Lab Polysomnography', 'CBT-I']
    },
    {
      name: 'University Sleep & Circadian Biology Institute',
      specialty: 'Clinical Research & Complex Sleep Pathology',
      address: 'East Pavilion, 450 Health Sciences Drive',
      rating: 4.8,
      phone: '+1 (555) 782-9901',
      services: ['Adult & Pediatric Sleep Studies', 'Restless Legs Syndrome Clinic']
    },
    {
      name: 'Metropolitan Pulmonary & Sleep Specialists',
      specialty: 'Obstructive Sleep Apnea & Respiratory Therapy',
      address: 'Tower B, 820 Lexington Avenue',
      rating: 4.7,
      phone: '+1 (555) 614-2200',
      services: ['CPAP Compliance', 'Inspire Hypoglossal Nerve Evaluation']
    }
  ],

  async fetchClinics(lat, lng, query = '') {
    try {
      const params = new URLSearchParams();
      if (lat && lng) {
        params.append('lat', lat);
        params.append('lng', lng);
      }
      if (query) {
        params.append('q', query);
      }
      const qs = params.toString();
      const url = qs ? `/api/clinics?${qs}` : '/api/clinics';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.clinics && data.clinics.length > 0) {
          return data.clinics;
        }
      }
    } catch (e) {
      // Backend not running or timeout; return fallback
    }
    return this.defaultClinics;
  },

  async requestUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        err => {
          reject(err);
        },
        { timeout: 7000, enableHighAccuracy: false }
      );
    });
  },

  getGoogleMapsSearchUrl(lat, lng, query = 'sleep disorder clinic or hospital') {
    if (lat && lng) {
      return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${lat},${lng},13z`;
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  }
};

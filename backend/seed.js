const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const Doctor = require('./models/Doctor');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://harshakommoju936_db_user:Harsha1234@cluster0.gkgmxbm.mongodb.net/health-hub?retryWrites=true&w=majority';

// ─── HOSPITAL DATA ────────────────────────────────────────────────────────────

const hospitalData = [

  // ── 1. City General Hospital (original) ──────────────────────────────────
  {
    name: 'City General Hospital',
    type: 'public',
    address: { street: '123 Main Street', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India' },
    contact: { phone: '+91-22-12345678', email: 'info@citygeneralhospital.com', website: 'www.citygeneralhospital.com', emergency: '+91-22-99999999' },
    coordinates: { latitude: 19.076, longitude: 72.877 },
    departments: [
      { name: 'General Medicine', isAvailable: true },
      { name: 'Cardiology',       isAvailable: true },
      { name: 'Orthopedics',      isAvailable: true },
      { name: 'Pediatrics',       isAvailable: true },
      { name: 'Emergency',        isAvailable: true }
    ],
    facilities: [
      { name: 'ICU',        isAvailable: true },
      { name: 'X-Ray',      isAvailable: true },
      { name: 'Laboratory', isAvailable: true },
      { name: 'Pharmacy',   isAvailable: true }
    ],
    services: [
      { name: 'OPD Consultation', cost: 300,  isAvailable: true },
      { name: 'Emergency Care',   cost: 1000, isAvailable: true },
      { name: 'Blood Test',       cost: 500,  isAvailable: true }
    ],
    capacity: { totalBeds: 200, availableBeds: 50, icuBeds: 20, emergencyBeds: 30 },
    operatingHours: {
      monday:    { open: '08:00', close: '20:00', isOpen: true },
      tuesday:   { open: '08:00', close: '20:00', isOpen: true },
      wednesday: { open: '08:00', close: '20:00', isOpen: true },
      thursday:  { open: '08:00', close: '20:00', isOpen: true },
      friday:    { open: '08:00', close: '20:00', isOpen: true },
      saturday:  { open: '09:00', close: '17:00', isOpen: true },
      sunday:    { open: '09:00', close: '14:00', isOpen: true }
    },
    emergencyServices: { isAvailable: true, responseTime: 10, specialties: ['Trauma', 'Cardiac'] },
    insurance: [{ provider: 'Star Health', isAccepted: true }, { provider: 'HDFC Ergo', isAccepted: true }],
    ratings: { overall: 4.2, cleanliness: 4.0, staff: 4.3, treatment: 4.2, totalReviews: 120 },
    isActive: true, verified: true
  },

  // ── 2. Apollo Specialty Hospital (original) ───────────────────────────────
  {
    name: 'Apollo Specialty Hospital',
    type: 'private',
    address: { street: '45 Health Avenue', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', country: 'India' },
    contact: { phone: '+91-80-87654321', email: 'contact@apollospecialty.com', website: 'www.apollospecialty.com', emergency: '+91-80-88888888' },
    coordinates: { latitude: 12.971, longitude: 77.594 },
    departments: [
      { name: 'Cardiology', isAvailable: true },
      { name: 'Neurology',  isAvailable: true },
      { name: 'Oncology',   isAvailable: true },
      { name: 'Surgery',    isAvailable: true },
      { name: 'Emergency',  isAvailable: true }
    ],
    facilities: [
      { name: 'MRI',     isAvailable: true },
      { name: 'CT Scan', isAvailable: true },
      { name: 'ICU',     isAvailable: true },
      { name: 'Pharmacy',isAvailable: true }
    ],
    services: [
      { name: 'Specialist Consultation', cost: 800,   isAvailable: true },
      { name: 'Surgery',                 cost: 50000, isAvailable: true },
      { name: 'MRI Scan',                cost: 5000,  isAvailable: true }
    ],
    capacity: { totalBeds: 300, availableBeds: 80, icuBeds: 40, emergencyBeds: 20 },
    operatingHours: {
      monday:    { open: '07:00', close: '22:00', isOpen: true },
      tuesday:   { open: '07:00', close: '22:00', isOpen: true },
      wednesday: { open: '07:00', close: '22:00', isOpen: true },
      thursday:  { open: '07:00', close: '22:00', isOpen: true },
      friday:    { open: '07:00', close: '22:00', isOpen: true },
      saturday:  { open: '08:00', close: '20:00', isOpen: true },
      sunday:    { open: '08:00', close: '18:00', isOpen: true }
    },
    emergencyServices: { isAvailable: true, responseTime: 5, specialties: ['Cardiac', 'Neuro', 'Trauma'] },
    insurance: [
      { provider: 'Max Bupa',       isAccepted: true },
      { provider: 'Bajaj Allianz',  isAccepted: true },
      { provider: 'Star Health',    isAccepted: true }
    ],
    ratings: { overall: 4.7, cleanliness: 4.8, staff: 4.7, treatment: 4.6, totalReviews: 350 },
    isActive: true, verified: true
  },

  // ── 3. Sunrise Children's Hospital (original) ─────────────────────────────
  {
    name: "Sunrise Children's Hospital",
    type: 'specialty',
    address: { street: '78 Kids Lane', city: 'Delhi', state: 'Delhi', zipCode: '110001', country: 'India' },
    contact: { phone: '+91-11-11223344', email: 'hello@sunrisechildren.com', website: 'www.sunrisechildren.com', emergency: '+91-11-77777777' },
    coordinates: { latitude: 28.613, longitude: 77.209 },
    departments: [
      { name: 'Pediatrics',           isAvailable: true },
      { name: 'Neonatology',          isAvailable: true },
      { name: 'Pediatric Surgery',    isAvailable: true },
      { name: 'Pediatric Cardiology', isAvailable: true }
    ],
    facilities: [
      { name: 'NICU',         isAvailable: true },
      { name: 'Pediatric ICU',isAvailable: true },
      { name: 'Pharmacy',     isAvailable: true },
      { name: 'Laboratory',   isAvailable: true }
    ],
    services: [
      { name: 'Pediatric Consultation', cost: 500,  isAvailable: true },
      { name: 'Vaccination',            cost: 200,  isAvailable: true },
      { name: 'Neonatal Care',          cost: 2000, isAvailable: true }
    ],
    capacity: { totalBeds: 100, availableBeds: 30, icuBeds: 15, emergencyBeds: 10 },
    operatingHours: {
      monday:    { open: '08:00', close: '20:00', isOpen: true },
      tuesday:   { open: '08:00', close: '20:00', isOpen: true },
      wednesday: { open: '08:00', close: '20:00', isOpen: true },
      thursday:  { open: '08:00', close: '20:00', isOpen: true },
      friday:    { open: '08:00', close: '20:00', isOpen: true },
      saturday:  { open: '09:00', close: '17:00', isOpen: true },
      sunday:    { open: '10:00', close: '14:00', isOpen: false }
    },
    emergencyServices: { isAvailable: true, responseTime: 8, specialties: ['Pediatric Emergency', 'Neonatal'] },
    insurance: [{ provider: 'Star Health', isAccepted: true }, { provider: 'Religare', isAccepted: true }],
    ratings: { overall: 4.5, cleanliness: 4.6, staff: 4.5, treatment: 4.4, totalReviews: 200 },
    isActive: true, verified: true
  },

  // ── 4. Apollo Hospital – Hyderabad (from search file) ─────────────────────
  {
    name: 'Apollo Hospital',
    type: 'private',
    address: { street: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', zipCode: '500033', country: 'India' },
    contact: { phone: '04023607777', email: 'info@apollohospitals.com', website: 'https://www.apollohospitals.com', emergency: '04023607777' },
    coordinates: { latitude: 17.4156, longitude: 78.4347 },
    departments: [
      { name: 'Cardiology',   isAvailable: true },
      { name: 'Neurology',    isAvailable: true },
      { name: 'Oncology', isAvailable: true }
    ],
    facilities: [
      { name: 'ICU',      isAvailable: true },
      { name: 'MRI',      isAvailable: true },
      { name: 'CT Scan',  isAvailable: true },
      { name: 'Pharmacy', isAvailable: true }
    ],
    services: [
      { name: 'OPD Consultation',    cost: 700,  isAvailable: true },
      { name: 'Emergency Care',      cost: 2000, isAvailable: true },
      { name: 'Specialist Consult',  cost: 1000, isAvailable: true }
    ],
    capacity: { totalBeds: 500, availableBeds: 100, icuBeds: 50, emergencyBeds: 40 },
    operatingHours: {
      monday:    { open: '07:00', close: '22:00', isOpen: true },
      tuesday:   { open: '07:00', close: '22:00', isOpen: true },
      wednesday: { open: '07:00', close: '22:00', isOpen: true },
      thursday:  { open: '07:00', close: '22:00', isOpen: true },
      friday:    { open: '07:00', close: '22:00', isOpen: true },
      saturday:  { open: '08:00', close: '20:00', isOpen: true },
      sunday:    { open: '08:00', close: '18:00', isOpen: true }
    },
    emergencyServices: { isAvailable: true, responseTime: 5, specialties: ['Cardiac', 'Neuro', 'Trauma'] },
    insurance: [{ provider: 'Star Health', isAccepted: true }, { provider: 'HDFC Ergo', isAccepted: true }],
    ratings: { overall: 4.7, cleanliness: 4.8, staff: 4.7, treatment: 4.6, totalReviews: 2400 },
    description: 'Advanced multi-speciality hospital.',
    isActive: true, verified: true
  },

  // ── 5. Yashoda Hospital – Hyderabad (from search file) ────────────────────
  {
    name: 'Yashoda Hospital',
    type: 'private',
    address: { street: 'Somajiguda', city: 'Hyderabad', state: 'Telangana', zipCode: '500082', country: 'India' },
    contact: { phone: '04045674567', email: 'info@yashodahospitals.com', website: 'https://www.yashodahospitals.com', emergency: '04045674567' },
    coordinates: { latitude: 17.4239, longitude: 78.4591 },
    departments: [
      { name: 'Cardiology',   isAvailable: true },
      { name: 'Orthopedics',  isAvailable: true }
    ],
    facilities: [
      { name: 'ICU',        isAvailable: true },
      { name: 'X-Ray',      isAvailable: true },
      { name: 'Laboratory', isAvailable: true },
      { name: 'Pharmacy',   isAvailable: true }
    ],
    services: [
      { name: 'OPD Consultation', cost: 500,  isAvailable: true },
      { name: 'Emergency Care',   cost: 1500, isAvailable: true }
    ],
    capacity: { totalBeds: 350, availableBeds: 80, icuBeds: 35, emergencyBeds: 25 },
    operatingHours: {
      monday:    { open: '08:00', close: '21:00', isOpen: true },
      tuesday:   { open: '08:00', close: '21:00', isOpen: true },
      wednesday: { open: '08:00', close: '21:00', isOpen: true },
      thursday:  { open: '08:00', close: '21:00', isOpen: true },
      friday:    { open: '08:00', close: '21:00', isOpen: true },
      saturday:  { open: '09:00', close: '18:00', isOpen: true },
      sunday:    { open: '09:00', close: '15:00', isOpen: true }
    },
    emergencyServices: { isAvailable: true, responseTime: 8, specialties: ['Cardiac', 'Orthopedic'] },
    insurance: [{ provider: 'Star Health', isAccepted: true }, { provider: 'Max Bupa', isAccepted: true }],
    ratings: { overall: 4.5, cleanliness: 4.4, staff: 4.5, treatment: 4.5, totalReviews: 1800 },
    description: 'Trusted healthcare with modern facilities.',
    isActive: true, verified: true
  },

  // ── 6. Varma Hospitals – Bhimavaram (from search file) ───────────────────
  {
    name: 'Varma Hospitals',
    type: 'private',
    address: { street: 'Main Road', city: 'Bhimavaram', state: 'Andhra Pradesh', zipCode: '534201', country: 'India' },
    contact: { phone: '+919666499996', email: 'info@varmahospitals.com', website: 'https://www.varmahospitals.com/', emergency: '+919666499996' },
    coordinates: { latitude: 16.5449, longitude: 81.5212 },
    departments: [
      { name: 'Cardiology',       isAvailable: true },
      { name: 'Other', isAvailable: true },
      { name: 'Surgery', isAvailable: true },
      { name: 'Gynecology',       isAvailable: true }
    ],
    facilities: [
      { name: 'ICU',        isAvailable: true },
      { name: 'Laboratory', isAvailable: true },
      { name: 'Pharmacy',   isAvailable: true },
      { name: 'X-Ray',      isAvailable: true }
    ],
    services: [
      { name: 'OPD Consultation', cost: 400,  isAvailable: true },
      { name: 'Emergency Care',   cost: 1200, isAvailable: true },
      { name: 'Surgery',          cost: 30000,isAvailable: true }
    ],
    capacity: { totalBeds: 150, availableBeds: 40, icuBeds: 15, emergencyBeds: 20 },
    operatingHours: {
      monday:    { open: '08:00', close: '20:00', isOpen: true },
      tuesday:   { open: '08:00', close: '20:00', isOpen: true },
      wednesday: { open: '08:00', close: '20:00', isOpen: true },
      thursday:  { open: '08:00', close: '20:00', isOpen: true },
      friday:    { open: '08:00', close: '20:00', isOpen: true },
      saturday:  { open: '09:00', close: '17:00', isOpen: true },
      sunday:    { open: '09:00', close: '14:00', isOpen: true }
    },
    emergencyServices: { isAvailable: true, responseTime: 10, specialties: ['Cardiac', 'General Surgery'] },
    insurance: [{ provider: 'Star Health', isAccepted: true }, { provider: 'HDFC Ergo', isAccepted: true }],
    ratings: { overall: 4.8, cleanliness: 4.7, staff: 4.8, treatment: 4.8, totalReviews: 2405 },
    description: 'Advanced multi-speciality hospital in Bhimavaram.',
    isActive: true, verified: true
  },

  // ── 7. Imperial Hospitals – Bhimavaram (from search file) ────────────────
  {
    name: 'Imperial Hospitals',
    type: 'private',
    address: { street: 'NH 16', city: 'Bhimavaram', state: 'Andhra Pradesh', zipCode: '534201', country: 'India' },
    contact: { phone: '+918816279999', email: 'info@imperialhospitals.net', website: 'https://imperialhospitals.net/', emergency: '+918816279999' },
    coordinates: { latitude: 16.5435, longitude: 81.5235 },
    departments: [
      { name: 'Orthopedics',    isAvailable: true },
      { name: 'Neurology',      isAvailable: true },
      { name: 'Emergency', isAvailable: true }
    ],
    facilities: [
      { name: 'ICU',      isAvailable: true },
      { name: 'MRI',      isAvailable: true },
      { name: 'X-Ray',    isAvailable: true },
      { name: 'Pharmacy', isAvailable: true }
    ],
    services: [
      { name: 'OPD Consultation', cost: 400,  isAvailable: true },
      { name: 'Emergency Care',   cost: 1000, isAvailable: true }
    ],
    capacity: { totalBeds: 50, availableBeds: 15, icuBeds: 8, emergencyBeds: 10 },
    operatingHours: {
      monday:    { open: '08:00', close: '20:00', isOpen: true },
      tuesday:   { open: '08:00', close: '20:00', isOpen: true },
      wednesday: { open: '08:00', close: '20:00', isOpen: true },
      thursday:  { open: '08:00', close: '20:00', isOpen: true },
      friday:    { open: '08:00', close: '20:00', isOpen: true },
      saturday:  { open: '09:00', close: '17:00', isOpen: true },
      sunday:    { open: '09:00', close: '13:00', isOpen: true }
    },
    emergencyServices: { isAvailable: true, responseTime: 10, specialties: ['Orthopedic', 'Neuro'] },
    insurance: [{ provider: 'Star Health', isAccepted: true }, { provider: 'Bajaj Allianz', isAccepted: true }],
    ratings: { overall: 4.7, cleanliness: 4.6, staff: 4.7, treatment: 4.7, totalReviews: 905 },
    description: '50 bedded multispeciality hospital.',
    isActive: true, verified: true
  },

  // ── 8. Akshara Speciality Hospitals – Bhimavaram (from search file) ───────
  {
    name: 'Akshara Speciality Hospitals',
    type: 'specialty',
    address: { street: 'Inamulavari Street', city: 'Bhimavaram', state: 'Andhra Pradesh', zipCode: '534201', country: 'India' },
    contact: { phone: '+917036601444', email: 'info@aksharahospitals.com', website: 'https://aksharahospitals.com/', emergency: '+917036601444' },
    coordinates: { latitude: 16.5511, longitude: 81.4978 },
    departments: [
      { name: 'Orthopedics',    isAvailable: true },
      { name: 'General Medicine',isAvailable: true }
    ],
    facilities: [
      { name: 'X-Ray',      isAvailable: true },
      { name: 'Laboratory', isAvailable: true },
      { name: 'Pharmacy',   isAvailable: true }
    ],
    services: [
      { name: 'OPD Consultation', cost: 350, isAvailable: true },
      { name: 'Emergency Care',   cost: 900, isAvailable: true }
    ],
    capacity: { totalBeds: 80, availableBeds: 20, icuBeds: 10, emergencyBeds: 8 },
    operatingHours: {
      monday:    { open: '08:00', close: '20:00', isOpen: true },
      tuesday:   { open: '08:00', close: '20:00', isOpen: true },
      wednesday: { open: '08:00', close: '20:00', isOpen: true },
      thursday:  { open: '08:00', close: '20:00', isOpen: true },
      friday:    { open: '08:00', close: '20:00', isOpen: true },
      saturday:  { open: '09:00', close: '17:00', isOpen: true },
      sunday:    { open: '09:00', close: '14:00', isOpen: true }
    },
    emergencyServices: { isAvailable: true, responseTime: 12, specialties: ['Orthopedic'] },
    insurance: [{ provider: 'Star Health', isAccepted: true }],
    ratings: { overall: 4.9, cleanliness: 4.9, staff: 4.9, treatment: 4.8, totalReviews: 540 },
    description: 'Leading speciality hospital known for orthopedic services.',
    isActive: true, verified: true
  },

  // ── 9. Delta Hospitals – Rajahmundry (from search file) ──────────────────
  {
    name: 'Delta Hospitals',
    type: 'private',
    address: { street: 'T Nagar', city: 'Rajahmundry', state: 'Andhra Pradesh', zipCode: '533101', country: 'India' },
    contact: { phone: '+918886660000', email: 'info@deltahospitals.com', website: 'https://www.deltahospitals.com/', emergency: '+918886660000' },
    coordinates: { latitude: 17.0005, longitude: 81.8040 },
    departments: [
      { name: 'ICU', isAvailable: true },
      { name: 'Cardiology',    isAvailable: true },
      { name: 'Neurology',     isAvailable: true }
    ],
    facilities: [
      { name: 'ICU',      isAvailable: true },
      { name: 'CT Scan',  isAvailable: true },
      { name: 'MRI',      isAvailable: true },
      { name: 'Pharmacy', isAvailable: true }
    ],
    services: [
      { name: 'OPD Consultation', cost: 500,  isAvailable: true },
      { name: 'Emergency Care',   cost: 1500, isAvailable: true }
    ],
    capacity: { totalBeds: 200, availableBeds: 60, icuBeds: 25, emergencyBeds: 20 },
    operatingHours: {
      monday:    { open: '08:00', close: '21:00', isOpen: true },
      tuesday:   { open: '08:00', close: '21:00', isOpen: true },
      wednesday: { open: '08:00', close: '21:00', isOpen: true },
      thursday:  { open: '08:00', close: '21:00', isOpen: true },
      friday:    { open: '08:00', close: '21:00', isOpen: true },
      saturday:  { open: '09:00', close: '18:00', isOpen: true },
      sunday:    { open: '09:00', close: '15:00', isOpen: true }
    },
    emergencyServices: { isAvailable: true, responseTime: 7, specialties: ['Cardiac', 'Neuro', 'Critical Care'] },
    insurance: [{ provider: 'Star Health', isAccepted: true }, { provider: 'Max Bupa', isAccepted: true }],
    ratings: { overall: 4.7, cleanliness: 4.6, staff: 4.7, treatment: 4.7, totalReviews: 1500 },
    description: "One of Rajahmundry's leading multispeciality hospitals.",
    isActive: true, verified: true
  },

  // ── 10. SAI Hospital – Rajahmundry (from search file) ────────────────────
  {
    name: 'SAI Hospital',
    type: 'private',
    address: { street: 'Morampudi Road', city: 'Rajahmundry', state: 'Andhra Pradesh', zipCode: '533103', country: 'India' },
    contact: { phone: '+918886111111', email: 'info@saihospitals.com', website: 'https://saihospitals.com/', emergency: '+918886111111' },
    coordinates: { latitude: 17.0050, longitude: 81.7890 },
    departments: [
      { name: 'Surgery', isAvailable: true },
      { name: 'Other', isAvailable: true },
      { name: 'Other', isAvailable: true }
    ],
    facilities: [
      { name: 'ICU',         isAvailable: true },
      { name: 'Robotic OT',  isAvailable: true },
      { name: 'Laboratory',  isAvailable: true },
      { name: 'Pharmacy',    isAvailable: true }
    ],
    services: [
      { name: 'OPD Consultation', cost: 500,   isAvailable: true },
      { name: 'Robotic Surgery',  cost: 80000, isAvailable: true },
      { name: 'Dental Consult',   cost: 300,   isAvailable: true }
    ],
    capacity: { totalBeds: 150, availableBeds: 35, icuBeds: 20, emergencyBeds: 15 },
    operatingHours: {
      monday:    { open: '08:00', close: '21:00', isOpen: true },
      tuesday:   { open: '08:00', close: '21:00', isOpen: true },
      wednesday: { open: '08:00', close: '21:00', isOpen: true },
      thursday:  { open: '08:00', close: '21:00', isOpen: true },
      friday:    { open: '08:00', close: '21:00', isOpen: true },
      saturday:  { open: '09:00', close: '18:00', isOpen: true },
      sunday:    { open: '09:00', close: '14:00', isOpen: true }
    },
    emergencyServices: { isAvailable: true, responseTime: 8, specialties: ['Robotic Surgery', 'Pulmonology'] },
    insurance: [{ provider: 'Star Health', isAccepted: true }, { provider: 'Bajaj Allianz', isAccepted: true }],
    ratings: { overall: 4.6, cleanliness: 4.5, staff: 4.6, treatment: 4.6, totalReviews: 980 },
    description: 'Premier multispeciality hospital with robotic surgery.',
    isActive: true, verified: true
  }
];

// ─── SHARED DOCTORS (used across the search-file hospitals) ───────────────────
// These 8 doctors appear in all 7 search-file hospitals.
// Each doctor is created once per hospital they belong to.

const SHARED_DOCTOR_TEMPLATES = [
  { name: 'Dr. Rajesh Kumar',  specialty: 'Cardiologist',      specialization: 'Cardiology',       department: 'Cardiology',       experience: 12, fees: 700,  rating: 4.8 },
  { name: 'Dr. Priya Sharma',  specialty: 'Neurologist',       specialization: 'Neurology',        department: 'Neurology',        experience: 9,  fees: 600,  rating: 4.7 },
  { name: 'Dr. Arun Kumar',    specialty: 'Orthopedic',        specialization: 'Orthopedics',      department: 'Orthopedics',      experience: 15, fees: 800,  rating: 4.9 },
  { name: 'Dr. Meena Reddy',   specialty: 'Dermatologist',     specialization: 'Dermatology',      department: 'General Medicine', experience: 7,  fees: 500,  rating: 4.5 },
  { name: 'Dr. Suresh Naidu',  specialty: 'ENT Specialist',    specialization: 'Other', department: 'Other',              experience: 11, fees: 550,  rating: 4.6 },
  { name: 'Dr. Kavitha Rao',   specialty: 'Gynecologist',      specialization: 'Gynecology',       department: 'Gynecology',       experience: 13, fees: 750,  rating: 4.8 },
  { name: 'Dr. Harish Varma',  specialty: 'Pediatrician',      specialization: 'Pediatrics',       department: 'Pediatrics',       experience: 10, fees: 450,  rating: 4.7 },
  { name: 'Dr. Vinay Krishna', specialty: 'General Physician', specialization: 'General Medicine', department: 'General Medicine', experience: 14, fees: 400,  rating: 4.5 }
];

// Apollo Hyderabad gets a slightly different set (doctorId 1–4 with availableToday flags)
const APOLLO_HYD_DOCTORS = [
  { name: 'Dr. Rajesh Kumar', specialty: 'Cardiologist',  specialization: 'Cardiology',  department: 'Cardiology',  experience: 12, fees: 700, rating: 4.8, availableToday: true  },
  { name: 'Dr. Priya Sharma', specialty: 'Neurologist',   specialization: 'Neurology',   department: 'Neurology',   experience: 9,  fees: 600, rating: 4.7, availableToday: true  },
  { name: 'Dr. Arun Kumar',   specialty: 'Orthopedic',    specialization: 'Orthopedics', department: 'Orthopedics', experience: 15, fees: 800, rating: 4.9, availableToday: false },
  { name: 'Dr. Sneha Reddy',  specialty: 'Dermatologist', specialization: 'Dermatology', department: 'General Medicine', experience: 7, fees: 500, rating: 4.6, availableToday: true }
];

function defaultAvailability() {
  return {
    monday:    { isAvailable: true,  startTime: '09:00', endTime: '17:00', maxPatients: 20 },
    tuesday:   { isAvailable: true,  startTime: '09:00', endTime: '17:00', maxPatients: 20 },
    wednesday: { isAvailable: true,  startTime: '09:00', endTime: '17:00', maxPatients: 20 },
    thursday:  { isAvailable: true,  startTime: '09:00', endTime: '17:00', maxPatients: 20 },
    friday:    { isAvailable: true,  startTime: '09:00', endTime: '17:00', maxPatients: 20 },
    saturday:  { isAvailable: true,  startTime: '10:00', endTime: '14:00', maxPatients: 10 },
    sunday:    { isAvailable: false, startTime: '',      endTime: '',      maxPatients: 0  }
  };
}

function buildDoctorData(hospitals) {
  const docs = [];

  // Index map: name → hospital index in the inserted array
  const idx = (name) => hospitals.findIndex(h => h.name === name);

  // ── Original seed doctors ─────────────────────────────────────────────────
  docs.push({
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@citygeneralhospital.com',
    phone: '+91-9876543210',
    specialization: 'General Medicine',
    hospital: hospitals[idx('City General Hospital')]._id,
    department: 'General Medicine',
    licenseNumber: 'MH-GM-2010-001',
    experience: 14,
    education: [
      { degree: 'MBBS', institution: 'AIIMS Delhi', year: 2008 },
      { degree: 'MD',   institution: 'AIIMS Delhi', year: 2011 }
    ],
    certifications: [{ name: 'Fellow of Internal Medicine', issuingAuthority: 'MCI', year: 2012 }],
    availability: {
      monday:    { isAvailable: true,  startTime: '09:00', endTime: '17:00', maxPatients: 20 },
      tuesday:   { isAvailable: true,  startTime: '09:00', endTime: '17:00', maxPatients: 20 },
      wednesday: { isAvailable: true,  startTime: '09:00', endTime: '17:00', maxPatients: 20 },
      thursday:  { isAvailable: true,  startTime: '09:00', endTime: '17:00', maxPatients: 20 },
      friday:    { isAvailable: true,  startTime: '09:00', endTime: '17:00', maxPatients: 20 },
      saturday:  { isAvailable: false, startTime: '',      endTime: '',      maxPatients: 0  },
      sunday:    { isAvailable: false, startTime: '',      endTime: '',      maxPatients: 0  }
    },
    consultationFee: 300,
    rating: { average: 4.3, totalReviews: 85 },
    bio: 'Experienced general physician with 14 years of practice in internal medicine and preventive care.',
    languages: ['English', 'Hindi', 'Marathi'],
    isActive: true, verified: true
  });

  docs.push({
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@citygeneralhospital.com',
    phone: '+91-9876543211',
    specialization: 'Cardiology',
    hospital: hospitals[idx('City General Hospital')]._id,
    department: 'Cardiology',
    licenseNumber: 'MH-CD-2013-002',
    experience: 11,
    education: [
      { degree: 'MBBS',          institution: 'KEM Hospital Mumbai', year: 2010 },
      { degree: 'DM Cardiology', institution: 'AIIMS Delhi',         year: 2014 }
    ],
    certifications: [{ name: 'Interventional Cardiology', issuingAuthority: 'Cardiological Society of India', year: 2015 }],
    availability: {
      monday:    { isAvailable: true,  startTime: '10:00', endTime: '18:00', maxPatients: 15 },
      tuesday:   { isAvailable: true,  startTime: '10:00', endTime: '18:00', maxPatients: 15 },
      wednesday: { isAvailable: false, startTime: '',      endTime: '',      maxPatients: 0  },
      thursday:  { isAvailable: true,  startTime: '10:00', endTime: '18:00', maxPatients: 15 },
      friday:    { isAvailable: true,  startTime: '10:00', endTime: '18:00', maxPatients: 15 },
      saturday:  { isAvailable: true,  startTime: '10:00', endTime: '14:00', maxPatients: 10 },
      sunday:    { isAvailable: false, startTime: '',      endTime: '',      maxPatients: 0  }
    },
    consultationFee: 600,
    rating: { average: 4.6, totalReviews: 120 },
    bio: 'Cardiologist specializing in interventional procedures and heart failure management.',
    languages: ['English', 'Hindi'],
    isActive: true, verified: true
  });

  docs.push({
    name: 'Dr. Anil Mehta',
    email: 'anil.mehta@apollospecialty.com',
    phone: '+91-9876543212',
    specialization: 'Neurology',
    hospital: hospitals[idx('Apollo Specialty Hospital')]._id,
    department: 'Neurology',
    licenseNumber: 'KA-NL-2009-003',
    experience: 16,
    education: [
      { degree: 'MBBS',         institution: 'Bangalore Medical College', year: 2006 },
      { degree: 'DM Neurology', institution: 'NIMHANS',                   year: 2010 }
    ],
    certifications: [{ name: 'Stroke Specialist', issuingAuthority: 'Indian Academy of Neurology', year: 2011 }],
    availability: {
      monday:    { isAvailable: true,  startTime: '08:00', endTime: '16:00', maxPatients: 18 },
      tuesday:   { isAvailable: true,  startTime: '08:00', endTime: '16:00', maxPatients: 18 },
      wednesday: { isAvailable: true,  startTime: '08:00', endTime: '16:00', maxPatients: 18 },
      thursday:  { isAvailable: true,  startTime: '08:00', endTime: '16:00', maxPatients: 18 },
      friday:    { isAvailable: true,  startTime: '08:00', endTime: '16:00', maxPatients: 18 },
      saturday:  { isAvailable: true,  startTime: '09:00', endTime: '13:00', maxPatients: 10 },
      sunday:    { isAvailable: false, startTime: '',      endTime: '',      maxPatients: 0  }
    },
    consultationFee: 800,
    rating: { average: 4.8, totalReviews: 200 },
    bio: 'Senior neurologist with expertise in stroke management, epilepsy, and neurodegenerative disorders.',
    languages: ['English', 'Hindi', 'Kannada'],
    isActive: true, verified: true
  });

  docs.push({
    name: 'Dr. Sunita Patel',
    email: 'sunita.patel@apollospecialty.com',
    phone: '+91-9876543213',
    specialization: 'Oncology',
    hospital: hospitals[idx('Apollo Specialty Hospital')]._id,
    department: 'Oncology',
    licenseNumber: 'KA-OC-2011-004',
    experience: 13,
    education: [
      { degree: 'MBBS',        institution: "St. John's Medical College", year: 2008 },
      { degree: 'MD Oncology', institution: 'Tata Memorial Hospital',     year: 2012 }
    ],
    certifications: [{ name: 'Medical Oncology Board Certification', issuingAuthority: 'ESMO', year: 2013 }],
    availability: {
      monday:    { isAvailable: true,  startTime: '09:00', endTime: '17:00', maxPatients: 12 },
      tuesday:   { isAvailable: true,  startTime: '09:00', endTime: '17:00', maxPatients: 12 },
      wednesday: { isAvailable: true,  startTime: '09:00', endTime: '17:00', maxPatients: 12 },
      thursday:  { isAvailable: false, startTime: '',      endTime: '',      maxPatients: 0  },
      friday:    { isAvailable: true,  startTime: '09:00', endTime: '17:00', maxPatients: 12 },
      saturday:  { isAvailable: false, startTime: '',      endTime: '',      maxPatients: 0  },
      sunday:    { isAvailable: false, startTime: '',      endTime: '',      maxPatients: 0  }
    },
    consultationFee: 1000,
    rating: { average: 4.7, totalReviews: 175 },
    bio: 'Oncologist specializing in breast cancer, lung cancer, and targeted therapy.',
    languages: ['English', 'Hindi', 'Gujarati'],
    isActive: true, verified: true
  });

  docs.push({
    name: 'Dr. Kavita Singh',
    email: 'kavita.singh@sunrisechildren.com',
    phone: '+91-9876543214',
    specialization: 'Pediatrics',
    hospital: hospitals[idx("Sunrise Children's Hospital")]._id,
    department: 'Pediatrics',
    licenseNumber: 'DL-PD-2012-005',
    experience: 12,
    education: [
      { degree: 'MBBS',         institution: 'Lady Hardinge Medical College', year: 2009 },
      { degree: 'MD Pediatrics',institution: 'AIIMS Delhi',                   year: 2013 }
    ],
    certifications: [{ name: 'Neonatal Resuscitation', issuingAuthority: 'IAP', year: 2014 }],
    availability: defaultAvailability(),
    consultationFee: 500,
    rating: { average: 4.5, totalReviews: 140 },
    bio: 'Pediatrician with a focus on child development, vaccination, and neonatal care.',
    languages: ['English', 'Hindi'],
    isActive: true, verified: true
  });

  // ── Search-file hospital doctors ─────────────────────────────────────────
  // Hospitals that use the shared 8-doctor template:
  const sharedHospitals = [
    'Yashoda Hospital',
    'Varma Hospitals',
    'Imperial Hospitals',
    'Akshara Speciality Hospitals',
    'Delta Hospitals',
    'SAI Hospital'
  ];

  sharedHospitals.forEach((hospitalName) => {
    const hospital = hospitals.find(h => h.name === hospitalName);
    if (!hospital) return;

    SHARED_DOCTOR_TEMPLATES.forEach((tmpl, i) => {
      docs.push({
        name: tmpl.name,
        email: `${tmpl.name.toLowerCase().replace(/\s+/g, '.').replace('dr.', 'dr')}@${hospitalName.toLowerCase().replace(/\s+/g, '')}${i + 1}.com`,
        phone: `+91-98765${String(43220 + docs.length).padStart(5, '0')}`,
        specialization: tmpl.specialization,
        hospital: hospital._id,
        department: tmpl.department,
        licenseNumber: `${hospitalName.substring(0, 2).toUpperCase()}-${tmpl.department.substring(0, 2).toUpperCase()}-2015-${String(docs.length + 100).padStart(3, '0')}`,
        experience: tmpl.experience,
        education: [{ degree: 'MBBS', institution: 'NTR University of Health Sciences', year: 2010 }],
        certifications: [],
        availability: defaultAvailability(),
        consultationFee: tmpl.fees,
        rating: { average: tmpl.rating, totalReviews: 50 },
        bio: `${tmpl.specialty} with ${tmpl.experience} years of experience.`,
        languages: ['English', 'Telugu', 'Hindi'],
        isActive: true,
        verified: true
      });
    });
  });

  // ── Apollo Hospital – Hyderabad doctors ───────────────────────────────────
  const apolloHyd = hospitals.find(h => h.name === 'Apollo Hospital');
  if (apolloHyd) {
    APOLLO_HYD_DOCTORS.forEach((tmpl, i) => {
      docs.push({
        name: tmpl.name,
        email: `${tmpl.name.toLowerCase().replace(/\s+/g, '.').replace('dr.', 'dr')}@apollohyd${i + 1}.com`,
        phone: `+91-98765${String(43290 + i).padStart(5, '0')}`,
        specialization: tmpl.specialization,
        hospital: apolloHyd._id,
        department: tmpl.department,
        licenseNumber: `TS-${tmpl.department.substring(0, 2).toUpperCase()}-2015-${String(200 + i).padStart(3, '0')}`,
        experience: tmpl.experience,
        education: [{ degree: 'MBBS', institution: 'Osmania Medical College', year: 2010 }],
        certifications: [],
        availability: defaultAvailability(),
        consultationFee: tmpl.fees,
        rating: { average: tmpl.rating, totalReviews: 80 },
        bio: `${tmpl.specialty} with ${tmpl.experience} years of experience at Apollo Hyderabad.`,
        languages: ['English', 'Telugu', 'Hindi'],
        isActive: true,
        verified: true
      });
    });
  }

  return docs;
}

// ─── SEED ─────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Hospital.deleteMany({});
    await Doctor.deleteMany({});
    console.log('🗑️  Cleared existing hospitals and doctors');

    const hospitals = await Hospital.insertMany(hospitalData);
    console.log(`🏥 Inserted ${hospitals.length} hospitals`);
    hospitals.forEach(h => console.log(`   → ${h.name} (${h.address.city}): ${h._id}`));

    const doctorData = buildDoctorData(hospitals);
    const doctors = await Doctor.insertMany(doctorData);
    console.log(`\n👨‍⚕️ Inserted ${doctors.length} doctors`);
    doctors.forEach(d => console.log(`   → ${d.name} (${d.specialization}): ${d._id}`));

    console.log('\n✅ Seeding complete!');
    console.log('\n📋 Hospital IDs for reference:');
    hospitals.forEach(h => console.log(`   "${h.name}" → "${h._id}"`));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
import axios from 'axios';
import HospitalMap from "./HospitalMap";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, MapPin, Star, CheckCircle, SlidersHorizontal, Navigation, 
  Phone, ExternalLink, Heart, Calendar, User, ArrowLeft, 
  Users
} from 'lucide-react';
import ReactCalendar from 'react-calendar';
import { useAuth } from '../../contexts/AuthContext';
import { doctorAPI, appointmentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import styles from './HospitalSearch.module.css';

const mapSpecialtyToDepartment = (specialty) => {
  if (!specialty) return 'Other';
  const s = specialty.toLowerCase();
  if (s.includes('cardio'))    return 'Cardiology';
  if (s.includes('derma'))     return 'Dermatology';
  if (s.includes('neuro'))     return 'Neurology';
  if (s.includes('ortho'))     return 'Orthopedics';
  if (s.includes('gynec'))     return 'Gynecology';
  if (s.includes('pediatr'))   return 'Pediatrics';
  if (s.includes('general') || s.includes('physician')) return 'General Medicine';
  if (s.includes('gastro'))    return 'Gastroenterology';
  if (s.includes('oncol'))     return 'Oncology';
  if (s.includes('ophthal'))   return 'Ophthalmology';
  if (s.includes('psychi'))    return 'Psychiatry';
  if (s.includes('surg'))      return 'Surgery';
  if (s.includes('urol'))      return 'Urology';
  return 'Other';
};

const HospitalSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
  if (
    location.state?.selectedDoctor &&
    location.state?.openBooking
  ) {
    setSelectedDoctor(
      location.state.selectedDoctor
    );

    setSelectedHospital({
  name:
    location.state.selectedDoctor.hospital,

  _id:
    location.state.selectedDoctor.hospitalId
});

    setCurrentView("booking");
  }
}, [location.state]);
  const { user } = useAuth();
    const [likedDoctors, setLikedDoctors] = useState(() => {
  const userId = user?._id || user?.id;
  if (!userId) return [];
  const saved = localStorage.getItem(`likedDoctors_${userId}`);
  return saved ? JSON.parse(saved) : [];
});
const toggleLikedDoctor = (doctor, hospital) => {
  const doctorId =
    doctor._id ||
    doctor.id ||
    doctor.doctorId;

  const exists = likedDoctors.find(
    d => d.id === doctorId
  );

  let updated;

  if (exists) {
    updated = likedDoctors.filter(
      d => d.id !== doctorId
    );

    toast.dismiss();
    toast.success("Removed from favourites");
  } else {
    updated = [
      ...likedDoctors,
      {
        id: doctorId,
        _id: doctorId,

        name: doctor.name,

        specialty:
          doctor.specialization ||
          doctor.specialty,

        fees:
          doctor.consultationFee ||
          doctor.fees,

        rating:
          doctor.rating?.average ??
          doctor.rating ??
          0,

        hospital:
          hospital?.name || "",

        hospitalId:
          hospital?._id ||
          hospital?.id ||
          hospital?.hospitalId
      }
    ];

    toast.dismiss();
    toast.success("Added to favourites ❤️");
  }

  setLikedDoctors(updated);

 const userId = user?._id || user?.id;
if (userId) {
  localStorage.setItem(`likedDoctors_${userId}`, JSON.stringify(updated));
}
};
  // State management
  const [hospitals, setHospitals] = useState([]);
  const sampleHospitals = [

  // HYDERABAD

  {
    hospitalId: 1,

    name: "Apollo Hospital",

    address: {
      city: "Hyderabad",
      state: "Telangana"
    },

    contact: {
      phone: "04023607777",
      website: "https://www.apollohospitals.com"
    },

    coordinates: {
      lat: 17.4156,
      lng: 78.4347
    },

    ratings: {
      overall: 4.7,
      totalReviews: 2400
    },

    departments: [
      { name: "Cardiology" },
      { name: "Neurology" },
      { name: "Cancer Care" }
    ],
     doctors: [

  {
    doctorId: 1,
    name: "Dr. Rajesh Kumar",
    specialty: "Cardiologist",
    experience: "12 Years",
    fees: 700,
    rating: 4.8,
    availableToday: true,
  },

  {
    doctorId: 2,
    name: "Dr. Priya Sharma",
    specialty: "Neurologist",
    experience: "9 Years",
    fees: 600,
    rating: 4.7,
    availableToday: true,
  },

  {
    doctorId: 3,
    name: "Dr. Arun Kumar",
    specialty: "Orthopedic",
    experience: "15 Years",
    fees: 800,
    rating: 4.9,
    availableToday: false,
  },

  {
    doctorId: 4,
    name: "Dr. Sneha Reddy",
    specialty: "Dermatologist",
    experience: "7 Years",
    fees: 500,
    rating: 4.6,
    availableToday: true,
  }

],
    description:
      "Advanced multi-speciality hospital."
  },

  {
    hospitalId: 2,

    name: "Yashoda Hospital",

    address: {
      city: "Hyderabad",
      state: "Telangana"
    },

    contact: {
      phone: "04045674567",
      website: "https://www.yashodahospitals.com"
    },

    coordinates: {
      lat: 17.4239,
      lng: 78.4591
    },

    ratings: {
      overall: 4.5,
      totalReviews: 1800
    },

    departments: [
      { name: "Cardiology" },
      { name: "Orthopedics" }
    ],
    doctors: [

  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    specialty: "Cardiologist",
    experience: "12 Years",
    fees: 700,
    rating: 4.8,
  },

  {
    id: 2,
    name: "Dr. Priya Sharma",
    specialty: "Neurologist",
    experience: "9 Years",
    fees: 600,
    rating: 4.7,
  },

  {
    id: 3,
    name: "Dr. Arun Kumar",
    specialty: "Orthopedic",
    experience: "15 Years",
    fees: 800,
    rating: 4.9,
  },

  {
    id: 4,
    name: "Dr. Meena Reddy",
    specialty: "Dermatologist",
    experience: "7 Years",
    fees: 500,
    rating: 4.5,
  },

  {
    id: 5,
    name: "Dr. Suresh Naidu",
    specialty: "ENT Specialist",
    experience: "11 Years",
    fees: 550,
    rating: 4.6,
  },

  {
    id: 6,
    name: "Dr. Kavitha Rao",
    specialty: "Gynecologist",
    experience: "13 Years",
    fees: 750,
    rating: 4.8,
  },

  {
    id: 7,
    name: "Dr. Harish Varma",
    specialty: "Pediatrician",
    experience: "10 Years",
    fees: 450,
    rating: 4.7,
  },

  {
    id: 8,
    name: "Dr. Vinay Krishna",
    specialty: "General Physician",
    experience: "14 Years",
    fees: 400,
    rating: 4.5,
  }

],

    description:
      "Trusted healthcare with modern facilities."
  },

  // BHIMAVARAM

  {
    hospitalId: 3,

    name: "Varma Hospitals",

    address: {
      city: "Bhimavaram",
      state: "Andhra Pradesh"
    },

    contact: {
      phone: "+919666499996",
      website: "https://www.varmahospitals.com/"
    },

    coordinates: {
      lat: 16.5449,
      lng: 81.5212
    },

    ratings: {
      overall: 4.8,
      totalReviews: 2405
    },

    departments: [
      { name: "Cardiology" },
      { name: "ENT" },
      { name: "General Surgery" },
      { name: "Gynecology" }
    ],
doctors: [

  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    specialty: "Cardiologist",
    experience: "12 Years",
    fees: 700,
    rating: 4.8,
  },

  {
    id: 2,
    name: "Dr. Priya Sharma",
    specialty: "Neurologist",
    experience: "9 Years",
    fees: 600,
    rating: 4.7,
  },

  {
    id: 3,
    name: "Dr. Arun Kumar",
    specialty: "Orthopedic",
    experience: "15 Years",
    fees: 800,
    rating: 4.9,
  },

  {
    id: 4,
    name: "Dr. Meena Reddy",
    specialty: "Dermatologist",
    experience: "7 Years",
    fees: 500,
    rating: 4.5,
  },

  {
    id: 5,
    name: "Dr. Suresh Naidu",
    specialty: "ENT Specialist",
    experience: "11 Years",
    fees: 550,
    rating: 4.6,
  },

  {
    id: 6,
    name: "Dr. Kavitha Rao",
    specialty: "Gynecologist",
    experience: "13 Years",
    fees: 750,
    rating: 4.8,
  },

  {
    id: 7,
    name: "Dr. Harish Varma",
    specialty: "Pediatrician",
    experience: "10 Years",
    fees: 450,
    rating: 4.7,
  },

  {
    id: 8,
    name: "Dr. Vinay Krishna",
    specialty: "General Physician",
    experience: "14 Years",
    fees: 400,
    rating: 4.5,
  }

],
    description:
      "Advanced multi-speciality hospital in Bhimavaram."
  },

  {
    hospitalId: 4,

    name: "Imperial Hospitals",

    address: {
      city: "Bhimavaram",
      state: "Andhra Pradesh"
    },

    contact: {
      phone: "+918816279999",
      website: "https://imperialhospitals.net/"
    },

    coordinates: {
      lat: 16.5435,
      lng: 81.5235
    },

    ratings: {
      overall: 4.7,
      totalReviews: 905
    },

    departments: [
      { name: "Orthopedics" },
      { name: "Neurology" },
      { name: "Emergency Care" }
    ],
doctors: [

  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    specialty: "Cardiologist",
    experience: "12 Years",
    fees: 700,
    rating: 4.8,
  },

  {
    id: 2,
    name: "Dr. Priya Sharma",
    specialty: "Neurologist",
    experience: "9 Years",
    fees: 600,
    rating: 4.7,
  },

  {
    id: 3,
    name: "Dr. Arun Kumar",
    specialty: "Orthopedic",
    experience: "15 Years",
    fees: 800,
    rating: 4.9,
  },

  {
    id: 4,
    name: "Dr. Meena Reddy",
    specialty: "Dermatologist",
    experience: "7 Years",
    fees: 500,
    rating: 4.5,
  },

  {
    id: 5,
    name: "Dr. Suresh Naidu",
    specialty: "ENT Specialist",
    experience: "11 Years",
    fees: 550,
    rating: 4.6,
  },

  {
    id: 6,
    name: "Dr. Kavitha Rao",
    specialty: "Gynecologist",
    experience: "13 Years",
    fees: 750,
    rating: 4.8,
  },

  {
    id: 7,
    name: "Dr. Harish Varma",
    specialty: "Pediatrician",
    experience: "10 Years",
    fees: 450,
    rating: 4.7,
  },

  {
    id: 8,
    name: "Dr. Vinay Krishna",
    specialty: "General Physician",
    experience: "14 Years",
    fees: 400,
    rating: 4.5,
  }

],
    description:
      "50 bedded multispeciality hospital."
  },

  {
    hospitalId: 5,

    name: "Akshara Speciality Hospitals",

    address: {
      city: "Bhimavaram",
      state: "Andhra Pradesh"
    },

    contact: {
      phone: "+917036601444",
      website: "https://aksharahospitals.com/"
    },

    coordinates: {
      lat: 16.5511,
      lng: 81.4978
    },

    ratings: {
      overall: 4.9,
      totalReviews: 540
    },

    departments: [
      { name: "Orthopedics" },
      { name: "General Medicine" }
    ],
doctors: [

  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    specialty: "Cardiologist",
    experience: "12 Years",
    fees: 700,
    rating: 4.8,
  },

  {
    id: 2,
    name: "Dr. Priya Sharma",
    specialty: "Neurologist",
    experience: "9 Years",
    fees: 600,
    rating: 4.7,
  },

  {
    id: 3,
    name: "Dr. Arun Kumar",
    specialty: "Orthopedic",
    experience: "15 Years",
    fees: 800,
    rating: 4.9,
  },

  {
    id: 4,
    name: "Dr. Meena Reddy",
    specialty: "Dermatologist",
    experience: "7 Years",
    fees: 500,
    rating: 4.5,
  },

  {
    id: 5,
    name: "Dr. Suresh Naidu",
    specialty: "ENT Specialist",
    experience: "11 Years",
    fees: 550,
    rating: 4.6,
  },

  {
    id: 6,
    name: "Dr. Kavitha Rao",
    specialty: "Gynecologist",
    experience: "13 Years",
    fees: 750,
    rating: 4.8,
  },

  {
    id: 7,
    name: "Dr. Harish Varma",
    specialty: "Pediatrician",
    experience: "10 Years",
    fees: 450,
    rating: 4.7,
  },

  {
    id: 8,
    name: "Dr. Vinay Krishna",
    specialty: "General Physician",
    experience: "14 Years",
    fees: 400,
    rating: 4.5,
  }

],
    description:
      "Leading speciality hospital known for orthopedic services."
  },

  // RAJAHMUNDRY

  {
    hospitalId: 6,

    name: "Delta Hospitals",

    address: {
      city: "Rajahmundry",
      state: "Andhra Pradesh"
    },

    contact: {
      phone: "+918886660000",
      website: "https://www.deltahospitals.com/"
    },

    coordinates: {
      lat: 17.0005,
      lng: 81.8040
    },

    ratings: {
      overall: 4.7,
      totalReviews: 1500
    },

    departments: [
      { name: "Critical Care" },
      { name: "Cardiology" },
      { name: "Neurology" }
    ],
doctors: [

  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    specialty: "Cardiologist",
    experience: "12 Years",
    fees: 700,
    rating: 4.8,
  },

  {
    id: 2,
    name: "Dr. Priya Sharma",
    specialty: "Neurologist",
    experience: "9 Years",
    fees: 600,
    rating: 4.7,
  },

  {
    id: 3,
    name: "Dr. Arun Kumar",
    specialty: "Orthopedic",
    experience: "15 Years",
    fees: 800,
    rating: 4.9,
  },

  {
    id: 4,
    name: "Dr. Meena Reddy",
    specialty: "Dermatologist",
    experience: "7 Years",
    fees: 500,
    rating: 4.5,
  },

  {
    id: 5,
    name: "Dr. Suresh Naidu",
    specialty: "ENT Specialist",
    experience: "11 Years",
    fees: 550,
    rating: 4.6,
    
  },

  {
    id: 6,
    name: "Dr. Kavitha Rao",
    specialty: "Gynecologist",
    experience: "13 Years",
    fees: 750,
    rating: 4.8,
    
  },

  {
    id: 7,
    name: "Dr. Harish Varma",
    specialty: "Pediatrician",
    experience: "10 Years",
    fees: 450,
    rating: 4.7,
    
  },

  {
    id: 8,
    name: "Dr. Vinay Krishna",
    specialty: "General Physician",
    experience: "14 Years",
    fees: 400,
    rating: 4.5,
    
  }

],
    description:
      "One of Rajahmundry's leading multispeciality hospitals."
  },

  {
    hospitalId: 7,

    name: "SAI Hospital",

    address: {
      city: "Rajahmundry",
      state: "Andhra Pradesh"
    },

    contact: {
      phone: "+918886111111",
      website: "https://saihospitals.com/"
    },

    coordinates: {
      lat: 17.0050,
      lng: 81.7890
    },

    ratings: {
      overall: 4.6,
      totalReviews: 980
    },

    departments: [
      { name: "Robotic Surgery" },
      { name: "Pulmonology" },
      { name: "Dental Care" }
    ],
doctors: [

  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    specialty: "Cardiologist",
    experience: "12 Years",
    fees: 700,
    rating: 4.8,
    
  },

  {
    id: 2,
    name: "Dr. Priya Sharma",
    specialty: "Neurologist",
    experience: "9 Years",
    fees: 600,
    rating: 4.7,
    
  },

  {
    id: 3,
    name: "Dr. Arun Kumar",
    specialty: "Orthopedic",
    experience: "15 Years",
    fees: 800,
    rating: 4.9,
    
  },

  {
    id: 4,
    name: "Dr. Meena Reddy",
    specialty: "Dermatologist",
    experience: "7 Years",
    fees: 500,
    rating: 4.5,
    
  },

  {
    id: 5,
    name: "Dr. Suresh Naidu",
    specialty: "ENT Specialist",
    experience: "11 Years",
    fees: 550,
    rating: 4.6,
   
  },

  {
    id: 6,
    name: "Dr. Kavitha Rao",
    specialty: "Gynecologist",
    experience: "13 Years",
    fees: 750,
    rating: 4.8,
    
  },

  {
    id: 7,
    name: "Dr. Harish Varma",
    specialty: "Pediatrician",
    experience: "10 Years",
    fees: 450,
    rating: 4.7,
    
  },

  {
    id: 8,
    name: "Dr. Vinay Krishna",
    specialty: "General Physician",
    experience: "14 Years",
    fees: 400,
    rating: 4.5,
    
  }

],
    description:
      "Premier multispeciality hospital with robotic surgery."
  }

];
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([
  16.5449,
  81.5212
]);
  const [userLocation, setUserLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [showFilters, setShowFilters] = useState(false);
  
  // Doctor and appointment booking states
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);
  // View states
  const [currentView, setCurrentView] = useState('hospitals');
  const [bookingFromAppointments, setBookingFromAppointments] =
  useState(false);
  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setLoading(true);
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`,
            {
              params: { lat, lon: lng, format: 'json' }
            }
          );
          const city =
            response.data.address.city ||
            response.data.address.state ||
            '';
          setSearchTerm(city);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // Fetch hospitals
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      let filtered = [...sampleHospitals];

      if (!searchTerm.trim()) {
        filtered = sampleHospitals.filter(
          (hospital) => hospital.address.city === "Bhimavaram"
        );
      }

      // SEARCH FILTER
      if (searchTerm.trim()) {
        filtered = filtered.filter((hospital) => {
          return (
            hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hospital.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hospital.address.state.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      }

      // SPECIALTY FILTER
      if (selectedSpecialty !== "All Specialties") {
        filtered = filtered.filter((hospital) =>
          hospital.departments?.some((dept) => dept.name === selectedSpecialty)
        );
      }

      // DISTRICT FILTER
      if (selectedDistrict !== "All Districts") {
        filtered = filtered.filter(
          (hospital) => hospital.address.state === selectedDistrict
        );
      }

      // UPDATE MAP CENTER
      if (filtered.length > 0) {
        setMapCenter([filtered[0].coordinates.lat, filtered[0].coordinates.lng]);
      } else {
        setMapCenter([16.5449, 81.5212]);
      }

      setHospitals(filtered);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      toast.error("Failed to fetch hospitals");
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalSelect = async (hospital) => {
  setSelectedHospital(hospital);
  setCurrentView("doctors");
 
  try {
    // hospital._id exists only when data came from the DB.
    // hospital.hospitalId is the numeric id from sampleHospitals.
    // We need a real Mongo _id to query /doctors/hospital/:id.
    // So: first look up the hospital by name to get its _id.
    const { hospitalAPI } = await import('../../services/api'); // already imported at top, just shown for clarity
    const response = await hospitalAPI.getAllHospitals({ name: hospital.name });
    const dbHospitals = response.data?.hospitals || response.data || [];
    const dbHospital = dbHospitals.find(
      (h) => h.name === hospital.name
    );
 
    if (dbHospital) {
      // Save the version with real _id so booking uses it
      setSelectedHospital(dbHospital);
      const doctorRes = await doctorAPI.getDoctorsByHospital(dbHospital._id);
      const dbDoctors = doctorRes.data?.doctors || doctorRes.data || [];
      if (dbDoctors.length > 0) {
        setDoctors(dbDoctors);
        return;
      }
    }
  } catch (err) {
    console.warn("Could not fetch doctors from DB, falling back to local data:", err.message);
  }
 
  // Fallback: use the embedded doctors from sampleHospitals
  setDoctors(hospital.doctors || []);
};

  // Handle doctor selection
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setCurrentView('booking');
  };

  // Handle date selection
 const handleDateSelect = (date) => {
  setSelectedDate(date);
  setSelectedTime('');

  const now = new Date();
  const selected = new Date(date);
  const isToday = now.toDateString() === selected.toDateString();

  const morningCutoff = new Date(selected);
  morningCutoff.setHours(12, 0, 0, 0);

  const eveningCutoff = new Date(selected);
  eveningCutoff.setHours(21, 0, 0, 0);

  const slots = [
    {
      time: "08:00 AM-01:00 PM",
      available: !isToday || now < morningCutoff
    },
    {
      time: "04:00 PM-10:00 PM",
      available: !isToday || now < eveningCutoff
    }
  ];

  setAvailableSlots(slots);
};
useEffect(() => {
  if (location.state?.fromAppointments) {
    setBookingFromAppointments(true);
    const date = location.state.selectedDate;
    setSelectedDate(date);
    handleDateSelect(date);
  }
}, [location]);
useEffect(() => {
  if (currentView === 'booking' && selectedDate) {
    const dateStr = selectedDate instanceof Date
      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`
      : selectedDate;
    handleDateSelect(dateStr);
  }
}, [currentView, selectedDoctor]);
  // ✅ FIXED: Proper ID resolution + validation + fees as number
// REPLACE your existing handleBookAppointment with this:
 
const handleBookAppointment = async () => {
  console.log("DOCTOR OBJECT:", selectedDoctor);
  console.log("HOSPITAL OBJECT:", selectedHospital);
  
  if (!selectedDate) {
    toast.error("Please select date");
    return;
  }
  if (!selectedTime) {
    toast.error("Please select a time slot");
    return;
  }

setBookingLoading(true);
  try {
    const hospitalId = selectedHospital._id || selectedHospital.id;
    const doctorId = selectedDoctor._id || selectedDoctor.id;

    if (!hospitalId) throw new Error("Hospital ID missing");
    if (!doctorId) throw new Error("Doctor ID missing");
    const appointmentData = {
      patient: user._id || user.id,
      hospital: hospitalId,
      doctor: doctorId,
      appointmentDate: selectedDate instanceof Date
  ? new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
      .toISOString().split('T')[0]
  : selectedDate,
      appointmentTime: selectedTime.includes('AM') || selectedTime.includes('PM')
  ? (() => {
      const start = selectedTime.split('-')[0].trim();
      const [time, period] = start.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    })()
  : selectedTime,
      duration: 30,
department: mapSpecialtyToDepartment(selectedDoctor.specialization || selectedDoctor.specialty),
      appointmentType: "consultation",
      reason: "General Consultation",
    };
 
    console.log("SENDING TO API:", appointmentData);
    const result = await appointmentAPI.createAppointment(appointmentData);
    console.log("CREATE RESPONSE:", result);
    toast.success("Appointment booked successfully! , Cancellation available before 8 hours of appointment. ");
    navigate("/appointments");
  } catch (error) {
    console.error("BOOKING ERROR:", error);
    console.error("BOOKING ERROR RESPONSE:", error.response?.data);
    toast.error(error.response?.data?.error || error.message || "Failed to book appointment");
  } finally {
    setBookingLoading(false);
  }
};

  // Filter hospitals
  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch =
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address?.state?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === 'All Specialties' ||
      hospital.departments?.some(dept => dept.name === selectedSpecialty);
    const matchesDistrict =
      selectedDistrict === 'All Districts' ||
      hospital.address?.state === selectedDistrict;
    return matchesSearch && matchesSpecialty && matchesDistrict;
  });

  // Open Google Maps
  const openGoogleMaps = (coordinates) => {
    window.open(`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`, '_blank');
  };

  // Get districts and specialties from hospitals
  const districts = ['All Districts', ...new Set(hospitals.map(h => h.address?.state).filter(Boolean))];
  const specialties = ['All Specialties', ...new Set(hospitals.flatMap(h => h.departments?.map(d => d.name) || []))];

  useEffect(() => {
    fetchHospitals();
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
 []);

  useEffect(() => {
    fetchHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedSpecialty, selectedDistrict]);

  // Render hospitals view
  const renderHospitalsView = () => (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.searchFilterSection}
      >
        <div className={styles.searchBarWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by hospital name, city, or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`${styles.btn} ${styles.filterToggleBtn}`}
        >
          <SlidersHorizontal />
          <span>Filters</span>
        </button>

        {!userLocation && (
          <button
            type="button"
            onClick={handleGetLocation}
            className={`${styles.btn} ${styles.locationBtn}`}
          >
            <MapPin size={16} />
            Get Location
          </button>
        )}
      </motion.div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className={styles.filterPanel}
        >
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className={styles.formSelect}
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Specialty</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className={styles.formSelect}
            >
              {specialties.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading hospitals...</p>
        </div>
      ) : (
        <>
          <div className={styles.hospitalsGrid}>
            {filteredHospitals.map((hospital, index) => (
              <motion.div
                key={hospital.hospitalId || hospital.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={styles.hospitalCard}
              ><div className={styles.accentLine}></div> 
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleGroup}>
                    <h3>{hospital.name}</h3>
                    <p>
                      <MapPin size={14} />
                      {hospital.address?.city}, {hospital.address?.state}
                    </p>
                    {hospital.distance && (
                      <p className={styles.distance}>{hospital.distance} km away</p>
                    )}
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span className={styles.rating}>
                      <Star className={styles.iconXs} />
                      {hospital.ratings?.overall || 0}
                      {" ("}
                      {hospital.ratings?.totalReviews || 0}
                      {" reviews)"}
                    </span>
                    <span className={`${styles.availability} ${styles.available}`}>
                      <CheckCircle size={14} />
                      Available
                    </span>
                  </div>

                  <p className={styles.description}>
                    {hospital.description ||
                      "A trusted healthcare facility providing quality medical services."}
                  </p>

                  <div className={styles.facilities}>
                    <h4>Departments:</h4>
                    <div className={styles.tagList}>
                      {hospital.departments?.slice(0, 4).map((dept, idx) => (
                        <span key={dept.name || idx} className={styles.tag}>
                          {dept.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.contactLinks}>
                    {hospital.coordinates && (
                      <button onClick={() => openGoogleMaps(hospital.coordinates)}>
                        <Navigation size={14} />
                        Directions
                      </button>
                    )}
                    {hospital.contact?.phone && (
                      <a href={`tel:${hospital.contact.phone}`}>
                        <Phone size={14} />
                        Call
                      </a>
                    )}
                    {hospital.contact?.website && (
                      <a
                        href={hospital.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={14} />
                        Website
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleHospitalSelect(hospital)}
                    className={`${styles.btn} ${styles.btnPrimary}`}
                  >
                    <Users size={16} />
                    View Doctors
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* LEAFLET MAP */}
<div className={styles.mapContainer}>
  <HospitalMap
    hospitals={filteredHospitals}
    mapCenter={mapCenter}
  />
</div>
        </>
      )}
    </>
  );

  // Render doctors view
  const renderDoctorsView = () => (
    <>
      <div className={styles.viewHeader}>
  <h2>Doctors at {selectedHospital?.name}</h2>
</div>

      <div className={styles.doctorsGrid}>
        {doctors.map((doctor, index) => (
          <motion.div
            key={doctor._id || doctor.id || doctor.doctorId || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={styles.doctorCard}
          >
           <div className={styles.doctorHeader}>
  <div className={styles.doctorInfo}>
    <h3>{doctor.name}</h3>
    <p className={styles.specialization}>{doctor.specialization || doctor.specialty}</p>
    <p className={styles.experience}>
      {doctor.experience} {typeof doctor.experience === 'number' ? 'Years' : ''} experience
    </p>
  </div>
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
    <div className={styles.doctorRating}>
      <Star size={16} />
      <span>{doctor.rating?.average ?? doctor.rating ?? 0}</span>
    </div>
    <button
      onClick={() => toggleLikedDoctor(doctor, selectedHospital)}
      style={{
        background: likedDoctors.find(d => d.id === (doctor._id || doctor.id || doctor.doctorId))
          ? 'rgba(255,107,129,0.15)' : 'rgba(255,255,255,0.05)',
        border: likedDoctors.find(d => d.id === (doctor._id || doctor.id || doctor.doctorId))
          ? '1px solid rgba(255,107,129,0.4)' : '1px solid #30363d',
        borderRadius: '8px',
        padding: '6px 8px',
        cursor: 'pointer',
        color: likedDoctors.find(d => d.id === (doctor._id || doctor.id || doctor.doctorId))
          ? '#ff6b81' : '#8b949e',
        transition: 'all 0.2s'
      }}
    >
      <Heart size={14} fill={likedDoctors.find(d => d.id === (doctor._id || doctor.id || doctor.doctorId)) ? '#ff6b81' : 'none'} />
    </button>
  </div>
</div>

            <div className={styles.doctorBody}>
              {/* ✅ FIX: Display fees cleanly regardless of format */}
              <p className={styles.consultationFee}>
  ₹{doctor.consultationFee || doctor.fees || 'N/A'} consultation fee
</p>
              {doctor.bio && <p className={styles.bio}>{doctor.bio}</p>}
            </div>

            <div className={styles.doctorFooter}>
              <button
                onClick={() => handleDoctorSelect(doctor)}
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                <Calendar size={16} /> Book Appointment
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {doctors.length === 0 && (
        <div className={styles.emptyState}>
          <User className={styles.emptyIcon} />
          <h3>No Doctors Found</h3>
          <p>No doctors are currently available at this hospital.</p>
        </div>
      )}
    </>
  );

  // Render booking view
  const renderBookingView = () => {
    return (
      <div className={styles.bookingPage}>
       <div className={styles.bookingHeader}>
  <h1>Book Appointment</h1>
</div>

        <div className={styles.bookingCard}>
          <div className={styles.doctorSection}>
            <div className={styles.avatarLarge}>
              {selectedDoctor.name.charAt(0)}
            </div>

            <div className={styles.doctorInfo}>
              <p className={styles.hospitalMini}>{selectedHospital.name}</p>
              <h2>{selectedDoctor.name}</h2>
              <p>{selectedDoctor.specialization || selectedDoctor.specialty}</p>
              <span className={styles.feeText}>
                Consultation Fee: ₹{selectedDoctor.consultationFee || selectedDoctor.fees || 'N/A'}

              </span>

              {bookingFromAppointments && (
                <div className={styles.selectedDatePreview}>
                  Appointment Date:{" "}
                  <strong className={styles.appointmentDateText}>
                    {new Date(selectedDate).toLocaleDateString()}
                  </strong>
                </div>
              )}
            </div>
          </div>

         {!bookingFromAppointments && (
  <div className={styles.dateSection}>
    <label>Select Appointment Date</label>

    {/* Clickable trigger */}
    <div
      className={styles.dateInput}
      onClick={() => setShowBookingCalendar(!showBookingCalendar)}
    >
      {selectedDate
        ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
          })
        : 'dd - mm - yyyy'}
      <span style={{ marginLeft: 'auto', opacity: 0.5 }}>📅</span>
    </div>

    {/* Calendar dropdown */}
    {showBookingCalendar && (
      <div className={styles.calendarDropdown}>
        <ReactCalendar
          onChange={(val) => {
            const d = new Date(val);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            handleDateSelect(dateStr);
            setShowBookingCalendar(false);
          }}
          value={selectedDate ? new Date(selectedDate + 'T00:00:00') : null}
          minDate={new Date()}
          className="booking-calendar"
          tileDisabled={({ date }) => {
            const today = new Date();
            today.setHours(0,0,0,0);
            return date < today;
          }}
        />
      </div>
    )}
  </div>
)}
          {availableSlots.length > 0 && (
            <div className={styles.slotSection}>
              <h3>Available Slots</h3>
              <div className={styles.slotsGrid}>
               {availableSlots.map((slot) => (
  <button
    key={slot.time}
    onClick={() => slot.available && setSelectedTime(slot.time)}
    disabled={!slot.available}
    className={`${styles.slotBtn} ${
      selectedTime === slot.time ? styles.activeSlot : ""
    } ${!slot.available ? styles.disabledSlot : ""}`}
  >
    {slot.time}
    {!slot.available && (
      <span style={{ fontSize: '11px', display: 'block', opacity: 0.6 }}>
        Not available
      </span>
    )}
  </button>
))}
              </div>
            </div>
          )}

          {/* ✅ FIX: Show loading state and disable button while booking */}
          <button
            onClick={handleBookAppointment}
            className={styles.confirmBtn}
            disabled={bookingLoading}
          >
            {bookingLoading ? "Booking..." : "✨ Confirm Appointment"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.hospitalsPage}>
    <div className={styles.pageHeader}>
  <div className={styles.headerLeft}>
    <button
  onClick={() => {
    if (currentView === 'booking') setCurrentView('doctors');
    else if (currentView === 'doctors') setCurrentView('hospitals');
    else navigate('/dashboard');
  }}
  className={styles.backBtn}
>
      <ArrowLeft size={16} color="#ffffff" />
      <span className={styles.backBtnText}>Back</span>
    </button>
    <div className={styles.logo}>
      <div className={styles.logoIconWrapper}>
        <MapPin color="white" size={20} />
      </div>
      <div className={styles.headerTitleGroup}>
        <h1>
          {currentView === 'hospitals' && 'Find Hospitals'}
          {currentView === 'doctors' && `Doctors at ${selectedHospital?.name}`}
          {currentView === 'booking' && 'Book Appointment'}
        </h1>
        <p>
          {currentView === 'hospitals' && 'Search and discover hospitals near you'}
          {currentView === 'doctors' && 'Select a doctor to book your appointment'}
          {currentView === 'booking' && 'Choose your preferred date and time slot'}
        </p>
      </div>
    </div>
  </div>
</div>

      <main className={`${styles.container} ${styles.pageContent}`}>
        {currentView === 'hospitals' && renderHospitalsView()}
        {currentView === 'doctors' && renderDoctorsView()}
        {currentView === 'booking' && renderBookingView()}
      </main>
    </div>
  );
};

export default HospitalSearch;
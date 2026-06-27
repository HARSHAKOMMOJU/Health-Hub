import { appointmentAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import React from "react";
import styles from "./Doctors.module.css";

const Doctors = ({
  selectedHospital,
  selectedDate,
  onBack
}) => {
  const doctors = selectedHospital?.doctors || [];
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBook = async (doctor) => {
    try {
      const appointmentData = {
        patient: user._id || user.id,
        doctor: doctor._id,
        hospital: selectedHospital._id,
        appointmentDate: selectedDate instanceof Date
          ? selectedDate.toISOString().split('T')[0]
          : selectedDate,
        appointmentTime: '09:00',
        duration: 30,
        department: mapSpecialty(doctor.specialization || doctor.specialty),
        appointmentType: 'consultation',
        reason: 'General Consultation',
      };

      console.log("SENDING TO API:", appointmentData);
      const result = await appointmentAPI.createAppointment(appointmentData);
      console.log("CREATE RESPONSE:", result);
      alert(`Appointment booked with ${doctor.name}`);
      navigate('/appointments');
    } catch (error) {
      console.error("Booking error:", error);
      console.error("Error response:", error.response?.data);
      alert(error.response?.data?.error || "Failed to book appointment");
    }
  };

  const mapSpecialty = (specialty) => {
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

  return (
    <div className={styles.doctorsPage}>

      <div className={styles.hero}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back to Hospitals
        </button>
        <div className={styles.headerSection}>
          <h1 className={styles.title}>
            Doctors at {selectedHospital?.name}
          </h1>
          <p className={styles.subtitle}>
            {doctors.length} Specialists Available
          </p>
        </div>
      </div>

      <div className={styles.doctorsGrid}>
        {doctors.map((doctor, index) => (
          <div
            key={doctor._id || doctor.doctorId || index}
            className={styles.doctorCard}
          >
            <div className={styles.ratingBadge}>
              ⭐ {doctor.rating?.average || doctor.rating || 'N/A'}
            </div>

            <div className={styles.doctorHeader}>
              <div className={styles.avatar}>
                {doctor.name?.split(" ")[1]?.charAt(0) || doctor.name?.charAt(0) || 'D'}
              </div>
              <div>
                <h2 className={styles.doctorName}>{doctor.name}</h2>
                <p className={styles.specialty}>
                  {doctor.specialization || doctor.specialty}
                </p>
              </div>
            </div>

            <div className={styles.info}>
              <p>🩺 {doctor.experience} Years Experience</p>
              <p>💰 Consultation Fee: ₹{doctor.consultationFee || doctor.fees || 'N/A'}</p>
              <p>⭐ {doctor.rating?.average || doctor.rating || 'N/A'} Rating</p>
              {doctor.bio && <p className={styles.bio}>{doctor.bio}</p>}
            </div>

            <button
              onClick={() => handleBook(doctor)}
              className={styles.bookButton}
            >
              📅 Book Appointment
            </button>
          </div>
        ))}
      </div>

      {doctors.length === 0 && (
        <div className={styles.emptyState}>
          <p>No doctors available at this hospital.</p>
        </div>
      )}
    </div>
  );
};

export default Doctors;
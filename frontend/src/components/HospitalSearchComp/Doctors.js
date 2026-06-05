import { appointmentAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import styles from "./Doctors.module.css";

const Doctors = ({
  selectedHospital,
  selectedDate,
  onBack
}) => {
  const doctors = selectedHospital?.doctors || [];
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSlots, setSelectedSlots] = useState({});

  const getSlots = (date) => {
    const now = new Date();
    const selected = new Date(date);
    const isToday = now.toDateString() === selected.toDateString();

    const morningCutoff = new Date(selected);
    morningCutoff.setHours(12, 0, 0, 0);

    const eveningCutoff = new Date(selected);
    eveningCutoff.setHours(21, 0, 0, 0);

    if (!isToday) {
      return ["08:00 AM-01:00 PM", "04:00 PM-10:00 PM"];
    }

    const slots = [];
    if (now < morningCutoff) slots.push("08:00 AM-01:00 PM");
    if (now < eveningCutoff) slots.push("04:00 PM-10:00 PM");
    if (slots.length === 0) return ["08:00 AM-01:00 PM", "04:00 PM-10:00 PM"];
    return slots;
  };

  const handleBook = async (doctor) => {
    const slot = selectedSlots[doctor._id || doctor.doctorId];
    if (!slot) {
      alert("Please select a time slot");
      return;
    }

    try {
      const start = slot.split("-")[0].trim();
      const [time, period] = start.split(" ");
      let [hours, minutes] = time.split(":");
      hours = parseInt(hours);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      const appointmentTime = `${String(hours).padStart(2, "0")}:${minutes}`;

      const appointmentData = {
        patient: user._id || user.id,
        doctor: doctor._id,
        hospital: selectedHospital._id,
        appointmentDate: selectedDate instanceof Date
          ? selectedDate.toISOString().split('T')[0]
          : selectedDate,
        appointmentTime,
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
        {doctors.map((doctor, index) => {
          const doctorKey = doctor._id || doctor.doctorId || index;
          const slots = getSlots(selectedDate);
          const selectedSlot = selectedSlots[doctorKey];

          return (
            <div
              key={doctorKey}
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

              <div style={{ margin: '12px 0' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#8b949e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Select Time Slot
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlots(prev => ({ ...prev, [doctorKey]: slot }))}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: selectedSlot === slot
                          ? '1px solid transparent'
                          : '1px solid rgba(108,99,255,0.25)',
                        background: selectedSlot === slot
                          ? 'linear-gradient(135deg, #6c63ff, #8b5cf6)'
                          : 'rgba(108,99,255,0.06)',
                        color: selectedSlot === slot ? 'white' : '#a78bfa',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleBook(doctor)}
                className={styles.bookButton}
              >
                📅 Book Appointment
              </button>
            </div>
          );
        })}
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
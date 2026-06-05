import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import { 
  Calendar as CalendarIcon, Clock, MapPin, User, Plus,
  Edit, Trash2, X, ArrowLeft, Star, FileText, Building
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentAPI } from '../../services/api';
import toast from 'react-hot-toast';

import styles from './Appointments.module.css';

const Appointments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [cancelModal, setCancelModal] = useState({ open: false, appointmentId: null });
const [selectedDate, setSelectedDate] = useState(
  location.state?.selectedDate
    ? new Date(location.state.selectedDate)
    : new Date()
);  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  });

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
const response =
  await appointmentAPI.getAllAppointments({ limit: 100, page: 1 });

console.log(
  "FULL RESPONSE:",
  response
);

console.log(
  "RESPONSE DATA:",
  response.data
);
const appointmentsData =
  response.data.data?.appointments ||
  response.data.appointments ||
  [];

console.log(
  "FIRST APPOINTMENT:",
  appointmentsData[0]
);

setAppointments(
  appointmentsData
);
      
      // Calculate stats
      const now = new Date();
      const upcoming = appointmentsData.filter(apt => 
        new Date(apt.appointmentDate) > now && apt.status !== 'cancelled'
      ).length;
      const completed = appointmentsData.filter(apt => 
        apt.status === 'completed'
      ).length;
      const cancelled = appointmentsData.filter(apt => 
        apt.status === 'cancelled'
      ).length;
      
      setStats({
        total: appointmentsData.length,
        upcoming,
        completed,
        cancelled
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  // Delete appointment
 const handleDeleteAppointment = async () => {
  try {
    await appointmentAPI.deleteAppointment(cancelModal.appointmentId);
    toast.success('Appointment cancelled successfully');
    setCancelModal({ open: false, appointmentId: null });
    fetchAppointments();
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    toast.error('Failed to cancel appointment');
  }
};

  // Edit appointment
  const handleEditAppointment = (appointment) => {
    // Navigate to hospital search to book a new appointment
    navigate('/hospitals');
  };

  // Rate appointment
  const handleRateAppointment = (appointment) => {
    toast.info('Rating feature coming soon!');
  };
  const getAppointmentsForDate = (
  selectedDate
) => {
  const selected =
    new Date(selectedDate);

  const selectedYear =
    selected.getFullYear();

  const selectedMonth =
    selected.getMonth();

  const selectedDay =
    selected.getDate();

  return appointments.filter(
    (appointment) => {

      const apptDate =
        new Date(
          appointment.appointmentDate
        );

      const apptYear =
        apptDate.getFullYear();

      const apptMonth =
        apptDate.getMonth();

      const apptDay =
        apptDate.getDate();

      return (
        apptYear === selectedYear &&
        apptMonth === selectedMonth &&
        apptDay === selectedDay
      );
    }
  );
};
  // Calendar tile content
  const tileContent = ({ date, view }) => {
    if (view === 'month' && getAppointmentsForDate(date).length > 0) {
      return <div className="appointment-dot"></div>;
    }
    return null;
  };

  // Format appointment time
  const formatTime = (time) => {
    if (!time) return '';
    return time;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'scheduled': '#3b82f6',
      'confirmed': '#10b981',
      'in-progress': '#f59e0b',
      'completed': '#10b981',
      'cancelled': '#ef4444',
      'no-show': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  // Get status text
  const getStatusText = (status) => {
    const statusMap = {
      'scheduled': 'Scheduled',
      'confirmed': 'Confirmed',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'no-show': 'No Show'
    };
    return statusMap[status] || status;
  };
const canCancelAppointment = (
  appointment
) => {

  if (!appointment.appointmentDate) {

  return false;

}

// OLD APPOINTMENTS
// WITHOUT TIME
if (!appointment.appointmentTime) {
  return true;
}

  const startTime =
    appointment.appointmentTime
      .split("-")[0]
      .trim();

  const appointmentDateTime =
    new Date(appointment.appointmentDate);

  let [time, modifier] =
    startTime.split(" ");

  let [hours, minutes] =
    time.split(":");

  hours = parseInt(hours);

  if (
    modifier === "PM" &&
    hours !== 12
  ) {

    hours += 12;

  }

  if (
    modifier === "AM" &&
    hours === 12
  ) {

    hours = 0;

  }

  appointmentDateTime.setHours(
    hours,
    parseInt(minutes),
    0,
    0
  );

  const now = new Date();

  const diffInHours =
    (
      appointmentDateTime - now
    ) / (1000 * 60 * 60);

  return diffInHours > 6;
};
 useEffect(() => {

  fetchAppointments();

  if (
    location.state?.selectedDate
  ) {

    setSelectedDate(
      new Date(
        location.state.selectedDate
      )
    );
  }

}, [location.state]);

if (loading) {
  return (
    <div className={styles.pageContainer}>

      <header className={styles.pageHeader}>
        <div className={`${styles.container} ${styles.headerContent}`}>
          <div className={styles.headerLeft}>

            <button
              onClick={() => navigate('/dashboard')}
              className={styles.backBtn}
            >
              <ArrowLeft size={16} color="#ffffff" />
              <span className={styles.backBtnText}>Back</span>
            </button>

            <div className={styles.logo}>
              <div className={styles.logoIconWrapper}>
                <CalendarIcon color="white" size={26} />
              </div>

              <div className={styles.headerTitleGroup}>
                <div className={styles.logoText}>
                  Appointments
                </div>

                <div className={styles.logoSubtitle}>
                  Book and manage all your appointments
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      <main className={`${styles.container} ${styles.pageContent}`}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading appointments...</p>
        </div>
      </main>

    </div>
  );
}

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <div className={`${styles.container} ${styles.headerContent}`}>
          <div className={styles.headerLeft}>
            <button onClick={() => navigate('/dashboard')} className={styles.backBtn}>
  <ArrowLeft size={16} color="#ffffff" />
  <span className={styles.backBtnText}>Back</span>
</button>
            <div className={styles.logo}>
  <div className={styles.logoIconWrapper}>
    <CalendarIcon color="white" size={26} />
  </div>

  <div className={styles.headerTitleGroup}>
    <div className={styles.logoText}>
      Appointments
    </div>

    <div className={styles.logoSubtitle}>
      Book and manage all your appointments
    </div>
  </div>
</div>
          </div>
        </div>
      </header>

      <main className={`${styles.container} ${styles.pageContent}`}>
        {/* Stats Section */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={styles.statsSection}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CalendarIcon size={20} />
                </div>
                <div className={styles.statContent}>
                  <h3>{stats.total}</h3>
                  <p>Total Appointments</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Clock size={20} />
                </div>
                <div className={styles.statContent}>
                  <h3>{stats.upcoming}</h3>
                  <p>Upcoming</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FileText size={20} />
                </div>
                <div className={styles.statContent}>
                  <h3>{stats.completed}</h3>
                  <p>Completed</p>
                </div>
              </div>
            </div>
          </motion.div>

        <div className={styles.appointmentsLayout}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div
  className={`${styles.card} ${styles.calendarCard}`}
>
  <h2>Your Calendar</h2>
              <Calendar

  onChange={setSelectedDate}

  value={selectedDate}

  tileContent={tileContent}

  className="custom-calendar"

  onClickDay={(value) => {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const clickedDate =
      new Date(value);

    clickedDate.setHours(
      0,
      0,
      0,
      0
    );

    // BLOCK PAST DATES
    if (clickedDate < today) {
      return;
    }

    setSelectedDate(value);

  }}

  tileDisabled={({ date }) => {

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    return date < today;

  }}

/>
              <div className={styles.calendarLegend}>
                <div className={styles.legendItem}>
                  <span className={`${styles.dot} ${styles.dotUpcoming}`}></span>Upcoming
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.dot} ${styles.dotCompleted}`}></span>Completed
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.dot} ${styles.dotCancelled}`}></span>Cancelled
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
           <div
  className={`${styles.card} ${styles.appointmentsPanel}`}
>
  <div className={styles.listHeader}>
                <h2>Appointments for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
              </div>
              <div className={styles.appointmentsList}>

  {getAppointmentsForDate(selectedDate).length > 0 ? (

    getAppointmentsForDate(selectedDate).map((appointment) => (

     <div
  key={appointment._id}
  className={styles.appointmentItem}
>

 <div className={styles.doctorSection}>
  <div className={styles.doctorAvatar}>
    <User size={26} />
  </div>
  <div>
   <h3 className={styles.doctorName}>
  {appointment.doctor?.name ||
   appointment.doctor?.fullName ||
   (appointment.doctor?.firstName
     ? `${appointment.doctor.firstName} ${appointment.doctor.lastName || ''}`.trim()
     : null) ||
   `${appointment.department || 'General'} Consultation`}
</h3>
<p className={styles.specialty}>
  {appointment.doctor?.specialization ||
   appointment.doctor?.specialty ||
   appointment.department ||
   appointment.appointmentType ||
   'Other'}
</p>
  </div>
</div>

<div className={styles.divider}></div>

<div className={styles.hospitalSection}>
  <Building size={28} className={styles.hospitalIcon} />
  <span className={styles.hospitalName}>
  {appointment.hospital?.name ||
   appointment.hospital?.fullName ||
   appointment.reason ||
   'General Consultation'}
</span>
</div>

  {canCancelAppointment(appointment) ? (

 <button

onClick={() =>
    setCancelModal({ open: true, appointmentId: appointment._id })
  }

  className={styles.cancelBtn}

>

    Cancel Appointment

  </button>

) : (

  <p className={styles.cancelBlocked}>

    Cancellation unavailable
    within 6 hours

  </p>

)}

      </div>

    ))

  ) : (

    <div className={styles.emptyState}>

      <div className={styles.emptyIconWrapper}>
        <CalendarIcon className={styles.emptyIcon} />
      </div>

      <h3>No Appointments Yet</h3>

      <p>
        Book appointments for this date.
      </p>

    </div>

  )}

</div>

<div className={styles.bookBtnWrapper}>

 <button
  onClick={() =>
    navigate('/hospitals', {
      state: {
        fromAppointments: true,
        selectedDate
      }
    })
  }
  className={`${styles.btn} ${styles.btnPrimary}`}
>

    <Plus size={16} />

    Book Appointment

  </button>

</div>

</div>

          </motion.div>
        </div>
        {appointments.length === 0 && (

  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className={styles.emptyStateContainer}
>

  <div className={styles.emptyStateCard}>

    {appointments.length === 0 ? (

      <>

        <CalendarIcon
          className={styles.emptyIcon}
        />

        <h3>
          No Appointments Yet
        </h3>

        <p>
          You haven't booked any appointments yet.
        </p>

      </>

    ) : (

      <>

        <h3>
          Need Another Appointment?
        </h3>

        <p>
          Book appointments with more doctors and hospitals.
        </p>

      </>

    )}

    <button
      onClick={() =>
        navigate('/hospitals')
      }
      className={`${styles.btn} ${styles.btnPrimary}`}
    >

      <Plus size={16} />

      Book Appointment

    </button>

  </div>

</motion.div>

)}
</main>

      {cancelModal.open && (
        <div className={styles.modalOverlay}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.modalBox}
          >
            <div className={styles.modalIcon}>
              <Trash2 size={28} color="#ef4444" />
            </div>
            <h3 className={styles.modalTitle}>Cancel Appointment?</h3>
            <p className={styles.modalText}>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => setCancelModal({ open: false, appointmentId: null })}
                className={styles.modalBtnSecondary}
              >
                Keep Appointment
              </button>
              <button
                onClick={handleDeleteAppointment}
                className={styles.modalBtnDanger}
              >
                Yes, Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default Appointments;
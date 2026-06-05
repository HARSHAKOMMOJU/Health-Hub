import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, Calendar, MapPin, FileText, Pill, User, LogOut, Bell,
  Menu, X, Clock, CheckCircle, AlertCircle, TrendingUp, Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import {
  appointmentAPI,
  prescriptionAPI,
  labReportAPI,
  healthRecordAPI
} from '../../services/api';
// Import the scoped CSS module for this component
import styles from './Dashboard.module.css';
const Dashboard = () => {
  const [showNotifications, setShowNotifications] = useState(false);
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
const [likedDoctors, setLikedDoctors] = useState(() => {
  const savedUser = localStorage.getItem('user');
  const parsedUser = savedUser ? JSON.parse(savedUser) : null;
  const userId = parsedUser?._id || parsedUser?.id;
  if (!userId) return [];
  const saved = localStorage.getItem(`likedDoctors_${userId}`);
  return saved ? JSON.parse(saved) : [];
});
const [profilePic, setProfilePic] = useState(null);

useEffect(() => {
  const userId = user?._id || user?.id;
  if (!userId) {
    setLikedDoctors([]);
    setProfilePic(null);
    return;
  }
  const saved = localStorage.getItem(`likedDoctors_${userId}`);
  setLikedDoctors(saved ? JSON.parse(saved) : []);
  setProfilePic(localStorage.getItem(`profilePic_${userId}`) || null);
}, [user?._id, user?.id, user]);
  // Dynamic dashboard stats
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalPrescriptions: 0,
    totalLabReports: 0,
    totalHealthRecords: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);

useEffect(() => {
  const now = new Date();
  const reminders = [];

  // Sort all appointments by date ascending
  const sorted = [...recentAppointments]
    .filter(apt => apt.appointmentDate && apt.status !== 'completed' && apt.status !== 'cancelled')
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  sorted.forEach(apt => {
    let aptDateTime = new Date(apt.appointmentDate);
    if (apt.appointmentTime) {
      const [h, m] = apt.appointmentTime.split(':');
      aptDateTime.setHours(parseInt(h), parseInt(m), 0, 0);
    } else {
      aptDateTime.setHours(23, 59, 0, 0); // treat no-time as end of day
    }

    const diffMs = aptDateTime - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    const doctorName = apt.doctor?.name
      ? apt.doctor.name.toLowerCase().startsWith('dr')
        ? apt.doctor.name
        : `Dr. ${apt.doctor.name}`
      : apt.doctor?.firstName
      ? `Dr. ${apt.doctor.firstName} ${apt.doctor?.lastName || ''}`.trim()
      : 'Your Doctor';

    const formatTime = (h, m) => {
      const hour = parseInt(h);
      return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    };

    const timeStr = apt.appointmentTime
      ? formatTime(...apt.appointmentTime.split(':'))
      : 'Time not set';

    const dateStr = new Date(apt.appointmentDate).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    // Skip only if appointment was yesterday or earlier
const aptDateOnly = new Date(apt.appointmentDate);
aptDateOnly.setHours(0, 0, 0, 0);
const todayOnly = new Date();
todayOnly.setHours(0, 0, 0, 0);

if (diffMs <= 0 && aptDateOnly < todayOnly) return; // past date, skip

// If today but time passed, still show as "Today"
if (diffMs <= 0 && aptDateOnly.getTime() === todayOnly.getTime()) {
  reminders.push({
    id: `${apt._id}-today`,
    title: `Today: ${doctorName}`,
    message: `${dateStr} at ${timeStr} • Check in`,
    urgent: false,
    type: 'upcoming'
  });
  return;
}

    if (diffHours <= 1) {
      reminders.push({
        id: `${apt._id}-urgent`,
        title: `⚠️ Appointment in ${Math.round(diffMs / 60000)} min`,
        message: `${doctorName} • ${timeStr}`,
        urgent: true,
        type: 'urgent'
      });
    } else if (diffHours <= 6) {
      let label = diffHours <= 2 ? 'in 1 hour' : diffHours <= 3 ? 'in 2 hours' : 'in 5 hours';
      reminders.push({
        id: `${apt._id}-soon`,
        title: `Appointment ${label}`,
        message: `${doctorName} • ${timeStr}`,
        urgent: false,
        type: 'urgent'
      });
    } else {
      // Future appointment — show as next upcoming
      reminders.push({
        id: `${apt._id}-upcoming`,
        title: `Next: ${doctorName}`,
        message: `${dateStr} at ${timeStr}`,
        urgent: false,
        type: 'upcoming'
      });
    }
  });

  // Urgent reminders take priority, else show only the next upcoming
  const urgentOnes = reminders.filter(r => r.type === 'urgent');
  const upcomingOnes = reminders.filter(r => r.type === 'upcoming');
  const finalReminders = urgentOnes.length > 0 ? urgentOnes : upcomingOnes.slice(0, 1);

  setNotifications(finalReminders);
  setUnreadCount(finalReminders.length);
}, [recentAppointments]);

useEffect(() => {
  const handler = (e) => {
    if (notifRef.current && !notifRef.current.contains(e.target)) {
      setShowNotifications(false);
    }
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, []);

  // Fetch dashboard data
const fetchDashboardData = async () => {
  try {

    const [
      appointmentsResponse,
      prescriptionsResponse,
      labReportsResponse,
      healthRecordsResponse
    ] = await Promise.all([
      appointmentAPI.getAllAppointments({ limit: 100, page: 1 }),
      prescriptionAPI.getAllPrescriptions(),
      labReportAPI.getAllLabReports(),
      healthRecordAPI.getAllHealthRecords()
    ]);

    console.log("Appointments:", appointmentsResponse.data);
    console.log("Prescriptions:", prescriptionsResponse.data);
    console.log("Lab Reports:", labReportsResponse.data);
    console.log("Health Records:", healthRecordsResponse.data);

const appointments =
  appointmentsResponse.data.data.appointments || 
  appointmentsResponse.data.appointments || [];

    const prescriptions =
  prescriptionsResponse.data.prescriptions || [];

    const labReports =
  labReportsResponse.data.labReports || [];

    const healthRecords =
  healthRecordsResponse.data.healthRecords || [];

    const today = new Date();

    const upcomingAppointments =
      appointments.filter((appointment) => {
        return (
          new Date(appointment.appointmentDate) >= today &&
          appointment.status !== "completed"
        );
      });

    setStats({
      totalAppointments: appointments.length,
      upcomingAppointments: upcomingAppointments.length,
      totalPrescriptions: prescriptions.length,
      totalLabReports: labReports.length,
      totalHealthRecords: healthRecords.length
    });

    setRecentAppointments(appointments);

  } catch (error) {
    console.error(
      "Dashboard fetch error:",
      error
    );
  }
};
  // Load dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Book Appointment',
      icon: <Calendar />,
      route: '/appointments'
    },
    {
      title: 'View Records',
      icon: <FileText />,
      route: '/health-records'
    },
    {
      title: 'Prescriptions',
      icon: <Pill />,
      route: '/prescriptions'
    },
    {
      title: 'Lab Reports',
      icon: <Activity />,
      route: '/lab-reports'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusIcon = (status) => {

  if (
    status === 'upcoming' ||
    status === 'scheduled' ||
    status === 'confirmed'
  ) {
    return <Clock size={20} />;
  }

  if (status === 'completed') {
    return <CheckCircle size={20} />;
  }

  return <AlertCircle size={20} />;
};
  const sidebarNavItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: <TrendingUp />,
      route: '/dashboard'
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: <Calendar />,
      route: '/appointments'
    },
    {
      id: 'hospitals',
      label: 'Find Hospitals',
      icon: <MapPin />,
      route: '/hospitals'
    },
    {
      id: 'records',
      label: 'Health Records',
      icon: <FileText />,
      route: '/health-records'
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      icon: <Pill />,
      route: '/prescriptions'
    },
    {
  id: 'labReports',
  label: 'Lab Reports',
  icon: <Activity />,
  route: '/lab-reports'
},
    {
      id: 'profile',
      label: 'Profile',
      icon: <User />,
      route: '/profile'
    }
  ];
  return (
    <div className={styles.dashboardLayout}>
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.isOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIconWrapper}><Heart color="white" /></div>
            <span className={styles.logoText}>HealthHub</span>
          </div>
          <button className={styles.mobileCloseBtn} onClick={() => setIsMobileMenuOpen(false)}><X /></button>
        </div>
        <nav className={styles.sidebarNav}>
          {sidebarNavItems.map((item) => (
            <button key={item.id} onClick={() => { navigate(item.route); setIsMobileMenuOpen(false); }}
              className={`${styles.sidebarNavItem} ${location.pathname.startsWith(item.route) ? styles.active : ''}`}>
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.sidebarNavItem}><LogOut /><span>Logout</span></button>
        </div>
      </aside>

      <div className={styles.mainArea}>
        <header className={styles.dashboardHeader}>
          <button className={styles.mobileMenuToggle} onClick={() => setIsMobileMenuOpen(true)}><Menu /></button>
          <div className={styles.headerActions}>
           <button
  className={`${styles.notificationBtn} ${styles.favoriteBtn}`}
  onClick={() => navigate("/favourites")}
  title="Favourites"
>
  <Heart size={18} />
</button>
<div ref={notifRef} style={{ position: 'relative' }}>  <button
    className={styles.notificationBtn}
    onClick={() => {
      setShowNotifications(v => !v);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }}
  >
    <Bell size={20} />
    {unreadCount > 0 && (
      <span className={styles.notificationCount}>{unreadCount}</span>
    )}
  </button>

  {showNotifications && (
    <div className={styles.notificationDropdown}>
      <div className={styles.notificationHeader}>
        <span>Notifications</span>
        <span className={styles.notificationSubtitle}>
          {notifications.length} upcoming
        </span>
      </div>

      {notifications.length === 0 ? (
        <div className={styles.notificationEmpty}>
          No upcoming appointments
        </div>
      ) : (
        notifications.map(n => (
<div
  key={n.id}
  className={`${styles.notificationItem} ${n.urgent ? styles.urgentNotification : n.type === 'upcoming' ? styles.upcomingNotification : ''}`}
            onClick={() => { setShowNotifications(false); navigate('/appointments'); }}
          >
            <div className={styles.notificationIcon}>
              <Calendar size={16} />
            </div>
            <div>
              <p className={styles.notificationTitle}>{n.title}</p>
              <p className={styles.notificationMessage}>{n.message}</p>
            </div>
          </div>
        ))
      )}

      <div className={styles.notificationFooter}>
        <button
          onClick={() => { setShowNotifications(false); navigate('/appointments'); }}
          className={styles.notificationViewAll}
        >
          View All Appointments
        </button>
      </div>
    </div>
  )}
</div>
            <div className={styles.profileMenu}>
              <button className={styles.profileToggle} onClick={() => setIsProfileOpen(!isProfileOpen)}>
  <div className={styles.avatar}>
    {profilePic ? (
      <img
        src={profilePic}
        alt="Profile"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '10px'
        }}
      />
    ) : (
      <span className={styles.avatarText}>
        {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
      </span>
    )}
  </div>
  <span className={styles.userName}>{user?.firstName || 'User'}</span>
</button>         
              {isProfileOpen && (
                <div className={styles.profileDropdown}>
                  <a href="/profile" onClick={(e) => { e.preventDefault(); navigate('/profile'); setIsProfileOpen(false); }}>Profile</a>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.mainContent}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1>Welcome back, {user?.firstName}!</h1>
            <p className={styles.subtitle}>Here's what's happening with your health today.</p>
          </motion.div>

          <motion.div className={styles.statsGrid} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className={styles.statCard}>
              <div className={styles.statCardText}><p>Total Appointments</p><span>{stats.totalAppointments}</span></div>
              <div className={`${styles.statCardIcon} ${styles.iconBgBlue}`}><Calendar /></div>
            </div>
            <div className={styles.statCard}>
  <div className={styles.statCardText}>
    <p>Lab Reports</p>
    <span>{stats.totalLabReports}</span>
  </div>

  <div className={`${styles.statCardIcon} ${styles.iconBgOrange}`}>
    <Activity />
  </div>
</div>
            <div className={styles.statCard}>
              <div className={styles.statCardText}><p>Prescriptions</p><span>{stats.totalPrescriptions}</span></div>
              <div className={`${styles.statCardIcon} ${styles.iconBgPurple}`}><Pill /></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2>Quick Actions</h2>
            <div className={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <motion.button key={action.title} onClick={() => navigate(action.route)} className={styles.actionCard} whileHover={{ y: -5 }}>
                  <div className={styles.actionCardIcon}>{action.icon}</div>
                  <h3>{action.title}</h3>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className={styles.sectionTitle}>
              <h2>Recent Appointments</h2>
              <a href="/appointments" onClick={(e) => { e.preventDefault(); navigate('/appointments'); }}>View All</a>
            </div>
            <div className={styles.appointmentsList}>
              {recentAppointments.length > 0 ? (
  recentAppointments.slice(0, 5).map((appt) => (
    <div
      key={appt._id}
      className={`${styles.card} ${styles.appointmentCard}`}
    >
      <div className={styles.appointmentDetails}>
        <div
          className={`${styles.statusIcon} ${
            styles[appt.status]
          }`}
        >
          {getStatusIcon(appt.status)}
        </div>

        <div>
<h3>
  {appt.doctor?.name
    ? appt.doctor.name.toLowerCase().startsWith('dr')
      ? appt.doctor.name
      : `Dr. ${appt.doctor.name}`
    : appt.doctor?.firstName
    ? `Dr. ${appt.doctor.firstName} ${appt.doctor?.lastName || ''}`.trim()
    : 'Doctor Unavailable'}
</h3>

          <p>
           {appt.department} • {appt.hospital?.name}
          </p>

          <p className={styles.appointmentTime}>
  {new Date(appt.appointmentDate).toLocaleDateString('en-GB')} at{" "}
  {appt.appointmentTime
    ? (() => {
        const [h, m] = appt.appointmentTime.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${m} ${ampm}`;
      })()
    : 'Time not set'}
</p>
        </div>
      </div>

      <span
        className={`${styles.statusBadge} ${
          styles[appt.status]
        }`}
      >
        {appt.status}
      </span>
    </div>
  ))
) : (
  <div className={styles.noAppointments}>
    No Recent Appointments
  </div>
)}
            </div>
          </motion.div>
        </main>
      </div>
     {isMobileMenuOpen && <div className={styles.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)}/>} 

    </div>
  );
};

export default Dashboard;
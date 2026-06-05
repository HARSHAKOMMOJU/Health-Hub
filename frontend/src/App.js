import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './components/LandingPageComp/LandingPage';
import AuthPage from './components/AuthPageComp/AuthPage';
import Dashboard from './components/DashboardComp/Dashboard';
import HospitalSearch from './components/HospitalSearchComp/HospitalSearch';
import HealthRecords from './components/HealthRecordsComp/HealthRecords';
import Prescriptions from './components/PrescriptionsComp/Prescriptions';
import LabReports from './components/LabReportsComp/LabReports';
import Profile from './components/ProfileComp/Profile';
import Favourites from './components/FavouritesComp/Favourites';
import './App.css';
import Appointments from './components/AppointmentComp/Appointments';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/hospitals" element={<HospitalSearch />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/health-records" element={<HealthRecords />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/lab-reports" element={<LabReports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/favourites" element={<Favourites />}/>
            </Routes>
<Toaster
  position="top-center"
  toastOptions={{
    duration: 4000,
    style: {
      background: '#111827',
      color: '#f8fafc',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '12px',
      fontSize: '0.95rem',
      zIndex: 99999,
    },
    success: {
      iconTheme: {
        primary: '#10b981',
        secondary: '#111827',
      },
    },
    error: {
      iconTheme: {
        primary: '#ef4444',
        secondary: '#111827',
      },
    },
  }}
  containerStyle={{
    zIndex: 99999,
  }}
/>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
import React, { useState, useRef, useEffect } from 'react';import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X,
  Camera, Shield, Bell, Settings, LogOut, Heart, Activity, FileText,
  Droplets, Users, AlertTriangle, Pill, Stethoscope
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import styles from './Profile.module.css';

// --- Main Profile Component ---
const ProfileComponent = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [medicalRaw, setMedicalRaw] = useState({
  allergies: user?.medicalHistory?.allergies?.join(', ') || '',
  chronicConditions: user?.medicalHistory?.chronicConditions?.join(', ') || ''
});
  // ── Profile Picture State ──────────────────────────────────────────────────
  // Persisted in localStorage so it survives page refreshes.
// AFTER
const [profilePic, setProfilePic] = useState(() => {
  const saved = localStorage.getItem('user');
  const savedUser = saved ? JSON.parse(saved) : null;
  const userId = savedUser?._id || savedUser?.id;
  if (!userId) return null;
  return localStorage.getItem(`profilePic_${userId}`) || null;
});

useEffect(() => {
  const userId = user?._id || user?.id;
  if (!userId) return;
  const saved = localStorage.getItem(`profilePic_${userId}`);
  setProfilePic(saved || null);
}, [user?._id, user?.id]);
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validate size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setProfilePic(base64);
const userId = user?._id || user?.id;
if (userId) {
  localStorage.setItem(`profilePic_${userId}`, base64);
}     toast.success('Profile picture updated!');
    };
    reader.onerror = () => toast.error('Failed to read image. Please try again.');
    reader.readAsDataURL(file);

    // Reset input so the same file can be re-selected if needed
    e.target.value = '';
  };
  // ──────────────────────────────────────────────────────────────────────────

  const [editForm, setEditForm] = useState({ 
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
    bloodGroup: user?.bloodGroup || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || ''
    },
    emergencyContact: {
      name: user?.emergencyContact?.name || '',
      relationship: user?.emergencyContact?.relationship || '',
      phoneNumber: user?.emergencyContact?.phoneNumber || ''
    },
    medicalHistory: {
      allergies: user?.medicalHistory?.allergies || [],
      chronicConditions: user?.medicalHistory?.chronicConditions || [],
      medications: user?.medicalHistory?.medications || [],
      surgeries: user?.medicalHistory?.surgeries || []
    }
  });

  const [stats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalPrescriptions: 0,
    totalLabReports: 0,
    totalHealthRecords: 0
  });

  const handleSave = async () => {
    if (!editForm.firstName.trim()) { toast.error("Please enter First Name"); return; }
    if (!editForm.lastName.trim()) { toast.error("Please enter Last Name"); return; }
    if (!editForm.email.trim()) { toast.error("Please enter Email Address"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) { toast.error("Please enter a valid email"); return; }
    if (!editForm.phoneNumber.trim()) { toast.error("Please enter Phone Number"); return; }
    if (editForm.phoneNumber.length !== 10) { toast.error("Phone number must be 10 digits"); return; }
    if (editForm.emergencyContact?.phoneNumber && editForm.emergencyContact.phoneNumber.length !== 10) {
      toast.error("Emergency contact phone must be 10 digits"); return;
    }
    try {
      const response = await authAPI.updateProfile(editForm);
      if (response.data.success) {
        const updatedUser = response.data.user || response.data.data?.user;
        updateUser(updatedUser);
        setEditForm({
          firstName: updatedUser?.firstName || '',
          lastName: updatedUser?.lastName || '',
          email: updatedUser?.email || '',
          phoneNumber: updatedUser?.phoneNumber || '',
          dateOfBirth: updatedUser?.dateOfBirth ? new Date(updatedUser.dateOfBirth).toISOString().split('T')[0] : '',
          gender: updatedUser?.gender || '',
          bloodGroup: updatedUser?.bloodGroup || '',
          address: updatedUser?.address || {},
          emergencyContact: updatedUser?.emergencyContact || {},
          medicalHistory: updatedUser?.medicalHistory || {}
        });
        toast.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        toast.error(response.data.message || "Update failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleCancel = () => { 
    setEditForm({ 
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user?.gender || '',
      bloodGroup: user?.bloodGroup || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || ''
      },
      emergencyContact: {
        name: user?.emergencyContact?.name || '',
        relationship: user?.emergencyContact?.relationship || '',
        phoneNumber: user?.emergencyContact?.phoneNumber || ''
      },
      medicalHistory: {
        allergies: user?.medicalHistory?.allergies || [],
        chronicConditions: user?.medicalHistory?.chronicConditions || [],
        medications: user?.medicalHistory?.medications || [],
        surgeries: user?.medicalHistory?.surgeries || []
      }
      
    }); 
    setIsEditing(false); 
  };

  const handleLogout = () => { logout(); };

  return (
<div className={styles.profilePage}>
      <div className={styles.profileContainer}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
         <div className={styles.profileHeader}>
  <button className={styles.backBtn} onClick={() => navigate(-1)}>
    <span>←</span>
    <span className={styles.backBtnText}>Back</span>
  </button>
  <div className={styles.profileHeaderContent}>
    <h1>Profile & Settings</h1>
    <p>Manage your account details and preferences.</p>
  </div>
</div>

          <div className={styles.profileGrid}>
            <div className={styles.profileMainColumn}>
              <motion.div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Personal Information</h2>
                  {!isEditing && (
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => setIsEditing(true)} className={`${styles.btn} ${styles.btnPrimary}`}>
                      <Edit size={16} /> Edit
                    </motion.button>
                  )}
                </div>

                <div className={styles.userInfoHeader}>
                  <div className={styles.avatarWrapper}>
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className={styles.hiddenFileInput}
                      onChange={handleFileChange}
                    />

                    <div className={styles.avatar}>
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt="Profile"
                          className={styles.avatarImage}
                        />
                      ) : user?.firstName && user?.lastName ? (
                        <span className={styles.avatarText}>
                          {user.firstName.charAt(0).toUpperCase()}{user.lastName.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <span className={styles.avatarText}>
                          {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                        </span>
                      )}
                    </div>

                    {/* Camera button — now triggers file picker */}
                    <button
                      className={styles.avatarEditButton}
                      onClick={handleAvatarClick}
                      title="Upload profile picture"
                      type="button"
                    >
                      <Camera size={18} />
                    </button>
                  </div>

                  <div>
                    <h2 className={styles.profileName}>
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className={styles.profileRole}>Patient Account</p>
                    <p className={styles.userEmail}>{user?.email}</p>
                  </div>
                </div>

                <div className={styles.infoGrid}>
                  <InfoField label="First Name" value={user?.firstName} icon={User} isEditing={isEditing} editValue={editForm.firstName} onChange={(e) => { const value = e.target.value.replace(/[^a-zA-Z ]/g, ""); setEditForm({ ...editForm, firstName: value }); }} />
                  <InfoField label="Last Name" value={user?.lastName} icon={User} isEditing={isEditing} editValue={editForm.lastName} onChange={(e) => { const value = e.target.value.replace(/[^a-zA-Z ]/g, ""); setEditForm({ ...editForm, lastName: value }); }} />
                  <InfoField label="Email Address" value={user?.email} icon={Mail} isEditing={isEditing} editValue={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} type="email" />
                  <InfoField label="Phone Number" value={user?.phoneNumber} icon={Phone} isEditing={isEditing} editValue={editForm.phoneNumber} onChange={(e) => { const value = e.target.value.replace(/\D/g, "").slice(0, 10); setEditForm({ ...editForm, phoneNumber: value }); }} type="tel" />
                  <InfoField label="Date of Birth" value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'} icon={Calendar} isEditing={isEditing} editValue={editForm.dateOfBirth} onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })} type="date" />
                  <InfoField label="Gender" value={user?.gender || 'Not provided'} icon={Users} isEditing={isEditing} editValue={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} type="select" options={['male', 'female', 'other']} />
                  <InfoField label="Blood Group" value={user?.bloodGroup || 'Not provided'} icon={Droplets} isEditing={isEditing} editValue={editForm.bloodGroup} onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })} type="select" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />
                  <InfoField label="Street Address" value={user?.address?.street || 'Not provided'} icon={MapPin} isEditing={isEditing} editValue={editForm.address?.street} onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, street: e.target.value } })} />
                  <InfoField label="City" value={user?.address?.city || 'Not provided'} icon={MapPin} isEditing={isEditing} editValue={editForm.address?.city} onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, city: e.target.value } })} />
                  <InfoField label="State" value={user?.address?.state || 'Not provided'} icon={MapPin} isEditing={isEditing} editValue={editForm.address?.state} onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, state: e.target.value } })} />
                  <InfoField label="Zip Code" value={user?.address?.zipCode || 'Not provided'} icon={MapPin} isEditing={isEditing} editValue={editForm.address?.zipCode} onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, zipCode: e.target.value } })} />
                  <InfoField label="Country" value={user?.address?.country || 'Not provided'} icon={MapPin} isEditing={isEditing} editValue={editForm.address?.country} onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, country: e.target.value } })} />
                  <InfoField label="Emergency Contact Name" value={user?.emergencyContact?.name || 'Not provided'} icon={Users} isEditing={isEditing} editValue={editForm.emergencyContact?.name} onChange={(e) => setEditForm({ ...editForm, emergencyContact: { ...editForm.emergencyContact, name: e.target.value } })} />
                  <InfoField label="Emergency Contact Relationship" value={user?.emergencyContact?.relationship || 'Not provided'} icon={Users} isEditing={isEditing} editValue={editForm.emergencyContact?.relationship} onChange={(e) => setEditForm({ ...editForm, emergencyContact: { ...editForm.emergencyContact, relationship: e.target.value } })} />
                  <InfoField label="Emergency Contact Phone" value={user?.emergencyContact?.phoneNumber || 'Not provided'} icon={Phone} isEditing={isEditing} editValue={editForm.emergencyContact?.phoneNumber} onChange={(e) => { const value = e.target.value.replace(/\D/g, "").slice(0, 10); setEditForm({ ...editForm, emergencyContact: { ...editForm.emergencyContact, phoneNumber: value } }); }} type="tel" />
                </div>

                <div className={styles.sectionDivider}><h3>Medical History</h3></div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoField}>
                    <label className={styles.fieldLabel}>Allergies</label>
                    {isEditing ? (
                     <textarea
  value={medicalRaw.allergies}
  onChange={(e) => {
    setMedicalRaw({ ...medicalRaw, allergies: e.target.value });
    setEditForm({
      ...editForm,
      medicalHistory: {
        ...editForm.medicalHistory,
        allergies: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
      }
    });
  }}
  className={styles.fieldInput}
  placeholder="e.g. Peanuts, Dust, Pollen"
/>
                    ) : (
                      <div className={styles.fieldDisplay}>
                        <AlertTriangle size={18} className={styles.fieldIcon} />
<span>{user?.medicalHistory?.allergies?.length > 0 ? user.medicalHistory.allergies.join(', ') : 'No allergies recorded'}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.infoField}>
                    <label className={styles.fieldLabel}>Chronic Conditions</label>
                    {isEditing ? (
<textarea
  value={medicalRaw.chronicConditions}
  onChange={(e) => {
    setMedicalRaw({ ...medicalRaw, chronicConditions: e.target.value });
    setEditForm({
      ...editForm,
      medicalHistory: {
        ...editForm.medicalHistory,
        chronicConditions: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
      }
    });
  }}
  className={styles.fieldInput}
  placeholder="e.g. Diabetes, Hypertension"
/>                    ) : (
                      <div className={styles.fieldDisplay}>
                        <Stethoscope size={18} className={styles.fieldIcon} />
<span>{user?.medicalHistory?.chronicConditions?.length > 0 ? user.medicalHistory.chronicConditions.join(', ') : 'No chronic conditions recorded'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className={styles.formActions}>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={handleSave} className={`${styles.btn} ${styles.btnSuccess}`}><Save size={16} /> Save Changes</motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={handleCancel} className={`${styles.btn} ${styles.btnSecondary}`}><X size={16} /> Cancel</motion.button>
                  </div>
                )}
              </motion.div>
            </div>

            <div className={styles.profileSidebar}>
              <SettingsCard title="Quick Actions">
  <QuickActionButton icon={Shield} onClick={() => toast('Privacy Settings coming soon!', { icon: '🔒' })}>
    Privacy Settings
  </QuickActionButton>
  <QuickActionButton icon={Bell} onClick={() => toast('Notification Preferences coming soon!', { icon: '🔔' })}>
    Notification Preferences
  </QuickActionButton>
</SettingsCard>
              <SettingsCard title="Account">
                <motion.button onClick={handleLogout} whileHover={{ scale: 1.02 }} className={`${styles.quickActionBtn} ${styles.logoutBtn}`}><LogOut size={20} /> Logout</motion.button>
              </SettingsCard>
              <SettingsCard title="Need Help?">
<p style={{ marginBottom: "12px", color: "#f8fafc", fontSize: "0.9rem" }}>
  Having trouble? We're here to help.
</p>                <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: "100%" }}>Contact Support</button>
              </SettingsCard>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const InfoField = ({ label, value, icon: Icon, isEditing, editValue, onChange, type = 'text', options = [] }) => (
  <div className={styles.infoField}>
    <label className={styles.fieldLabel}>{label}</label>
    {isEditing ? (
      type === 'select' ? (
        <select value={editValue} onChange={onChange} className={styles.fieldInput}>
          <option value="">Select {label}</option>
          {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input type={type} value={editValue} onChange={onChange} className={styles.fieldInput} />
      )
    ) : (
      <div className={styles.fieldDisplay}>
        <Icon size={18} className={styles.fieldIcon} />
        <span>{value || '--'}</span>
      </div>
    )}
  </div>
);

const SettingsCard = ({ title, children }) => (
  <motion.div whileHover={{ y: -2 }} className={`${styles.card} ${styles['card--sidebar']}`}>
    <h3 className={styles.sidebarCardTitle}>{title}</h3>{children}
  </motion.div>
);

const QuickActionButton = ({ icon: Icon, children, onClick }) => (
  <motion.button onClick={onClick} whileHover={{ scale: 1.02, x: 2 }} className={styles.quickActionBtn}>
    <Icon size={20} /><span>{children}</span>
  </motion.button>
);

export default ProfileComponent;
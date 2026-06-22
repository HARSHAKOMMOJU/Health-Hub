import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Pill, Calendar, Plus, Search,
  Download, Share2, Trash2, Eye, X, ArrowLeft, Edit
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { prescriptionAPI } from '../../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
// Add ArrowLeft to your existing lucide import:// Import the scoped CSS module for this component
import styles from './Prescriptions.module.css';
const CustomDatePicker = ({ value, onChange, name }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ? new Date(value) : new Date());
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDay   = (y, m) => new Date(y, m, 1).getDay();

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const selected = value ? new Date(value) : null;
  const today    = new Date();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

 // AFTER
const selectDay = (day) => {
  const d = new Date(year, month, day);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  if (d > todayMidnight) return; // block future dates
  const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  onChange({ target: { name, value: iso } });
  setOpen(false);
};

const isFuture = (d) => {
  const date = new Date(year, month, d);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  return date > todayMidnight;
};

  const blanks = firstDay(year, month);
  const total  = daysInMonth(year, month);

  const isSelected = (d) => selected && selected.getFullYear()===year && selected.getMonth()===month && selected.getDate()===d;
  const isToday    = (d) => today.getFullYear()===year && today.getMonth()===month && today.getDate()===d;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: '12px',
          background: '#1c2128', border: '1px solid rgba(108,99,255,0.45)',
          color: value ? '#e6edf3' : '#8b949e', fontSize: '0.9rem',
          textAlign: 'left', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 0 10px rgba(108,99,255,0.10)',
          transition: 'all 0.25s ease',
        }}
      >
        <span>{value || 'Select date'}</span>
        <Calendar size={15} color="#6c63ff" />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: '#161b22', border: '1px solid rgba(108,99,255,0.35)',
          borderRadius: '16px', padding: '16px', zIndex: 999,
          boxShadow: 'inset 0 4px 0 0 #6c63ff, 0 0 15px rgba(108,99,255,0.15), 0 8px 24px rgba(0,0,0,0.50)',
        }}>
          {/* Navigation */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
            <button type="button" onClick={prevMonth} style={{
              background:'#21262d', border:'none', borderRadius:'8px',
              color:'#e6edf3', width:'28px', height:'28px', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.2s'
            }}><ChevronLeft size={14}/></button>

            <span style={{ color:'#e6edf3', fontWeight:700, fontSize:'0.88rem' }}>
              {MONTHS[month]} {year}
            </span>

            <button type="button" onClick={nextMonth} style={{
              background:'#21262d', border:'none', borderRadius:'8px',
              color:'#e6edf3', width:'28px', height:'28px', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.2s'
            }}><ChevronRight size={14}/></button>
          </div>

          {/* Weekday headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:'8px', paddingBottom:'8px', borderBottom:'1px solid #21262d' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign:'center', fontSize:'0.7rem', fontWeight:700, color:'#8b5cf6', letterSpacing:'0.08em' }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'2px' }}>
            {Array(blanks).fill(null).map((_, i) => <div key={'b'+i} />)}
           {Array(total).fill(null).map((_, i) => {
  const day = i + 1;
  const sel = isSelected(day);
  const tod = isToday(day);
  const fut = isFuture(day);
  return (
    <button key={day} type="button"
      onClick={() => selectDay(day)}
      disabled={fut}
      style={{
        height: '32px', borderRadius: '8px',
        border: sel ? 'none' : tod ? '1px solid rgba(108,99,255,0.4)' : '1px solid transparent',
        background: sel ? 'linear-gradient(135deg,#6c63ff,#8b5cf6)' : 'transparent',
        color: fut ? '#3d444d' : sel ? 'white' : tod ? '#a78bfa' : '#c9d1d9',
        fontSize: '0.82rem', fontWeight: sel || tod ? 700 : 500,
        cursor: fut ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        boxShadow: sel ? '0 6px 16px rgba(108,99,255,0.45)' : 'none',
        opacity: fut ? 0.35 : 1,
      }}
      onMouseEnter={e => { if (!sel && !fut) { e.target.style.background = 'rgba(108,99,255,0.12)'; e.target.style.border = '1px solid rgba(108,99,255,0.35)'; e.target.style.color = 'white'; }}}
      onMouseLeave={e => { if (!sel && !fut) { e.target.style.background = 'transparent'; e.target.style.border = '1px solid transparent'; e.target.style.color = tod ? '#a78bfa' : '#c9d1d9'; }}}
    >
      {day}
    </button>
  );
})}
          </div>
        </div>
      )}
    </div>
  );
};
const Prescriptions = () => {
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  // --- STATE AND DATA ---
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: '',
    date: '',
    hospital: '',
    instructions: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    status: 'Active'
  });

  // Fetch prescriptions from API
const fetchPrescriptions = async () => {

  try {

    setLoading(true);

    const response =
      await prescriptionAPI
        .getAllPrescriptions();

   setPrescriptions(

  response.data.prescriptions || []

);

  } catch (error) {

    console.error(
      'Error fetching prescriptions:',
      error
    );

    toast.error(
      'Failed to fetch prescriptions'
    );

  } finally {

    setLoading(false);

  }

};

useEffect(() => {

  fetchPrescriptions();

}, []);
  // ... (Component logic remains the same)
  useEffect(() => { 
    const handleKeyDown = (event) => { 
      if (event.key === 'Escape') { 
        setSelectedPrescription(null); 
        setShowAddModal(false); 
      } 
    }; 
    window.addEventListener('keydown', handleKeyDown); 
    return () => window.removeEventListener('keydown', handleKeyDown); 
  }, []);

  const filteredPrescriptions =
  prescriptions.filter((p) => {

    const doctorMatch =
      (p.doctorName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const medicationMatch =
      (p.medications || []).some((m) =>
        (m.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );

    const statusMatch =

  activeTab === "All"
  ||
  p.status === activeTab;

    return (
      (doctorMatch || medicationMatch)
      &&
      statusMatch
    );
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle medication changes
  const handleMedicationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  // Add new medication
  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  // Remove medication
  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const cleanMedications = formData.medications.filter(med => 
      med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
    );
    if (cleanMedications.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }

    const prescriptionData = {
      doctorName: formData.doctorName,
      specialty: formData.specialty,
      hospital: formData.hospital,
      date: formData.date,
      status: formData.status,
      instructions: formData.instructions,
      medications: cleanMedications
    };

    if (editingId) {
      // UPDATE existing
      await prescriptionAPI.updatePrescription(editingId, prescriptionData);
      toast.success('Prescription updated successfully');
    } else {
      // CREATE new
      await prescriptionAPI.createPrescription(prescriptionData);
      toast.success('Prescription added successfully');
    }

    await fetchPrescriptions();
    setShowAddModal(false);
    setEditingId(null);
    setFormData({
      doctorName: '', specialty: '', date: '', hospital: '',
      instructions: '', medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      status: 'Active'
    });
  } catch (error) {
    console.error('Error saving prescription:', error);
    toast.error('Failed to save prescription');
  }
};

  const handleShare = (prescription) => { 
    const text = `Prescription from ${prescription.doctorName} on ${new Date(prescription.date).toLocaleDateString()}`; 
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`; 
    window.open(whatsappUrl, '_blank'); 
    toast.success('Sharing prescription...'); 
  };

  const handleDelete = async (id) => {

  if (
    window.confirm(
      'Are you sure you want to delete this prescription?'
    )
  ) {

    try {

      await prescriptionAPI.deletePrescription(id);

      setPrescriptions((prev) =>

        prev.filter(
          (p) => p._id !== id
        )

      );

      setSelectedPrescription(null);

      toast.success(
        'Prescription deleted!'
      );

    } catch (error) {

      console.error(
        'Error deleting prescription:',
        error
      );

      toast.error(
        'Failed to delete prescription'
      );

    }

  }

};

const handleDownloadPrescription = (prescription) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Helper to draw a horizontal rule
  const drawLine = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;
  };

  // ── Header ──────────────────────────────────────────
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 80, 160);
  doc.text('PRESCRIPTION', pageWidth / 2, y, { align: 'center' });
  y += 8;
  drawLine();

  // ── Doctor Info ──────────────────────────────────────
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);

  const fields = [
    ['Doctor',    `Dr. ${prescription.doctorName || 'N/A'}`],
    ['Specialty', prescription.specialty || 'N/A'],
    ['Hospital',  prescription.hospital   || 'N/A'],
    ['Date',      prescription.date       || 'N/A'],
    ['Status',    prescription.status     || 'N/A'],
  ];

  fields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 55, y);
    y += 7;
  });

  y += 4;

  // ── Medications ──────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 80, 160);
  doc.text('MEDICATIONS', 14, y);
  y += 4;
  drawLine();

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  // Table header
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(230, 240, 255);
  doc.rect(14, y - 4, pageWidth - 28, 8, 'F');
  doc.text('#',         16, y);
  doc.text('Name',      26, y);
  doc.text('Dosage',    85, y);
  doc.text('Frequency', 120, y);
  doc.text('Duration',  162, y);
  y += 6;

  // Table rows
  doc.setFont('helvetica', 'normal');
  (prescription.medications || []).forEach((med, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(245, 248, 255);
      doc.rect(14, y - 4, pageWidth - 28, 8, 'F');
    }
    doc.text(String(i + 1),      16, y);
    doc.text(med.name      || '', 26, y);
    doc.text(med.dosage    || '', 85, y);
    doc.text(med.frequency || '', 120, y);
    doc.text(med.duration  || '', 162, y);
    y += 8;
  });

  y += 4;

  // ── Instructions ─────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 80, 160);
  doc.text('INSTRUCTIONS', 14, y);
  y += 4;
  drawLine();

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);

  const instructions = prescription.instructions || 'None';
  const wrapped = doc.splitTextToSize(instructions, pageWidth - 28);
  doc.text(wrapped, 14, y);

  // ── Save ─────────────────────────────────────────────
  doc.save(`prescription-${prescription.doctorName || 'report'}.pdf`);
  toast.success('Prescription downloaded!');
};

  if (loading) {
    return (
      <div className={styles.prescriptionsPage} data-theme={isDarkMode ? 'dark' : 'light'}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading prescriptions...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.prescriptionsPage} data-theme={isDarkMode ? 'dark' : 'light'}>
      <div className={styles.container}>
       <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={styles.pageHeader}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
    <button onClick={() => navigate('/dashboard')} className={styles.backBtn}>
      <ArrowLeft size={16} color="#ffffff" />
      <span className={styles.backBtnText}>Back</span>
    </button>
    <div>
      <h1>Your Prescriptions</h1>
      <p className={styles.subtitle}>
        Welcome {user?.name}, manage and track your medication history.
      </p>
    </div>
  </div>
<button onClick={() => {
  setEditingId(null);
  setFormData({
    doctorName: '',
    specialty: '',
    date: '',
    hospital: '',
    instructions: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    status: 'Active'
  });
  setShowAddModal(true);
}} className={`${styles.btn} ${styles.btnPrimary}`}>
  <Plus className={styles.iconSm} /><span>Add New</span>
</button>
</motion.div>

        <div className={styles.toolbar}>
          <div className={styles.searchBarWrapper}>
            <Search className={styles.searchIcon} />
            <input type="text" placeholder="Search by doctor or medication..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
          </div>
          <div className={styles.tabs}>
            {['All', 'Active', 'Completed', 'Expired'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.prescriptionsGrid}>
          {filteredPrescriptions.length > 0 ? (

  filteredPrescriptions.map((prescription) => (

  <motion.div
  key={prescription._id}
  className={styles.card}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  whileHover={{ scale: 1.01 }}
>

  <div className={styles.cardTop}>

    <div className={styles.doctorSection}>

      <div className={styles.avatar}>

        {prescription.doctorName?.charAt(0)}

      </div>

      <div>

        <h3 className={styles.doctorName}>
          Dr. {
  prescription.doctorName
  || "Unknown"
}
        </h3>

        <p className={styles.specialization}>
          {prescription.specialty}
        </p>

      </div>

    </div>

    <span
      className={`
        ${styles.statusBadge}
        ${
          styles[
            prescription.status
              ?.toLowerCase()
          ]
        }
      `}
    >

      {prescription.status}

    </span>

  </div>

  <div className={styles.cardMiddle}>

    <div className={styles.infoItem}>

      <p className={styles.label}>
        Date
      </p>

      <h4>
{prescription.date}
      </h4>

    </div>

    <div className={styles.infoItem}>

      <p className={styles.label}>
        Hospital
      </p>

      <h4>
        {
  prescription.hospital
  || "Hospital"
}
      </h4>

    </div>

  </div>

  <div className={styles.medications}>

    {prescription.medications?.map(
      (med, index) => (

        <div
          key={index}
          className={styles.medTag}
        >

          {med.name}

        </div>

      )
    )}

  </div>

  <div className={styles.cardActions}>
  <button
    onClick={() => setSelectedPrescription(prescription)}
    className={`${styles.reportActionBtn} ${styles.viewBtn}`}
    title="View"
  >
    <Eye size={20} />
  </button>
  <button
    onClick={() => {
      setEditingId(prescription._id);
      setFormData({
        doctorName: prescription.doctorName || '',
        specialty: prescription.specialty || '',
        date: prescription.date || '',
        hospital: prescription.hospital || '',
        instructions: prescription.instructions || '',
        medications: prescription.medications?.length
          ? prescription.medications
          : [{ name: '', dosage: '', frequency: '', duration: '' }],
        status: prescription.status || 'Active'
      });
      setShowAddModal(true);
    }}
    className={`${styles.reportActionBtn} ${styles.editBtn}`}
    title="Edit"
  >
    <Edit size={20} />
  </button>
  <button
    onClick={() => handleDownloadPrescription(prescription)}
    className={`${styles.reportActionBtn} ${styles.downloadBtn}`}
    title="Download"
  >
    <Download size={20} />
  </button>
  <button
    onClick={() => handleDelete(prescription._id)}
    className={`${styles.reportActionBtn} ${styles.deleteBtn}`}
    title="Delete"
  >
    <Trash2 size={20} />
  </button>
</div>

</motion.div>
  ))
  ) : null}
        </div>

        {filteredPrescriptions?.length === 0 && (
          <div className={styles.emptyState}>
            <Pill className={styles.emptyIcon} />
            <h3>No Prescriptions Found</h3>
            <p>{searchTerm || activeTab !== 'all' ? 'Try adjusting your search or filter.' : 'Start by adding your first prescription to track your medications.'}</p>
            {!searchTerm && activeTab === 'all' && (
              <button onClick={() => setShowAddModal(true)} className={`${styles.btn} ${styles.btnPrimary}`}>
                <Plus className={styles.iconSm} />
                Add Your First Prescription
              </button>
            )}
          </div>
        )}
      </div>

      {selectedPrescription && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPrescription(null)}>
<motion.div
  initial={{ opacity: 0, scale: 0.92, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.92, y: 20 }}
  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
  className={styles.modalContent}
  onClick={e => e.stopPropagation()}
>            <div className={styles.modalHeader}>
              <h2>Prescription Details</h2>
              <button onClick={() => setSelectedPrescription(null)} className={styles.iconButton}><X size={24}/></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
  <strong>Doctor</strong>
  <span style={{ color: '#e6edf3', fontWeight: 600 }}>
    {selectedPrescription.doctorName}
  </span>
</div>
              <div className={styles.detailRow}>
  <strong>Specialty</strong>
  <span style={{ color: '#e6edf3', fontWeight: 600 }}>
    {selectedPrescription.specialty}
  </span>
</div>
             <div className={styles.detailRow}>
  <strong>Hospital</strong>
  <span style={{ color: '#e6edf3', fontWeight: 600 }}>
    {selectedPrescription.hospital}
  </span>
</div>
             <div className={styles.detailRow}>
  <strong>Date</strong>
  <span style={{ color: '#e6edf3', fontWeight: 600 }}>
    {new Date(selectedPrescription.date).toLocaleDateString()}
  </span>
</div>
              <div className={styles.detailRow}>
  <strong>Status</strong>
  <span style={{ color: '#e6edf3', fontWeight: 600 }}>
    {selectedPrescription.status}
  </span>
</div>
              <div className={styles.detailSection}>
                <h4>Medications:</h4>
                <ul className={styles.medicationList}>
                  {selectedPrescription.medications.map((med, index) => (
                    <li key={index}>
                      <Pill className={styles.iconSm} />
                      <div>
                        <strong>{med.name}</strong>
                        <span>{med.dosage} &bull; {med.frequency} &bull; {med.duration}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {selectedPrescription.instructions && (
                <div className={styles.detailSection}>
                  <h4>Instructions:</h4>
                  <p>{selectedPrescription.instructions}</p>
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => handleShare(selectedPrescription)} className={`${styles.btn} ${styles.btnSecondary}`}>
                <Share2 className={styles.iconSm} /> Share
              </button>
              <button onClick={() => handleDelete(selectedPrescription._id)} className={`${styles.btn} ${styles.btnDanger}`}>
                <Trash2 className={styles.iconSm} /> Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add New Prescription Modal */}
      {showAddModal && (
<div className={styles.modalOverlay} onClick={() => { setShowAddModal(false); setEditingId(null); }}>
<motion.div
  initial={{ opacity: 0, scale: 0.92, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.92, y: 20 }}
  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
  className={styles.modalContent}
  onClick={e => e.stopPropagation()}
>            <div className={styles.modalHeader}>
<h2>{editingId ? 'Edit Prescription' : 'Add New Prescription'}</h2>
<button onClick={() => { setShowAddModal(false); setEditingId(null); }} className={styles.iconButton}><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Doctor Name *</label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Specialty *</label>
                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                    placeholder="Cardiology"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Date *</label>
                   <CustomDatePicker
  name="date"
  value={formData.date}
  onChange={handleInputChange}
/>
                </div>
                <div className={styles.formGroup}>
                  <label>Hospital</label>
                  <input
                    type="text"
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="Hospital Name"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={styles.formInput}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Instructions</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  placeholder="Special instructions for taking medications..."
                  rows="3"
                />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.medicationHeader}>
                  <label>Medications *</label>
                  <button type="button" onClick={addMedication} className={`${styles.btn} ${styles.btnSmall}`}>
                    <Plus className={styles.iconSm} /> Add Medication
                  </button>
                </div>
                {formData.medications.map((med, index) => (
                  <div key={index} className={styles.medicationForm}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          placeholder="Medication name"
                          className={styles.formInput}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          placeholder="Dosage"
                          className={styles.formInput}
                          required
                        />
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          placeholder="Frequency (e.g., Once daily)"
                          className={styles.formInput}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          placeholder="Duration (e.g., 30 days)"
                          className={styles.formInput}
                          required
                        />
                      </div>
                    </div>
                    {formData.medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => { setShowAddModal(false); setEditingId(null); }} className={`${styles.btn} ${styles.btnSecondary}`}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  {editingId ? 'Update Prescription' : 'Add Prescription'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Heart, Activity, Thermometer, Weight, Plus, Search, 
  Download, Share2, Edit, Trash2, TrendingUp, TrendingDown,
  X, Calendar, FileText, ArrowLeft, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';
import { healthRecordAPI } from '../../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
// Import the scoped CSS module for this component
import styles from './HealthRecords.module.css';
import { useNavigate } from 'react-router-dom';
// add at top of component:

const CustomDatePicker = ({ value, onChange, name }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ? new Date(value) : new Date());
  const ref = React.useRef(null);
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

  const selectDay = (day) => {
    const d = new Date(year, month, day);
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    if (d > todayMidnight) return;
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    onChange({ target: { name, value: iso } });
    setOpen(false);
  };

  const blanks = firstDay(year, month);
  const total  = daysInMonth(year, month);

  const isSelected = (d) => selected && selected.getFullYear()===year && selected.getMonth()===month && selected.getDate()===d;
  const isToday    = (d) => today.getFullYear()===year && today.getMonth()===month && today.getDate()===d;
  const isFuture   = (d) => {
    const date = new Date(year, month, d);
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    return date > todayMidnight;
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: '12px',
          background: 'transparent', border: '1px solid rgba(108,99,255,0.45)',
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
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
            <button type="button" onClick={prevMonth} style={{
              background:'#21262d', border:'none', borderRadius:'8px',
              color:'#e6edf3', width:'28px', height:'28px', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}><ChevronLeft size={14}/></button>
            <span style={{ color:'#e6edf3', fontWeight:700, fontSize:'0.88rem' }}>
              {MONTHS[month]} {year}
            </span>
            <button type="button" onClick={nextMonth} style={{
              background:'#21262d', border:'none', borderRadius:'8px',
              color:'#e6edf3', width:'28px', height:'28px', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}><ChevronRight size={14}/></button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:'8px', paddingBottom:'8px', borderBottom:'1px solid #21262d' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign:'center', fontSize:'0.7rem', fontWeight:700, color:'#8b5cf6', letterSpacing:'0.08em' }}>{d}</div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'2px' }}>
            {Array(blanks).fill(null).map((_, i) => <div key={'b'+i} />)}
            {Array(total).fill(null).map((_, i) => {
              const day = i + 1;
              const sel = isSelected(day);
              const tod = isToday(day);
              const fut = isFuture(day);
              return (
                <button key={day} type="button" onClick={() => selectDay(day)}
                  disabled={fut}
                  style={{
                    height:'32px', borderRadius:'8px',
                    border: sel ? 'none' : tod ? '1px solid rgba(108,99,255,0.4)' : '1px solid transparent',
                    background: sel ? 'linear-gradient(135deg,#6c63ff,#8b5cf6)' : 'transparent',
                    color: fut ? '#3d444d' : sel ? 'white' : tod ? '#a78bfa' : '#c9d1d9',
                    fontSize:'0.82rem', fontWeight: sel || tod ? 700 : 500,
                    cursor: fut ? 'not-allowed' : 'pointer',
                    transition:'all 0.2s',
                    boxShadow: sel ? '0 6px 16px rgba(108,99,255,0.45)' : 'none',
                    opacity: fut ? 0.35 : 1,
                  }}
                  onMouseEnter={e => { if(!sel && !fut) { e.target.style.background='rgba(108,99,255,0.12)'; e.target.style.border='1px solid rgba(108,99,255,0.35)'; e.target.style.color='white'; }}}
                  onMouseLeave={e => { if(!sel && !fut) { e.target.style.background='transparent'; e.target.style.border='1px solid transparent'; e.target.style.color= tod?'#a78bfa':'#c9d1d9'; }}}
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

const HealthRecords = () => {
  const [viewingRecord, setViewingRecord] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, recordId: null });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    recordType: '',
    value: '',
    unit: '',
    date: '',
    status: 'normal',
    notes: ''
  });
  // Fetch health records from API
 const fetchHealthRecords = async () => {
  try {
    setLoading(true);
    const response = await healthRecordAPI.getAllHealthRecords();
    console.log('FULL RESPONSE:', response);           // ← ADD
    console.log('RESPONSE DATA:', response.data);      // ← ADD
    setHealthRecords(response.data.healthRecords || []);
  } catch (error) {
    console.error('Error fetching health records:', error);
    toast.error('Failed to fetch health records');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchHealthRecords();
}, []);

  const filteredRecords = healthRecords.filter(record => 
    (record.recordType || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type) => {
    if (type === 'Blood Pressure') return <Heart className={styles.iconSm} />;
    if (type === 'Heart Rate') return <Activity className={styles.iconSm} />;
    if (type === 'Blood Sugar' || type === 'Temperature') return <Thermometer className={styles.iconSm} />;
    if (type === 'Weight') return <Weight className={styles.iconSm} />;
    return <Activity className={styles.iconSm} />;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await healthRecordAPI.updateHealthRecord(editingRecord._id, formData);
        toast.success('Health record updated successfully');
      } else {
        await healthRecordAPI.createHealthRecord(formData);
        toast.success('Health record added successfully');
      }
      setShowAddModal(false);
      setEditingRecord(null);
      setFormData({
        recordType: '',
        value: '',
        unit: '',
        date: '',
        status: 'normal',
        notes: ''
      });
      fetchHealthRecords();
    } catch (error) {
      console.error('Error saving health record:', error);
      toast.error('Failed to save health record');
    }
  };

  // Handle edit record
const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      recordType: record.recordType || '',
      value: record.value,
      unit: record.unit,
      date: record.date.split('T')[0],
      status: (record.status || 'normal').toLowerCase(),
      notes: record.notes || ''
    });
    setShowAddModal(true);
  };

  // Handle delete record
const handleDelete = async () => {
    try {
      await healthRecordAPI.deleteHealthRecord(deleteModal.recordId);
      toast.success('Health record deleted successfully');
      setDeleteModal({ open: false, recordId: null });
      fetchHealthRecords();
    } catch (error) {
      console.error('Error deleting health record:', error);
      toast.error('Failed to delete health record');
    }
  };

  // Handle share record
  const handleShare = async (record) => {
    try {
      const response = await healthRecordAPI.shareHealthRecord(record._id, {
        email: '',
        permissions: 'view'
      });
      toast.success('Health record shared successfully');
      // You could open the share URL in a new window
      // window.open(response.data.shareUrl, '_blank');
    } catch (error) {
      console.error('Error sharing health record:', error);
      toast.error('Failed to share health record');
    }
  };

  // Handle export records
const handleExport = (record) => {
  const doc = new jsPDF();

  // Purple header bar
  doc.setFillColor(108, 99, 255);
  doc.rect(0, 0, 220, 28, 'F');

  // Title in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Health Hub — Medical Record', 14, 18);

  // Light card background
  doc.setFillColor(240, 240, 250);
  doc.roundedRect(14, 38, 182, 110, 4, 4, 'F');

  // Labels
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Record Type :', 22, 55);
  doc.text('Date        :', 22, 72);
  doc.text('Value       :', 22, 89);
  doc.text('Status      :', 22, 106);
  doc.text('Notes       :', 22, 123);

  // Values
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(String(record.recordType || 'N/A'), 80, 55);
  doc.text(new Date(record.date).toLocaleDateString(), 80, 72);
  doc.text(`${record.value} ${record.unit}`, 80, 89);
  doc.text(String(record.status || 'N/A'), 80, 106);
  doc.text(String(record.notes || 'N/A'), 80, 123);

  // Footer bar
  doc.setFillColor(108, 99, 255);
  doc.rect(0, 280, 220, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Generated by Health Hub  •  ${new Date().toLocaleDateString()}`,
    14, 291
  );

  // Force proper PDF download
  const fileName = `${record.recordType}-${new Date(record.date)
    .toLocaleDateString('en-GB')
    .replace(/\//g, '-')}.pdf`;

  const blob = doc.output('blob');
  const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success(`${record.recordType} downloaded as PDF ✓`);
};

  // Reset form
  const resetForm = () => {
    setFormData({
      recordType: '',
      value: '',
      unit: '',
      date: '',
      status: 'normal',
      notes: ''
    });
    setEditingRecord(null);
  };

  if (loading) {
    return (
      <div className={styles.recordsPage}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading health records...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.recordsPage}>
      <div className={styles.container}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={styles.pageHeader}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <button onClick={() => navigate('/dashboard')} className={styles.backBtn}>
      <ArrowLeft size={16} color="#ffffff" />
      <span className={styles.backBtnText}>Back</span>
    </button>
    
    <div>
      <h1>Health Records</h1>
      <p className={styles.subtitle}>A complete history of your vital health metrics.</p>
    </div>
  </div>
<button onClick={() => {
  setEditingRecord(null);
  setFormData({ recordType: '', value: '', unit: '', date: '', status: 'normal', notes: '' });
  setShowAddModal(true);
}} className={`${styles.btn} ${styles.btnPrimary} ${styles.addRecordBtn}`}>
    <Plus className={styles.iconSm} />
    <span>Add New Record</span>
  </button>
</motion.div>
     <div className={styles.statsGrid}>

  <div className={styles.statCard}>
    <Activity className={styles.statIcon} />
    <div>
      <h3>{healthRecords.length}</h3>
      <p>Total Records</p>
    </div>
  </div>

  <div className={styles.statCard}>
    <Heart className={styles.statIcon} />
    <div>
      <h3>
        {
          healthRecords.filter(
            r => r.status === "normal"
          ).length
        }
      </h3>
      <p>Normal</p>
    </div>
  </div>

  <div className={styles.statCard}>
    <TrendingUp className={styles.statIcon} />
    <div>
      <h3>
        {
          healthRecords.filter(
            r => r.status === "high"
          ).length
        }
      </h3>
      <p>High</p>
    </div>
  </div>

  <div className={styles.statCard}>
    <TrendingDown className={styles.statIcon} />
    <div>
      <h3>
        {
          healthRecords.filter(
            r => r.status === "low"
          ).length
        }
      </h3>
      <p>Low</p>
    </div>
  </div>

</div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${styles.card} ${styles.mainContentCard}`}>
          <div className={styles.toolbar}>
            <div className={styles.searchBarWrapper}>
              <Search className={styles.searchIcon} />
              <input
                type="text" placeholder="Search by record type..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.toolbarActions}>
            </div>
          </div>

          <div className={styles.recordsTable}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>Record Type</div>
              <div className={styles.tableCell}>Date</div>
              <div className={styles.tableCell}>Value</div>
              <div className={styles.tableCell}>Status</div>
              <div className={styles.tableCell}>Actions</div>
            </div>
            {filteredRecords.map(record => (

  <div
    key={record._id}
    className={styles.recordCard}
  >

    {/* Record Type */}

    <div className={styles.recordType}>

      <div className={styles.recordIcon}>
        {getTypeIcon(record.recordType)}
      </div>

      <div>

        <h3>
          {record.recordType}
        </h3>

        <p>
          {record.notes || "Health Record"}
        </p>

      </div>

    </div>

    {/* Date */}

    <div className={styles.recordDate}>

      <span className={styles.dateMain}>
        {new Date(record.date)
          .toLocaleDateString()}
      </span>

      <span className={styles.dateSub}>
        {new Date(record.date)
          .toLocaleDateString(
            "en-US",
            { weekday: "long" }
          )}
      </span>

    </div>

    {/* Value */}

    <div className={styles.recordValue}>

      <div className={styles.valueNumber}>
        {record.value}
      </div>

      <div className={styles.valueUnit}>
        {record.unit}
      </div>

    </div>

    {/* Status */}

    <div className={styles.recordStatus}>

      <span
        className={`
          ${styles.statusBadge}
          ${styles[record.status]}
        `}
      >

        {record.status}

      </span>

    </div>

    {/* Actions */}

    <div className={styles.recordActions}>
     <button
  onClick={() => setViewingRecord(record)}
  className={styles.viewBtn}
>
  <Eye size={18} />
</button>

      <button
        onClick={() =>
          handleEdit(record)
        }
        className={styles.editBtn}
      >
        <Edit size={18} />
      </button>


      <button
        onClick={() =>
          handleExport(record)
        }
        className={styles.downloadBtn}
      >
        <Download size={18} />
      </button>

      <button
       onClick={() =>
          setDeleteModal({ open: true, recordId: record._id })
        }
        className={styles.deleteBtn}
      >
        <Trash2 size={18} />
      </button>
      
{viewingRecord && (
  <div className={styles.modalOverlay} onClick={() => setViewingRecord(null)}>
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={styles.modalContent} onClick={e => e.stopPropagation()}>

      <div className={styles.modalHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(108,99,255,0.4)' }}>
            {getTypeIcon(viewingRecord.recordType)}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>Health Record Details</h2>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>{viewingRecord.recordType}</p>
          </div>
        </div>
<button 
  onClick={(e) => {
    e.stopPropagation();
    setViewingRecord(null);
    document.body.classList.remove('modal-open');
  }} 
  className={styles.iconButton}
>
  <X size={18}/>
</button>      </div>

      <div className={styles.modalBody}>
        {[
          { label: 'Record Type', value: viewingRecord.recordType },
          { label: 'Value', value: `${viewingRecord.value} ${viewingRecord.unit}` },
          { label: 'Date', value: new Date(viewingRecord.date).toLocaleDateString() },
        ].map(({ label, value }) => (
          <div key={label} className={styles.detailRow}>
            <strong>{label}</strong>
            <span>{value}</span>
          </div>
        ))}

        {/* Status */}
        <div className={styles.detailRow}>
          <strong>Status</strong>
          <span className={`${styles.statusBadge} ${styles[viewingRecord.status]}`}>
            {viewingRecord.status}
          </span>
        </div>

        {/* Notes */}
        {viewingRecord.notes && viewingRecord.notes !== 'undefined' && viewingRecord.notes.trim() !== '' && (
          <div className={styles.detailSection}>
            <h4>📋 Notes</h4>
            <p>{viewingRecord.notes}</p>
          </div>
        )}
      </div>

      <div className={styles.modalActions}>
        <button onClick={() => { setViewingRecord(null); handleEdit(viewingRecord); }} className={`${styles.btn} ${styles.btnSecondary}`}>
          <Edit size={16} /> Edit
        </button>
        <button onClick={() => { handleExport(viewingRecord); }} className={`${styles.btn} ${styles.btnPrimary}`}>
          <Download size={16} /> Download
        </button>
      </div>

    </motion.div>
  </div>
)}

    </div>

  </div>

))}
          </div>

          {filteredRecords.length === 0 && (
            <div className={styles.emptyState}>
              <Activity className={styles.emptyIcon}/>
              <h3>No Health Records Found</h3>
              <p>{searchTerm ? 'Try a different search term or' : 'Start by'} adding a new health record to track your vital metrics.</p>
              <button onClick={() => setShowAddModal(true)} className={`${styles.btn} ${styles.btnPrimary}`}>
                <Plus className={styles.iconSm} />
                Add Your First Record
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Record Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className={styles.modalContent} 
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>{editingRecord ? 'Edit Health Record' : 'Add New Health Record'}</h2>
              <button onClick={() => setShowAddModal(false)} className={styles.iconButton}>
                <X size={24}/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Record Type *</label>
                <select 
                  name="recordType" 
                  value={formData.recordType}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                >
                  <option value="">Select record type</option>
                  <option value="Blood Pressure">Blood Pressure</option>
                  <option value="Heart Rate">Heart Rate</option>
                  <option value="Blood Sugar">Blood Sugar</option>
                  <option value="Weight">Weight</option>
                  <option value="Temperature">Temperature</option>
                  <option value="Cholesterol">Cholesterol</option>
                  <option value="BMI">BMI</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Value *</label>
                  <input
                    type="text"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                    placeholder="e.g., 120/80"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Unit *</label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                    placeholder="e.g., mmHg"
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
                  <label>Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange}
                    className={styles.formInput}
                  >
                    <option value="normal">Normal</option>
                    <option value="elevated">Elevated</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  placeholder="Additional notes about this record..."
                  rows="3"
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowAddModal(false)} className={`${styles.btn} ${styles.btnSecondary}`}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  {editingRecord ? 'Update Record' : 'Add Record'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    {deleteModal.open && (
        <div className={styles.modalOverlay}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.deleteModalBox}
          >
            <div className={styles.deleteModalIcon}>
              <Trash2 size={28} color="#ef4444" />
            </div>
            <h3 className={styles.deleteModalTitle}>Delete Health Record?</h3>
            <p className={styles.deleteModalText}>
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div className={styles.deleteModalActions}>
              <button
                onClick={() => setDeleteModal({ open: false, recordId: null })}
                className={styles.deleteModalBtnSecondary}
              >
                Keep Record
              </button>
              <button
                onClick={handleDelete}
                className={styles.deleteModalBtnDanger}
              >
                Yes, Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default HealthRecords;
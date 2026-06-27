import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Download, Eye, Trash2,
  Plus, ArrowLeft, AlertCircle,
  CheckCircle, X, Clock, Search, Edit   // ADD Edit here
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { labReportAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Import the scoped CSS module for this component
import styles from './LabReports.module.css';

const LabReports = () => {
  const handleEdit = (report) => {
  setEditingReport(report);
  setUploadForm({
    title: report.title || '',
    type: report.type || '',
    labName: report.labName || '',
    doctorName: report.doctorName || '',
    notes: report.notes || '',
    status: (report.status || 'pending').toLowerCase(),
    file: null
  });
  setShowUploadModal(true);
};
const [editingReport, setEditingReport] = useState(null);
const [deleteModal, setDeleteModal] = useState({ open: false, reportId: null });
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingReport, setViewingReport] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isDragging, setIsDragging] = useState(false);
 const [uploadForm, setUploadForm] = useState({
  title: '',
  type: '',
  labName: '',
  doctorName: '',
  status: 'pending',
  file: null
});

  // Fetch lab reports from API
  const fetchLabReports = async () => {
    try {
      setLoading(true);
     const response = await labReportAPI.getAllLabReports({ limit: 100, page: 1 });
console.log("LAB API RESPONSE:", response.data);

setReports(
  response.data.labReports ||
  response.data.data ||
  response.data ||
  []
);    } catch (error) {
      console.error('Error fetching lab reports:', error);
      toast.error('Failed to fetch lab reports');
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    fetchLabReports();
  }, []);

  // Component logic
  const getStatusPill = (status) => {
    switch (status) {
      case 'normal': return { icon: <CheckCircle className={styles.icon} />, className: styles.statusPillNormal };
      case 'abnormal': return { icon: <AlertCircle className={styles.icon} />, className: styles.statusPillAbnormal };
      case 'pending': return { icon: <Clock className={styles.icon} />, className: styles.statusPillPending };
      default: return { icon: <FileText className={styles.icon} />, className: '' };
    }
  };

const filteredReports = useMemo(() => {

  let data = reports;

  if (activeFilter !== 'All') {
    data = data.filter(
      r => (r.status || 'pending') === activeFilter.toLowerCase()
    );
  }

  if (searchTerm.trim()) {
    data = data.filter(report =>
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return data;

}, [reports, activeFilter, searchTerm]);

  // Handle file upload
  const handleFileUpload = useCallback((file) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid file type (JPEG, PNG, GIF, PDF, DOC, DOCX)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setUploadForm(prev => ({ ...prev, file }));
      toast.success('File selected successfully');
    }
  }, []);

  // Handle upload form submission
  const handleUploadSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!uploadForm.title || !uploadForm.type || !uploadForm.labName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('type', uploadForm.type);
      formData.append('labName', uploadForm.labName);
      formData.append('doctorName', uploadForm.doctorName);
      formData.append('notes', uploadForm.notes);
      formData.append('status', uploadForm.status);
      formData.append('reportFile', uploadForm.file);

      if (editingReport) {
  await labReportAPI.updateLabReport(editingReport._id, formData);
  toast.success('Lab report updated successfully');
} else {
  await labReportAPI.createLabReport(formData);
  toast.success('Lab report uploaded successfully');
}
setShowUploadModal(false);
setEditingReport(null);
setUploadForm({ title: '', type: '', labName: '', doctorName: '', notes: '', status: 'pending', file: null });
fetchLabReports();
    } catch (error) {
      console.error('Error uploading lab report:', error);
      toast.error('Failed to upload lab report');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [uploadForm]);


  // Handle download
const handleDownload = async (report) => {
  try {
    toast.loading('Generating PDF...');

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // ── Blue Header Bar ──────────────────────────
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('LAB REPORT', 14, 20);

    // ── Generated Date (top right) ───────────────
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 20);

    // ── Report Details Section ───────────────────
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Details', 14, 45);

    // Divider line
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(14, 48, 196, 48);

    // Detail rows
    const details = [
      ['Title',   report.title       || 'N/A'],
      ['Type',    report.type        || 'N/A'],
      ['Lab',     report.labName     || 'N/A'],
      ['Doctor',  report.doctorName  || 'N/A'],
      ['Date',    report.reportDate  ? new Date(report.reportDate).toLocaleDateString() : 'N/A'],
      ['Status',  (report.status || 'N/A').toUpperCase()],
    ];

    let y = 58;
    details.forEach(([label, value]) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text(label, 14, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(String(value), 70, y);

      y += 10;
    });

    // ── Notes Section ────────────────────────────
    y += 5;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Notes', 14, y);

    doc.setDrawColor(37, 99, 235);
    doc.line(14, y + 3, 196, y + 3);

    y += 12;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const noteLines = doc.splitTextToSize((report.notes && report.notes !== 'undefined') ? report.notes : 'No notes provided.', 180);
    doc.text(noteLines, 14, y);
    y += noteLines.length * 7 + 10;

    // ── Uploaded Image (if exists) ───────────────
    if (report.filePath || report.fileName) {
      try {
        const response = await labReportAPI.downloadLabReport(report._id);
        const contentType = response.headers['content-type'] || '';
        console.log('CONTENT TYPE:', contentType);
console.log('RESPONSE HEADERS:', response.headers);

        if (contentType.includes('image')) {
          const blob = new Blob([response.data], { type: contentType });
          const reader = new FileReader();

          await new Promise((resolve, reject) => {
            reader.onload = async (e) => {
              try {
                doc.addPage();

                // Image page header
                doc.setFillColor(37, 99, 235);
                doc.rect(0, 0, 210, 20, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(13);
                doc.setFont('helvetica', 'bold');
                doc.text('Uploaded Report File', 14, 14);

                doc.addImage(e.target.result, 'JPEG', 14, 28, 182, 220);
                resolve();
              } catch (err) {
                reject(err);
              }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      } catch (err) {
        console.warn('Could not embed image in PDF:', err.message);
      }
    }

    // ── Footer on all pages ──────────────────────
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.text('HealthHub - Confidential Medical Document', 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 185, 290);
    }

    // ── Save ─────────────────────────────────────
    toast.dismiss();
    doc.save(`lab-report-${report.title || 'report'}.pdf`);
    toast.success('PDF downloaded!');

  } catch (error) {
    toast.dismiss();
    console.error('PDF generation error:', error);
    toast.error('Failed to generate PDF');
  }
};
  // Handle view report
 const handleViewReport = async (report) => {
  // If no file was uploaded, just show the details modal
  if (!report.filePath && !report.fileName) {
    setViewingReport(report);
    return;
  }

  // Only call the API if a file exists
  try {
    console.log("VIEW REPORT ID:", report._id);
    const response = await labReportAPI.viewLabReport(report._id);
    const blob = new Blob([response.data]);
    const fileURL = window.URL.createObjectURL(blob);
    window.open(fileURL, '_blank');
    setViewingReport(report);
  } catch (error) {
    console.error("VIEW ERROR:", error);
    // Fallback: still show the details modal
    setViewingReport(report);
    toast.error('Could not open file, showing details instead');
  }
}


  // Handle delete report
const handleDeleteReport = async () => {
    try {
      await labReportAPI.deleteLabReport(deleteModal.reportId);
      setReports(reports.filter(r => r._id !== deleteModal.reportId));
      setViewingReport(null);
      setDeleteModal({ open: false, reportId: null });
      toast.success('Lab report deleted successfully');
    } catch (error) {
      console.error('Error deleting lab report:', error);
      toast.error('Failed to delete lab report');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { 
    e.preventDefault(); 
    setIsDragging(false); 
    const files = e.dataTransfer.files; 
    if (files && files.length > 0) handleFileUpload(files[0]); 
  };

const reportTypes = [

  'blood-test',

  'urine-test',

  'stool-test',

  'culture-test',

  'biopsy',

  'imaging',

  'genetic-test',

  'allergy-test',

  'hormone-test',

  'cardiac-test',

  'pulmonary-test',

  'other'

];  
  const statCards = useMemo(() => [
    { label: 'Total Reports', value: reports.length, icon: <FileText />, color: 'Blue' },
    { label: 'Normal', value: reports.filter(r => r.status === 'normal').length, icon: <CheckCircle />, color: 'Green' },
    { label: 'Abnormal', value: reports.filter(r => r.status === 'abnormal').length, icon: <AlertCircle />, color: 'Red' },
    { label: 'Pending', value: reports.filter(r => r.status === 'pending').length, icon: <Clock />, color: 'Yellow' }
  ], [reports]);

  if (loading) {
    return (
      <div className={styles.labReportsPage} data-theme={isDarkMode ? 'dark' : 'light'}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading lab reports...</p>
          </div>
        </div>
      </div>
    );
  }

return (
  <div className={styles.labReportsPage} data-theme={isDarkMode ? 'dark' : 'light'}>
    <main className={`${styles.container} ${styles.pageMain}`}>

      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <button onClick={() => navigate('/dashboard')} className={styles.backBtn}>
              <ArrowLeft size={16} color="#ffffff" />
              <span className={styles.backBtnText}>Back</span>
            </button>
            <div className={styles.headerTitle}>
  <div className={styles.headerIconWrapper}>
    <FileText size={20} className={styles.textWhite} />
  </div>

  <div className={styles.headerText}>
    <h1>Lab Reports</h1>

    <p className={styles.pageSubtitle}>
      Manage, view and track all your laboratory reports.
    </p>
  </div>
</div>
          </div>
          <div className={styles.headerRight}>
           <button onClick={() => { setEditingReport(null); setUploadForm({ title: '', type: '', labName: '', doctorName: '', notes: '', status: 'pending', file: null }); setShowUploadModal(true); }} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnUploadDesktop}`}>
  <Plus size={16} /> Upload Report
</button>
<button onClick={() => { setEditingReport(null); setUploadForm({ title: '', type: '', labName: '', doctorName: '', notes: '', status: 'pending', file: null }); setShowUploadModal(true); }} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnUploadMobile}`}>
  <Plus size={20} />
</button>

          </div>
        </div>
      </div>
        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className={styles.statsGrid}
>
            {statCards.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles['icon' + stat.color]}`}>{stat.icon}</div>
                <div className={styles.statInfo}>
                  <p className={styles.statValue}>{stat.value}</p>
                  <p className={styles.statLabel}>{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>

        <motion.div // FIND and CHANGE both modal motion.div animations to:
initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
 className={styles.reportsCard}>
       <div className={styles.searchBarWrapper}>
  <Search className={styles.searchIcon} />

  <input
    type="text"
    placeholder="Search reports..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className={styles.searchInput}
  />
</div>
       <div className={styles.reportsHeader}>
            <h2 className={styles.reportsTitle}>All Reports</h2>
            <div className={styles.filterGroup}>
              {['All', 'Normal', 'Abnormal', 'Pending'].map(filter => (
                <button key={filter} onClick={() => setActiveFilter(filter)} className={`${styles.filterBtn} ${activeFilter === filter ? styles.filterBtnActive : ''}`}>
                  {filter}
                </button>
              ))}
            </div>
          </div>
<div className={styles.tableHeader}>
  <div>REPORT</div>
  <div>DATE</div>
  <div>DOCTOR</div>
  <div>STATUS</div>
  <div>ACTIONS</div>
</div>
          <div className={styles.reportsList}>
            <AnimatePresence>
              {filteredReports.map((report) => {
                const statusPill = getStatusPill(report.status);
                return (
                 <motion.div
  key={report._id}
  layout
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  className={styles.reportItem}
>
  <div className={styles.reportMainSection}>
    <div className={styles.reportFileIcon}>
      <FileText size={22} />
    </div>

    <div>
      <h3 className={styles.reportTitle}>
        {report.title}
      </h3>

      <p className={styles.reportSubTitle}>
        {report.type}
      </p>
    </div>
  </div>

  <div className={styles.reportDateColumn}>
    <strong>
      {report.reportDate
        ? new Date(report.reportDate)
            .toLocaleDateString()
        : "No Date"}
    </strong>

    <span>
      Report Date
    </span>
  </div>

  <div className={styles.reportDoctorColumn}>
    <strong>
      {report.doctorName || "N/A"}
    </strong>

    <span>
      Doctor
    </span>
  </div>

  <div>
    <span
      className={`${styles.statusPill}
      ${statusPill.className}`}
    >
      {statusPill.icon}
      {report.status}
    </span>
  </div>

 <div className={styles.reportItemActions}>
  <button
    onClick={() => handleViewReport(report)}
    className={`${styles.reportActionBtn} ${styles.viewBtn}`}
    title="View"
  >
    <Eye size={20} />
  </button>

  <button
  onClick={() => handleEdit(report)}
  className={`${styles.reportActionBtn} ${styles.editBtn}`}
  title="Edit"
>
  <Edit size={20} />
</button>

  <button
    onClick={() => handleDownload(report)}
    className={`${styles.reportActionBtn} ${styles.downloadBtn}`}
    title="Download"
  >
    <Download size={20} />
  </button>

  <button
onClick={() => setDeleteModal({ open: true, reportId: report._id })}
    className={`${styles.reportActionBtn} ${styles.deleteBtn}`}
    title="Delete"
  >
    <Trash2 size={20} />
  </button>
</div>
</motion.div>
                )
              })}
            </AnimatePresence>
            {filteredReports.length === 0 && (
              <div className={styles.noReportsPlaceholder}>
                <FileText size={64} />
                <h3>No Lab Reports Found</h3>
                <p>
                  {activeFilter !== 'All' 
                    ? `There are no reports matching the "${activeFilter}" filter.` 
                    : 'Start by uploading your first lab report to keep track of your medical tests.'
                  }
                </p>
                {activeFilter === 'All' && (
                  <button onClick={() => setShowUploadModal(true)} className={`${styles.btn} ${styles.btnPrimary}`}>
                    <Plus size={16} /> Upload Your First Report
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* View Report Modal */}
      {viewingReport && (
  <div 
    className={styles.modalOverlay} 
    onClick={() => {
      setViewingReport(null);
      document.body.classList.remove('modal-open');
    }}
  >
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.2 }}
      className={styles.modalContent} 
      onClick={e => e.stopPropagation()}
    >
      <div className={styles.modalHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(108,99,255,0.4)' }}>
            <FileText size={18} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0 }}>Lab Report Details</h2>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>{viewingReport.type}</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setViewingReport(null);
            document.body.classList.remove('modal-open');
          }} 
          className={styles.iconButton}
        >
          <X size={18}/>
        </button>
      </div>

      <div className={styles.modalBody}>
        {[
          { label: 'Title',  value: viewingReport.title },
          { label: 'Type',   value: viewingReport.type },
          { label: 'Lab',    value: viewingReport.labName },
          { label: 'Doctor', value: viewingReport.doctorName || 'N/A' },
          { label: 'Date',   value: viewingReport.reportDate ? new Date(viewingReport.reportDate).toLocaleDateString() : 'No Date' },
        ].map(({ label, value }) => (
          <div key={label} className={styles.detailRow}>
            <strong>{label}</strong>
            <span>{value}</span>
          </div>
        ))}

        <div className={styles.detailRow}>
          <strong>Status</strong>
          <span className={`${styles.statusPill} ${getStatusPill(viewingReport.status).className}`}>
            {getStatusPill(viewingReport.status).icon}
            {viewingReport.status}
          </span>
        </div>

        {viewingReport.notes && viewingReport.notes !== 'undefined' && viewingReport.notes.trim() !== '' && (
          <div className={styles.detailSection}>
            <h4>📋 Notes</h4>
            <p>{viewingReport.notes}</p>
          </div>
        )}

        {viewingReport.fileName && (
          <div className={styles.detailSection}>
            <h4>📎 Attached File</h4>
            <p style={{ color: '#a78bfa' }}>{viewingReport.fileName}</p>
          </div>
        )}
      </div>

      <div className={styles.modalActions}>
        <button 
          onClick={() => { 
            setViewingReport(null); 
            document.body.classList.remove('modal-open');
            handleDownload(viewingReport); 
          }} 
          className={`${styles.btn} ${styles.btnSecondary}`}
        >
          <Download size={16} /> Download
        </button>
        <button 
          onClick={() => {
            setViewingReport(null);
            setDeleteModal({ open: true, reportId: viewingReport._id });
            document.body.classList.remove('modal-open');
          }}
          className={`${styles.btn} ${styles.btnDanger}`}
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>

    </motion.div>
  </div>
)}
      {/* Upload Modal */}
      {showUploadModal && (
<div className={styles.modalOverlay} onClick={() => { setShowUploadModal(false); setEditingReport(null); }}>          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
<h2>{editingReport ? 'Edit Lab Report' : 'Upload Lab Report'}</h2>
<button onClick={() => { setShowUploadModal(false); setEditingReport(null); }} className={styles.iconButton}><X size={24}/></button>            </div>
            
            <form onSubmit={handleUploadSubmit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Report Title *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className={styles.formInput}
                  placeholder="e.g., Blood Test Report"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Report Type *</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
                    required
                    className={styles.formInput}
                  >
                    <option value="">Select type</option>
                    {reportTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Lab Name *</label>
                  <input
                    type="text"
                    value={uploadForm.labName}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, labName: e.target.value }))}
                    required
                    className={styles.formInput}
                    placeholder="e.g., City Lab"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Doctor Name</label>
                <input
                  type="text"
                  value={uploadForm.doctorName}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, doctorName: e.target.value }))}
                  className={styles.formInput}
                  placeholder="e.g., Dr. John Doe"
                />
              </div>

              <div className={styles.formGroup}>
  <label>Status</label>

  <select
    value={uploadForm.status || 'pending'}
    onChange={(e) =>
      setUploadForm(prev => ({
        ...prev,
        status: e.target.value
      }))
    }
    className={styles.formInput}
  >
    <option value="pending">
      Pending
    </option>

    <option value="normal">
      Normal
    </option>

    <option value="abnormal">
      Abnormal
    </option>
  </select>
</div>

              <div className={styles.formGroup}>
                <label>Upload File *</label>
                <div 
                  className={`${styles.fileUploadArea} ${isDragging ? styles.dragging : ''} ${uploadForm.file ? styles.hasFile : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                    className={styles.fileInput}
                  />
                  <Upload size={24} />
                  <p>
                    {uploadForm.file 
                      ? `Selected: ${uploadForm.file.name}` 
                      : 'Drag and drop a file here, or click to select'
                    }
                  </p>
                  <span>Supported formats: JPEG, PNG, GIF, PDF, DOC, DOCX (Max 10MB)</span>
                </div>
              </div>

              <div className={styles.modalActions}>
              <button type="button" onClick={() => { setShowUploadModal(false); setEditingReport(null); }} className={`${styles.btn} ${styles.btnSecondary}`}>
  Cancel
</button>
               <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
  {editingReport ? 'Update Report' : 'Upload Report'}
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
            <h3 className={styles.deleteModalTitle}>Delete Lab Report?</h3>
            <p className={styles.deleteModalText}>
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            <div className={styles.deleteModalActions}>
              <button
                onClick={() => setDeleteModal({ open: false, reportId: null })}
                className={styles.deleteModalBtnSecondary}
              >
                Keep Report
              </button>
              <button
                onClick={handleDeleteReport}
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

export default LabReports;
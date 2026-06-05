const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const healthRecordRoutes = require('./routes/healthRecordRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const labReportRoutes = require('./routes/labReportRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

const app = express();

const PORT = process.env.PORT || 5001;

// ======================
// CORS Configuration
// ======================
app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true
  })
);

// ======================
// Security Middleware
// ======================
app.use(helmet());
app.use(compression());

// ======================
// Rate Limiting
// ======================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500
});
app.use(limiter);

// ======================
// Logging Middleware
// ======================
app.use(morgan('combined'));

// ======================
// Body Parser Middleware
// ======================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================
// MongoDB Connection
// ======================
mongoose
  .connect(
    process.env.MONGODB_URI ||
      'mongodb://localhost:27017/health-hub'
  )
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// ======================
// API Routes
// ======================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/lab-reports', labReportRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes);

// ======================
// Health Check Route
// ======================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Health Hub Server is running'
  });
});

// ======================
// Error Handling Middleware
// ======================
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    error: 'Something went wrong!',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error'
  });
});

// ======================
// 404 Route Handler
// ======================
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// ======================
// Start Server
// ======================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
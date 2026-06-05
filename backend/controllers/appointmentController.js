const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  console.log("APPOINTMENT REQUEST BODY:", req.body);
  try {
    const {
      patient,
      doctor,
      hospital,
      appointmentDate,
      appointmentTime,
      duration,
      department,
      appointmentType,
      status,
      reason,
      symptoms,
      notes
    } = req.body;

    // --- Validate patient ---
    const patientExists = await User.findById(patient);
    if (!patientExists || patientExists.role !== 'patient') {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }

    // --- Validate doctor ---
    const doctorExists = await Doctor.findById(doctor) || await User.findById(doctor);
    if (!doctorExists) {
      return res.status(400).json({ error: 'Invalid doctor ID' });
    }

    // --- Validate hospital ---
    const hospitalExists = await Hospital.findById(hospital);
    if (!hospitalExists) {
      return res.status(400).json({ error: 'Invalid hospital ID' });
    }

    // ─────────────────────────────────────────────────────────────
    // FIXED CONFLICT CHECK
    //
    // Old logic used unreliable string-based time comparisons in
    // MongoDB which caused false positives (valid slots rejected).
    //
    // New logic:
    //   1. Parse the incoming slot's start time into a real Date.
    //   2. Calculate its end time using duration.
    //   3. Find any EXISTING appointment for this doctor on this date
    //      whose time window overlaps the new slot.
    //   4. Only block if a real overlap exists for the SAME doctor.
    //
    // This allows:
    //   - Multiple patients to book the SAME slot (clinic model).
    //   - Future slots on any date.
    //   - Past-time slots to be blocked on the frontend, not here.
    // ─────────────────────────────────────────────────────────────

    // Parse new appointment's time window (using a fixed base date for comparison)
    const BASE = '2000-01-01';
    const newStart = new Date(`${BASE}T${appointmentTime}:00`);
    const newEnd   = new Date(newStart.getTime() + (duration || 30) * 60 * 1000);

    // Fetch all confirmed/scheduled appointments for this doctor on this date
    const existingAppointments = await Appointment.find({
      doctor,
      appointmentDate,
      status: { $in: ['scheduled', 'confirmed'] }
    }).select('appointmentTime duration patient');

    // Check for overlap — only block if the SAME patient already has
    // an appointment in this window (prevents double-booking by same user)
    const patientDoubleBook = existingAppointments.some((appt) => {
      if (appt.patient.toString() !== patient.toString()) return false; // different patient → allow

      const existStart = new Date(`${BASE}T${appt.appointmentTime}:00`);
      const existEnd   = new Date(existStart.getTime() + (appt.duration || 30) * 60 * 1000);

      // Overlap check: new slot starts before existing ends AND new slot ends after existing starts
      return newStart < existEnd && newEnd > existStart;
    });

    if (patientDoubleBook) {
      return res.status(400).json({
        error: 'You already have an appointment with this doctor at this time.'
      });
    }

    // --- Create appointment ---
    const appointment = new Appointment({
      patient,
      doctor,
      hospital,
      appointmentDate,
      appointmentTime,
      duration: duration || 30,
      department,
      appointmentType,
      status: status || 'scheduled',
      reason,
      symptoms,
      notes
    });

    await appointment.save();

    await appointment.populate([
      { path: 'patient',  select: 'firstName lastName email phoneNumber' },
      { path: 'doctor',   select: 'firstName lastName email name specialization', model: Doctor },
      { path: 'hospital', select: 'name address' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: { appointment }
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      error: 'Failed to create appointment. Please try again.'
    });
  }
};

// @desc    Get all appointments (with filtering and pagination)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const filter = {};

    console.log("USER:", req.user._id, req.user.role);
    if (req.user.role === 'patient') {
      filter.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      filter.doctor = req.user._id;
    }
    console.log("FILTER:", filter);

    if (req.query.status)          filter.status          = req.query.status;
    if (req.query.department)      filter.department      = req.query.department;
    if (req.query.appointmentType) filter.appointmentType = req.query.appointmentType;
    if (req.query.date)            filter.appointmentDate = req.query.date;

    if (req.query.dateRange) {
      const [startDate, endDate] = req.query.dateRange.split(',');
      filter.appointmentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (req.query.search) {
      filter.$or = [
        { reason: { $regex: req.query.search, $options: 'i' } },
        { notes:  { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const appointments = await Appointment.find(filter)
      .populate([
        { path: 'patient',  select: 'firstName lastName email phoneNumber' },
        { path: 'doctor',   select: 'firstName lastName email name specialization', model: Doctor },
        { path: 'hospital', select: 'name address' }
      ])
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .skip(skip)
      .limit(limit);

    // Auto-complete past scheduled appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const appointment of appointments) {
      const apptDate = new Date(appointment.appointmentDate);
      apptDate.setHours(0, 0, 0, 0);
      if (appointment.status === 'scheduled' && apptDate < today) {
        appointment.status = 'completed';
        await appointment.save();
      }
    }

    const total = await Appointment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to get appointments. Please try again.' });
  }
};

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate([
        { path: 'patient',  select: 'firstName lastName email phoneNumber dateOfBirth gender bloodGroup address emergencyContact medicalHistory' },
        { path: 'doctor',   select: 'firstName lastName email name specialization', model: Doctor },
        { path: 'hospital', select: 'name address contact' },
        { path: 'prescription' },
        { path: 'labTests.labReport' }
      ]);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, data: { appointment } });
  } catch (error) {
    console.error('Get appointment by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }
    res.status(500).json({ error: 'Failed to get appointment. Please try again.' });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const fields = [
      'appointmentDate','appointmentTime','duration','department',
      'appointmentType','status','reason','symptoms','notes',
      'doctorNotes','diagnosis','followUpDate','followUpNotes','cost','paymentStatus'
    ];

    fields.forEach(f => { if (req.body[f] !== undefined) appointment[f] = req.body[f]; });

    await appointment.save();

    await appointment.populate([
      { path: 'patient',  select: 'firstName lastName email phoneNumber' },
      { path: 'doctor',   select: 'firstName lastName email name specialization', model: Doctor },
      { path: 'hospital', select: 'name address' }
    ]);

    res.json({ success: true, message: 'Appointment updated successfully', data: { appointment } });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment. Please try again.' });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointmentDateTime = new Date(
      `${appointment.appointmentDate.toISOString().split('T')[0]}T${appointment.appointmentTime}:00`
    );
    const hoursUntilAppointment = (appointmentDateTime - new Date()) / (1000 * 60 * 60);
    if (hoursUntilAppointment < 6) {
      return res.status(400).json({
        error: 'Appointment cannot be cancelled within 6 hours of the scheduled time.'
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    if (error.kind === 'ObjectId') return res.status(400).json({ error: 'Invalid appointment ID' });
    res.status(500).json({ error: 'Failed to delete appointment. Please try again.' });
  }
};

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Private
const getAppointmentStats = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'patient') filter.patient = req.user._id;
    else if (req.user.role === 'doctor') filter.doctor = req.user._id;

    const totalAppointments = await Appointment.countDocuments(filter);
    const todayAppointments = await Appointment.countDocuments({
      ...filter,
      appointmentDate: new Date().toISOString().split('T')[0]
    });

    const appointmentsByStatus = await Appointment.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const appointmentsByDepartment = await Appointment.aggregate([
      { $match: filter },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const upcomingAppointments = await Appointment.find({
      ...filter,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate([
        { path: 'patient',  select: 'firstName lastName' },
        { path: 'doctor',   select: 'firstName lastName' },
        { path: 'hospital', select: 'name' }
      ])
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(5);

    res.json({
      success: true,
      data: { totalAppointments, todayAppointments, appointmentsByStatus, appointmentsByDepartment, upcomingAppointments }
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ error: 'Failed to get appointment statistics. Please try again.' });
  }
};

// @desc    Get available time slots
// @route   GET /api/appointments/available-slots
// @access  Private
const getAvailableSlots = async (req, res) => {
  try {
    const { doctor, date, duration = 30 } = req.query;

    if (!doctor || !date) {
      return res.status(400).json({ error: 'Doctor ID and date are required' });
    }

    const workingHours = { start: '09:00', end: '17:00' };

    const existingAppointments = await Appointment.find({
      doctor,
      appointmentDate: date,
      status: { $in: ['scheduled', 'confirmed'] }
    }).select('appointmentTime duration');

    const slots = [];
    const startTime = new Date(`2000-01-01T${workingHours.start}`);
    const endTime   = new Date(`2000-01-01T${workingHours.end}`);

    while (startTime < endTime) {
      const slotTime = startTime.toTimeString().slice(0, 5);
      const hasConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(`2000-01-01T${appointment.appointmentTime}`);
        const appointmentEnd   = new Date(appointmentStart.getTime() + appointment.duration * 60000);
        const slotEnd          = new Date(startTime.getTime() + duration * 60000);
        return startTime < appointmentEnd && slotEnd > appointmentStart;
      });
      if (!hasConflict) slots.push(slotTime);
      startTime.setMinutes(startTime.getMinutes() + 30);
    }

    res.json({ success: true, data: { slots, date, doctor } });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Failed to get available slots. Please try again.' });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentStats,
  getAvailableSlots
};
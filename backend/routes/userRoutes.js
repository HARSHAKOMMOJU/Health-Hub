const express = require('express');
const router = express.Router();

const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// GET CURRENT USER PROFILE
router.get(
  '/profile',
  authenticateToken,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.user.id
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: 'Server error'
      });

    }
  }
);

// UPDATE CURRENT USER PROFILE
router.put(
  '/profile',
  authenticateToken,
  async (req, res) => {
    try {

      const updatedUser =
        await User.findByIdAndUpdate(
          req.user.id,
          req.body,
          {
            new: true,
            runValidators: true
          }
        ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message:
          'Profile updated successfully',
        user: updatedUser
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          'Failed to update profile'
      });

    }
  }
);

// USER STATS
router.get(
  '/stats',
  authenticateToken,
  async (req, res) => {
    try {

      res.json({
        success: true,
        stats: {
          totalAppointments: 0,
          upcomingAppointments: 0,
          totalPrescriptions: 0,
          totalLabReports: 0,
          totalHealthRecords: 0
        }
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          'Failed to fetch stats'
      });

    }
  }
);

module.exports = router;
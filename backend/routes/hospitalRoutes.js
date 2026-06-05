const express = require('express');
const router = express.Router();
const axios = require('axios');

const hospitalController = require('../controllers/hospitalController');
const { authenticateToken } = require('../middleware/auth');

// ==============================
// PUBLIC ROUTES
// ==============================

// Get all hospitals from DB
router.get('/', hospitalController.getAllHospitals);

// Hospital statistics
router.get('/stats', hospitalController.getHospitalStats);

// Search nearby hospitals using FREE OpenStreetMap Overpass API
router.get('/search-nearby', async (req, res) => {
  try {

    const { lat, lng } = req.query;

    // Validate coordinates
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Overpass query
    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:5000,${lat},${lng});
        way["amenity"="hospital"](around:5000,${lat},${lng});
        relation["amenity"="hospital"](around:5000,${lat},${lng});
      );
      out center;
    `;

    // Request to Overpass API
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      query,
      {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    );

    // Format hospitals nicely
    const hospitals = response.data.elements.map((item) => ({
      id: item.id,

      name:
        item.tags?.name || 'Unnamed Hospital',

      address:
        item.tags?.['addr:full'] ||
        item.tags?.['addr:street'] ||
        'Address unavailable',

      emergency:
        item.tags?.emergency || 'Unknown',

      phone:
        item.tags?.phone || 'Not available',

      latitude:
        item.lat || item.center?.lat,

      longitude:
        item.lon || item.center?.lon
    }));

    res.json({
      success: true,
      count: hospitals.length,
      hospitals
    });

  } catch (error) {

    console.error('Nearby hospital search error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby hospitals'
    });
  }
});
router.get('/search', async (req, res) => {

  try {

    const { query } = req.query;

    if (!query) {

      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });

    }

    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: `${query} hospitals`,
          format: 'json',
          addressdetails: 1,
          limit: 20
        },

        headers: {
          'User-Agent': 'HealthHubApp'
        }
      }
    );

    const hospitals = response.data.map((item) => ({

      id: item.place_id,

      name:
        item.display_name.split(',')[0],

      address:
        item.display_name,

      lat: item.lat,

      lng: item.lon

    }));

    res.json({
      success: true,
      hospitals
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospitals'
    });

  }

});
// Get single hospital
router.get('/:id', hospitalController.getHospitalById);

// ==============================
// PROTECTED ADMIN ROUTES
// ==============================

// Create hospital
router.post(
  '/',
  authenticateToken,
  hospitalController.createHospital
);

// Update hospital
router.put(
  '/:id',
  authenticateToken,
  hospitalController.updateHospital
);

// Delete hospital
router.delete(
  '/:id',
  authenticateToken,
  hospitalController.deleteHospital
);

module.exports = router;
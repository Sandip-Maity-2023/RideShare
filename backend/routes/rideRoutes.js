const express = require('express');
const router = express.Router();
const {
  createRide,
  getRides,
  bookRide,
} = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

// Offer/Publish a new ride (Authenticated Employees)
router.post('/', protect, createRide);

// Search/List available rides with optional query params (?origin=...&destination=...)
router.get('/', protect, getRides);

// Book seats 
// on a specific ride
router.post('/:id/book', protect, bookRide);

module.exports = router;
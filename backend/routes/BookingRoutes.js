// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();

// A simple test route just so the server stops crashing
router.get('/test', (req, res) => {
  res.json({ message: "Booking routes are working!" });
});

module.exports = router;
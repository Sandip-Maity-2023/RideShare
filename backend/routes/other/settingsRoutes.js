const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
} = require('../../controllers/other/settingsController');
const { protect } = require('../../middleware/authMiddleware');
const { adminOnly } = require('../../middleware/adminMiddleware');

// Get company configuration (Accessible by all logged-in employees)
router.get('/', protect, getSettings);

// Update configuration (Restricted to CompanyAdmin)
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;

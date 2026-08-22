const express = require('express');
const router = express.Router();
const { getAnalyticsReport } = require('../../controllers/analyticsController');
const { protect } = require('../../middleware/authMiddleware');
const { adminOnly } = require('../../middleware/adminMiddleware');

// Get operational reports & efficiency metrics (Restricted to CompanyAdmin)
// Note: If employees need access to their personal stats later, remove adminOnly and adjust the controller.
router.get('/', protect, adminOnly, getAnalyticsReport);

module.exports = router;

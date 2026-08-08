const express = require('express');
const router = express.Router();
const {
  getVehicles,
  addVehicle,
  toggleVehicleStatus,
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Get all vehicles (Admin gets all, Employee gets their own)
router.get('/', protect, getVehicles);

// Register a new vehicle (Accessible to any authenticated employee)
router.post('/', protect, addVehicle);

// Toggle vehicle status Active/Inactive/Pending (Restricted to CompanyAdmin)
router.patch('/:id/status', protect, adminOnly, toggleVehicleStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getEmployees,
  toggleAccess,
} = require('../../controllers/employeeController');
const { protect } = require('../../middleware/authMiddleware');
const { adminOnly } = require('../../middleware/adminMiddleware');

// Get all registered employees (Restricted to CompanyAdmin)
router.get('/', protect, adminOnly, getEmployees);

// Grant or revoke platform access for an employee (Restricted to CompanyAdmin)
router.patch('/:id/access', protect, adminOnly, toggleAccess);

module.exports = router;

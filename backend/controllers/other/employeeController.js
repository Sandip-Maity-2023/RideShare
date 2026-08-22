const User = require('../models/User');

// @desc    Get all employees
// @route   GET /api/employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'Employee' }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle employee platform access
// @route   PATCH /api/employees/:id/access
exports.toggleAccess = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.platformAccess = !employee.platformAccess;
    await employee.save();

    res.json({
      message: `Access ${employee.platformAccess ? 'granted' : 'revoked'} successfully`,
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

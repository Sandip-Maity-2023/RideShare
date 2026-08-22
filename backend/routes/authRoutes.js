const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// IMPORTANT: We must import the authController you created!
const authController = require('../controllers/authController');

const router = express.Router();

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// User Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, walletBalance: user.walletBalance || 0 } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, walletBalance: user.walletBalance || 0 } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// NEW: Driver Login (Calls your controller function)
router.post('/driver-login', authController.driverLogin);

// ==========================================
// ADMIN DASHBOARD - EMPLOYEES
// ==========================================

// Get all employees for Admin Dashboard
router.get('/admin/employees', async (req, res) => {
  try {
    const employees = await User.find({ role: 'Employee' }).select('-password');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Add Employee
router.post('/admin/add-employee', async (req, res) => {
  try {
    const { name, email, department, manager, location, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Employee with this email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'default123', salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      department: department || 'Engineering',
      manager: manager || 'A. Shah',
      location: location || 'Ahmedabad',
      platformAccess: 'Granted',
      role: 'Employee'
    });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle Platform Access (Granted / Revoked)
router.patch('/admin/toggle-access/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.platformAccess = user.platformAccess === 'Granted' ? 'Revoked' : 'Granted';
    await user.save();
    res.json({ _id: user._id, platformAccess: user.platformAccess });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// ADMIN DASHBOARD - VEHICLES
// ==========================================

// GET all vehicles for Admin Dashboard
router.get('/admin/vehicles', async (req, res) => {
  try {
    const vehicles = [
      { _id: '1', regNo: 'GJ01AB1234', model: 'Swift Dzire', capacity: 4, driver: 'Raj Patel', status: 'Active' },
      { _id: '2', regNo: 'GJ01AB503', model: 'Alto 800', capacity: 3, driver: 'Krishna S', status: 'Active' },
      { _id: '3', regNo: 'GJ01CD778', model: 'Innova Crysta', capacity: 6, driver: 'Priya Nair', status: 'Inactive' }
    ];
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST Add New Vehicle
router.post('/admin/add-vehicle', async (req, res) => {
  try {
    const { regNo, model, capacity, driver } = req.body;
    const newVehicle = {
      _id: Date.now().toString(),
      regNo,
      model,
      capacity,
      driver,
      status: 'Active'
    };
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH Toggle Vehicle Status (Active / Inactive)
router.patch('/admin/toggle-vehicle-status/:id', async (req, res) => {
  try {
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// ADMIN DASHBOARD - SETTINGS
// ==========================================

// GET Organization & Carpooling Settings
router.get('/admin/settings', async (req, res) => {
  try {
    res.json({
      companyName: 'Odoo Pvt. Ltd.',
      industry: 'Software',
      address: 'Gandhinagar',
      adminContact: 'admin@odoo.com',
      fuelCost: '96.50',
      costPerKm: '8.00',
      travelCost: '2.50'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST Save Organization & Carpooling Settings
router.post('/admin/save-settings', async (req, res) => {
  try {
    res.json({ message: 'Settings saved successfully!', settings: req.body });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// WALLET ROUTES
// ==========================================

// Get User Wallet Balance
router.get('/wallet/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ walletBalance: user.walletBalance || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add Funds to Wallet
router.post('/wallet/add', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.walletBalance = (user.walletBalance || 0) + Number(amount);
    await user.save();
    res.json({ walletBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Deduct Funds from Wallet 
router.post('/wallet/deduct', async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fareAmount = Number(amount) || 0;
    const currentBalance = user.walletBalance || 0;

    if (currentBalance < fareAmount) {
      return res.status(400).json({
        message: `Insufficient wallet balance! Current balance: ₹${currentBalance}, Required: ₹${fareAmount}`
      });
    }

    user.walletBalance = currentBalance - fareAmount;
    await user.save();

    res.json({
      message: 'Wallet balance deducted successfully',
      walletBalance: user.walletBalance
    });
  } catch (err) {
    console.error('Error deducting wallet balance:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
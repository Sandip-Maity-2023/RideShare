const Vehicle = require('../models/Vehicle');

// @desc    Get vehicles (all if Admin, personal if Employee)
// @route   GET /api/vehicles
exports.getVehicles = async (req, res) => {
  try {
    const query = req.user.role === 'CompanyAdmin' ? {} : { owner: req.user._id };
    const vehicles = await Vehicle.find(query).populate('owner', 'name email');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new vehicle
// @route   POST /api/vehicles
exports.addVehicle = async (req, res) => {
  try {
    const { registrationNumber, model, seatingCapacity } = req.body;

    const existingVehicle = await Vehicle.findOne({ registrationNumber });
    if (existingVehicle) {
      return res.status(400).json({ message: 'Vehicle registration number already exists' });
    }

    const vehicle = await Vehicle.create({
      owner: req.user._id,
      registrationNumber,
      model,
      seatingCapacity,
    });

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle vehicle status (Admin)
// @route   PATCH /api/vehicles/:id/status
exports.toggleVehicleStatus = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    vehicle.status = vehicle.status === 'Active' ? 'Inactive' : 'Active';
    await vehicle.save();

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

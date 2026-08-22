const express = require('express');
const Vehicle = require('../models/Vehicle');
const router = express.Router();

router.post('/add', async (req, res) => {
  try {
    const { driverId, model, registrationNumber, seatingCapacity } = req.body;
    const vehicle = new Vehicle({ driver: driverId, model, registrationNumber, seatingCapacity });
    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:driverId', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ driver: req.params.driverId });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
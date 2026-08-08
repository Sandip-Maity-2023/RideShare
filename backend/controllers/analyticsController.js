const Ride = require('../models/Ride');
const Vehicle = require('../models/Vehicle');
const Settings = require('../models/Settings');

// @desc    Get operational reports & efficiency charts data
// @route   GET /api/analytics
exports.getAnalyticsReport = async (req, res) => {
  try {
    const totalRides = await Ride.countDocuments({ status: 'Completed' });
    const settings = await Settings.findOne() || { fuelCostPerLiter: 96.5, travelCostPerKm: 8.0 };

    const distanceStats = await Ride.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalKm: { $sum: '$totalDistanceKm' } } },
    ]);

    const totalKm = distanceStats[0]?.totalKm || 0;
    const estimatedFuelLitres = (totalKm / 15).toFixed(2); // Avg 15 km/l calculation
    const co2SavedTons = ((totalKm * 0.12) / 1000).toFixed(2); // ~120g CO2 per km saved per shared ride

    res.json({
      metrics: {
        totalDistanceKm: totalKm,
        fuelConsumedLiters: Number(estimatedFuelLitres),
        costPerKm: settings.travelCostPerKm,
        co2SavedTons: Number(co2SavedTons),
        totalCompletedRides: totalRides,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

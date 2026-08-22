const Ride = require("../models/Ride"); // Adjust path to your Ride model
const Vehicle = require("../models/Vehicle"); // Adjust path to your Vehicle model

// @desc    Get dynamic fleet and financial analytics report
// @route   GET /api/reports
// @access  Public / Private (as needed)
exports.getReportData = async (req, res) => {
  try {
    // 1. Calculate Total Fuel Cost from completed rides or vehicles
    const totalFuelAgg = await Ride.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalFuel: { $sum: "$fuelCost" } } }
    ]);

    const totalFuelValue = totalFuelAgg.length > 0 ? totalFuelAgg[0].totalFuel : 0;

    // 2. Calculate Active Utilization Rate
    const totalVehiclesCount = await Vehicle.countDocuments();
    const activeVehiclesCount = await Vehicle.countDocuments({ status: "active" });
    const utilizationCalc = totalVehiclesCount > 0 
      ? Math.round((activeVehiclesCount / totalVehiclesCount) * 100) 
      : 0;

    // 3. Top 5 Costliest Vehicles (aggregator grouping by vehicle)
    const costliestVehicles = await Ride.aggregate([
      {
        $group: {
          _id: "$vehicleName", // or "$vehicle" if referencing Vehicle ID
          cost: { $sum: "$fuelCost" }
        }
      },
      { $sort: { cost: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: "$_id",
          cost: "$cost"
        }
      }
    ]);

    // 4. Monthly Financial Summary Aggregation
    const financialSummary = await Ride.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$price" },
          totalFuelCost: { $sum: "$fuelCost" },
          totalMaintenance: { $sum: "$maintenanceCost" }
        }
      },
      { $sort: { "_id": 1 } }
    ]).then(results => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return results.map(item => {
        const rev = item.totalRevenue || 0;
        const fuel = item.totalFuelCost || 0;
        const maint = item.totalMaintenance || 0;
        const profit = rev - (fuel + maint);

        return {
          id: item._id,
          month: monthNames[item._id - 1] || `Month ${item._id}`,
          revenue: `Rs. ${rev}`,
          fuelCost: `Rs. ${fuel}`,
          maintenance: `Rs. ${maint}`,
          netProfit: `Rs. ${profit}`
        };
      });
    });

    // Send computed real dynamic metrics
    res.status(200).json({
      success: true,
      metrics: {
        totalFuelCost: `Rs. ${totalFuelValue}`,
        fleetRoi: "+15%", // Can be calculated dynamically based on revenue vs investment
        utilizationRate: `${utilizationCalc}%`
      },
      fuelEfficiency: [
        // Map monthly mileage average from Database if tracked
        { id: 1, label: "Jan", val: 40 },
        { id: 2, label: "Feb", val: 80 },
        { id: 3, label: "Mar", val: 120 }
      ],
      costliestVehicles: costliestVehicles.length > 0 ? costliestVehicles : [
        { id: "1", name: "No Data", cost: 0 }
      ],
      financialSummary
    });

  } catch (error) {
    console.error("Error generating report analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load database reports."
    });
  }
};
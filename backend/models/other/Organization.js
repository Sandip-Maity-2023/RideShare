const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true }, //
  registeredAddress: String,
  industry: String,
  adminContactEmail: String,
  fuelCostPerLiter: { type: Number, default: 96.50 }, //
  travelCostPerKm: { type: Number, default: 8.00 }, //[cite: 1]
  carpoolingPolicy: String
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
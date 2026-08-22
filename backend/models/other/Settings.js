const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      default: 'Odoo Pvt. Ltd.',
    },
    registeredAddress: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: 'Software',
    },
    adminContactEmail: {
      type: String,
      required: true,
    },
    fuelCostPerLiter: {
      type: Number,
      required: true,
      default: 96.5,
    },
    travelCostPerKm: {
      type: Number,
      required: true,
      default: 8.0,
    },
    optionalTravelCost: {
      type: Number,
      default: 2.5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);

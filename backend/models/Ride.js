const rideSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, //
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }, //
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true }, //
  startLocation: {
    address: String,
    location: { type: { type: String, default: 'Point' }, coordinates: [Number] } // [lng, lat]
  },
  destinationLocation: {
    address: String,
    location: { type: { type: String, default: 'Point' }, coordinates: [Number] }
  },
  departureTime: { type: Date, required: true }, //
  availableSeats: { type: Number, required: true }, //
  farePerSeat: { type: Number, required: true }, //
  isRecurring: { type: Boolean, default: false }, //
  recurringDays: [String], // ['Mo', 'Tu', 'We', ...]
  status: { type: String, enum: ['Published', 'In Progress', 'Completed', 'Cancelled'], default: 'Published' } //
}, { timestamps: true });

rideSchema.index({ "startLocation.location": "2dsphere" });
module.exports = mongoose.model('Ride', rideSchema);
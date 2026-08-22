const mongoose = require("mongoose");

const tripBookingSchema = new mongoose.Schema({
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, //
  seatsBooked: { type: Number, default: 1 },
  totalFare: { type: Number, required: true }, //
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' }, //
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'Wallet'] }, //
  tripStatus: { type: String, enum: ['Booked', 'Started', 'In Progress', 'Completed', 'Cancelled'], default: 'Booked' } //
}, { timestamps: true });

module.exports = mongoose.model('TripBooking', tripBookingSchema);
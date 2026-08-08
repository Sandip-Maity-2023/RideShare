const vehicleSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, //
  registrationNumber: { type: String, required: true, unique: true }, //
  model: { type: String, required: true }, //
  seatingCapacity: { type: Number, required: true }, //
  status: { type: String, enum: ['Active', 'Inactive', 'PendingApproval'], default: 'Active' } //
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);

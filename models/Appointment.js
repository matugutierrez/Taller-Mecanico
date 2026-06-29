const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clientName:  { type: String, required: true, trim: true },
  clientPhone: { type: String, required: true, trim: true },
  clientEmail: { type: String, trim: true, lowercase: true },
  vehicleBrand:{ type: String, required: true, trim: true },
  vehicleModel:{ type: String, required: true, trim: true },
  vehicleYear: { type: Number, required: true, min: 1980, max: 2030 },
  service:     { type: String, required: true },
  date:        { type: Date, required: true },
  time:        { type: String, required: true },
  status:      { type: String, enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  notes:       { type: String, trim: true }
}, { timestamps: true });

appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ clientPhone: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);

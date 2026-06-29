const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  description:{ type: String, required: true },
  icon:       { type: String, required: true },
  price:      { type: Number },
  category:   { type: String, enum: ['motor', 'electricidad', 'escaneo', 'mantenimiento', 'diagnostico'], required: true },
  features:   [{ type: String }],
  isActive:   { type: Boolean, default: true },
  sortOrder:  { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);

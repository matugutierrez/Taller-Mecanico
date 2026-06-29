const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  clientName: { type: String, required: true, trim: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, required: true, maxlength: 1000 },
  isApproved: { type: Boolean, default: false },
  service:    { type: String, trim: true }
}, { timestamps: true });

reviewSchema.index({ isApproved: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);

const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category:    { type: String, enum: ['motores', 'electricidad', 'escaneo', 'diagnostico', 'general'], default: 'general' },
  imageUrl:    { type: String, required: true },
  thumbUrl:    { type: String },
  sortOrder:   { type: Number, default: 0 }
}, { timestamps: true });

galleryImageSchema.index({ category: 1, sortOrder: 1 });

module.exports = mongoose.model('GalleryImage', galleryImageSchema);

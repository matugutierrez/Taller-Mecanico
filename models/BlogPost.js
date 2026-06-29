const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true },
  slug:      { type: String, required: true, unique: true, lowercase: true },
  excerpt:   { type: String, required: true, maxlength: 300 },
  content:   { type: String, required: true },
  category:  { type: String, enum: ['consejos', 'mantenimiento', 'tecnologia', 'noticias', 'tutoriales'], required: true },
  tags:      [{ type: String, trim: true, lowercase: true }],
  author:    { type: String, default: 'Taller Gutiérrez' },
  image:     { type: String },
  published: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

blogPostSchema.index({ category: 1, published: 1, createdAt: -1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);

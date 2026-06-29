require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const { validateAppointment, validateContact, validateReview } = require('./middleware/validators');

const Service = require('./models/Service');
const Appointment = require('./models/Appointment');
const Review = require('./models/Review');
const BlogPost = require('./models/BlogPost');
const ContactMessage = require('./models/ContactMessage');
const GalleryImage = require('./models/GalleryImage');
const FAQ = require('./models/FAQ');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Demasiadas solicitudes, intentá de nuevo en 15 min' } });
app.use('/api', apiLimiter);

// ===================== API SERVICES =====================
app.get('/api/services', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    const services = await Service.find(filter).sort({ sortOrder: 1 });
    res.json(services);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(service);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/services', async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(service);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json({ message: 'Servicio eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== API APPOINTMENTS =====================
app.get('/api/appointments', async (req, res) => {
  try {
    const { status, date, phone } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) filter.date = new Date(date);
    if (phone) filter.clientPhone = phone;
    const appointments = await Appointment.find(filter).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/appointments/availability', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Fecha requerida' });
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0) return res.json({ date, available: false, reason: 'Domingo cerrado' });
    if (dayOfWeek === 6) return res.json({ date, available: false, reason: 'Sábado cerrado' });
    const existing = await Appointment.find({ date: dateObj, status: { $ne: 'cancelled' } });
    const slots = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];
    const booked = existing.map(a => a.time);
    const available = slots.filter(s => !booked.includes(s));
    res.json({ date, available, dayOfWeek, slots: available });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/appointments/:id', async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Turno no encontrado' });
    res.json(appt);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/appointments', validateAppointment, async (req, res) => {
  try {
    const existing = await Appointment.findOne({ date: new Date(req.body.date), time: req.body.time, status: { $ne: 'cancelled' } });
    if (existing) return res.status(409).json({ error: 'Ese horario ya está reservado' });
    const appointment = await Appointment.create(req.body);
    res.status(201).json(appointment);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!appt) return res.status(404).json({ error: 'Turno no encontrado' });
    res.json(appt);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending','confirmed','in_progress','completed','cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    const appt = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!appt) return res.status(404).json({ error: 'Turno no encontrado' });
    res.json(appt);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndDelete(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Turno no encontrado' });
    res.json({ message: 'Turno eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== API REVIEWS =====================
app.get('/api/reviews', async (req, res) => {
  try {
    const filter = { isApproved: true };
    if (req.query.all === 'true') delete filter.isApproved;
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    const stats = await Review.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    res.json({ reviews, stats: stats[0] || { avg: 0, count: 0 } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reviews', validateReview, async (req, res) => {
  try {
    const review = await Review.create({ ...req.body, isApproved: false });
    res.status(201).json({ message: 'Gracias por tu reseña. Será publicada después de revisión.', review });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/reviews/:id/approve', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' });
    res.json(review);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: 'Reseña no encontrada' });
    res.json({ message: 'Reseña eliminada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== API BLOG =====================
app.get('/api/blog', async (req, res) => {
  try {
    const { category, tag, published } = req.query;
    const filter = {};
    if (published !== 'false') filter.published = true;
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    const posts = await BlogPost.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/blog/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    res.json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/blog', async (req, res) => {
  try {
    const post = await BlogPost.create(req.body);
    res.status(201).json(post);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/blog/:id', async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    res.json(post);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/blog/:id', async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    res.json({ message: 'Post eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== API CONTACT =====================
app.get('/api/contact', async (req, res) => {
  try {
    const filter = {};
    if (req.query.unread === 'true') filter.isRead = false;
    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/contact', validateContact, async (req, res) => {
  try {
    const msg = await ContactMessage.create(req.body);
    res.status(201).json({ message: 'Mensaje enviado correctamente. Te responderemos a la brevedad.', msg });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/contact/:id/read', async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!msg) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.json(msg);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/contact/:id', async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.json({ message: 'Mensaje eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== API GALLERY =====================
app.get('/api/gallery', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const images = await GalleryImage.find(filter).sort({ sortOrder: 1 });
    res.json(images);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/gallery', async (req, res) => {
  try {
    const image = await GalleryImage.create(req.body);
    res.status(201).json(image);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const image = await GalleryImage.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).json({ error: 'Imagen no encontrada' });
    res.json({ message: 'Imagen eliminada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== API FAQ =====================
app.get('/api/faq', async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    const faqs = await FAQ.find(filter).sort({ sortOrder: 1 });
    res.json(faqs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/faq', async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json(faq);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/faq/:id', async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!faq) return res.status(404).json({ error: 'FAQ no encontrada' });
    res.json(faq);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/faq/:id', async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ no encontrada' });
    res.json({ message: 'FAQ eliminada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== API STATS =====================
app.get('/api/stats', async (req, res) => {
  try {
    const [services, appointments, reviews, posts] = await Promise.all([
      Service.countDocuments({ isActive: true }),
      Appointment.countDocuments({ status: { $ne: 'cancelled' } }),
      Review.countDocuments({ isApproved: true }),
      BlogPost.countDocuments({ published: true })
    ]);
    const avgRating = await Review.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    const upcomingAppointments = await Appointment.countDocuments({ date: { $gte: new Date() }, status: { $in: ['pending','confirmed'] } });
    res.json({ services, appointments, reviews, posts, avgRating: avgRating[0]?.avg || 0, upcomingAppointments });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== SPA SHELL =====================
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Ruta API no encontrada' });
  }
  res.render('index', { title: 'Taller Gutiérrez - Mecánica Integral' });
});

// ===================== ERROR HANDLING =====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ===================== START =====================
async function start() {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
  });
}

start();

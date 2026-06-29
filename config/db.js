const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI no definida en variables de entorno');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('MongoDB conectado');
  } catch (err) {
    console.error('Error conectando MongoDB:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;

function validateAppointment(req, res, next) {
  const { clientName, clientPhone, vehicleBrand, vehicleModel, vehicleYear, service, date, time } = req.body;
  const errors = [];
  if (!clientName || clientName.trim().length < 2) errors.push('Nombre inválido');
  if (!clientPhone || clientPhone.trim().length < 7) errors.push('Teléfono inválido');
  if (!vehicleBrand) errors.push('Marca del vehículo requerida');
  if (!vehicleModel) errors.push('Modelo del vehículo requerido');
  if (!vehicleYear || vehicleYear < 1980 || vehicleYear > 2030) errors.push('Año inválido (1980-2030)');
  if (!service) errors.push('Servicio requerido');
  if (!date) errors.push('Fecha requerida');
  if (!time) errors.push('Horario requerido');
  if (errors.length) return res.status(400).json({ error: 'Datos inválidos', details: errors });
  next();
}

function validateContact(req, res, next) {
  const { name, email, subject, message } = req.body;
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Nombre inválido');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email inválido');
  if (!subject || subject.trim().length < 3) errors.push('Asunto inválido');
  if (!message || message.trim().length < 10) errors.push('Mensaje demasiado corto');
  if (errors.length) return res.status(400).json({ error: 'Datos inválidos', details: errors });
  next();
}

function validateReview(req, res, next) {
  const { clientName, rating, comment } = req.body;
  const errors = [];
  if (!clientName || clientName.trim().length < 2) errors.push('Nombre inválido');
  if (!rating || rating < 1 || rating > 5) errors.push('Puntuación debe ser 1-5');
  if (!comment || comment.trim().length < 5) errors.push('Comentario demasiado corto');
  if (comment && comment.length > 1000) errors.push('Comentario máximo 1000 caracteres');
  if (errors.length) return res.status(400).json({ error: 'Datos inválidos', details: errors });
  next();
}

module.exports = { validateAppointment, validateContact, validateReview };

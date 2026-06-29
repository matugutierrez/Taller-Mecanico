require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');
const FAQ = require('./models/FAQ');
const BlogPost = require('./models/BlogPost');
const GalleryImage = require('./models/GalleryImage');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('Falta MONGODB_URI'); process.exit(1); }

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Conectado, sembrando datos...');

  await Promise.all([
    Service.deleteMany({}), FAQ.deleteMany({}),
    BlogPost.deleteMany({}), GalleryImage.deleteMany({})
  ]);

  const services = await Service.insertMany([
    { name:'Reparación de Motores', description:'Diagnóstico y reparación integral de motores nafteros y diésel. Rectificación, distribución, cambio de juntas, bombas de agua y sistemas de lubricación.', icon:'engine', category:'motor', price:45000, features:['Diagnóstico computarizado','Rectificación de cilindros','Distribución completa','Prueba de compresión','Garantía 6 meses'], sortOrder:1 },
    { name:'Escaneo Computarizado', description:'Diagnóstico electrónico con scanners de última generación. Lectura y borrado de códigos de falla, sensores, actuadores y centralitas.', icon:'microchip', category:'escaneo', price:12000, features:['Scanner multimarca','Códigos de falla','Sensores en vivo','Centralitas','Reset de servicios'], sortOrder:2 },
    { name:'Electricidad del Automóvil', description:'Reparación de sistemas eléctricos: alternadores, motores de arranque, cableado completo, lucias, tableros, levantavidrios y cierre centralizado.', icon:'car-battery', category:'electricidad', price:25000, features:['Alternadores','Arranque','Cableado','Luces LED','Tableros'], sortOrder:3 },
    { name:'Diagnóstico General', description:'Revisión completa del vehículo con equipamiento profesional. Detección de fallas mecánicas, eléctricas y electrónicas.', icon:'stethoscope', category:'diagnostico', price:8000, features:['Revisión visual','Scanner','Prueba dinámica','Informe detallado','Recomendaciones'], sortOrder:4 },
    { name:'Mantenimiento Programado', description:'Servicios de mantenimiento según el plan del fabricante. Cambio de aceite, filtros, bujías, correas, líquidos y puesta a punto.', icon:'oil-can', category:'mantenimiento', price:18000, features:['Aceite y filtros','Bujías','Correa distribución','Líquidos','Puesta a punto'], sortOrder:5 },
    { name:'Suspensión y Dirección', description:'Reparación y reemplazo de amortiguadores, espirales, bujes, extremos de dirección, cajas de dirección y alineación.', icon:'car', category:'motor', price:32000, features:['Amortiguadores','Espirales','Bujes','Extremos','Alineación'], sortOrder:6 }
  ]);
  console.log(`  ${services.length} servicios creados`);

  const faqs = await FAQ.insertMany([
    { question:'¿Cuánto tarda una reparación de motor?', answer:'Depende del tipo de reparación. Un diagnóstico inicial toma 1-2 horas. Reparaciones mayores pueden llevar de 3 a 10 días hábiles. Te damos un tiempo estimado después del diagnóstico.', category:'servicios', sortOrder:1 },
    { question:'¿Hacen presupuesto sin cargo?', answer:'Sí, el diagnóstico inicial y presupuesto son sin cargo. Solo abonás si autorizás la reparación.', category:'precios', sortOrder:2 },
    { question:'¿Cómo saco un turno?', answer:'Podés sacar turno por WhatsApp al +54 9 11 5937-1225, por teléfono, o directamente desde nuestra web usando el sistema de reserva online.', category:'turnos', sortOrder:3 },
    { question:'¿Trabajan todas las marcas?', answer:'Trabajamos con todas las marcas nacionales e importadas. Tenemos equipos y experiencia en vehículos modernos y clásicos.', category:'general', sortOrder:4 },
    { question:'¿Qué métodos de pago aceptan?', answer:'Aceptamos efectivo, transferencia bancaria, Mercado Pago, tarjetas de débito y crédito (hasta 6 cuotas).', category:'precios', sortOrder:5 },
    { question:'¿Cuánto dura el escaneo?', answer:'El escaneo completo toma aproximadamente 30-45 minutos. Incluye lectura de todos los módulos electrónicos y un informe detallado.', category:'servicios', sortOrder:6 },
    { question:'¿Hacen reparaciones a domicilio?', answer:'No realizamos reparaciones a domicilio. Contamos con un taller equipado con toda la maquinaria necesaria para garantizar un trabajo de calidad.', category:'general', sortOrder:7 },
    { question:'¿Tienen vehículo de cortesía?', answer:'No disponemos de vehículo de cortesía, pero estamos cerca de transporte público y coordinamos para minimizar las molestias.', category:'general', sortOrder:8 },
    { question:'¿Cómo sé si mi auto necesita escaneo?', answer:'Si se enciende la luz de check engine, notás pérdida de potencia, aumento de consumo, marcha irregular o vibraciones extrañas, es recomendable hacer un escaneo.', category:'vehiculos', sortOrder:9 },
    { question:'¿Cuándo debo cambiar la correa de distribución?', answer:'Generalmente cada 60.000 a 100.000 km o según lo indique el fabricante. Revisá el manual de tu vehículo. Nosotros podemos verificarlo.', category:'vehiculos', sortOrder:10 }
  ]);
  console.log(`  ${faqs.length} FAQs creadas`);

  const posts = await BlogPost.insertMany([
    { title:'¿Cada cuánto cambiar el aceite del motor?', slug:'cada-cuanto-cambiar-aceite-motor', excerpt:'La guía definitiva para saber cada cuántos kilómetros o meses cambiar el aceite de tu auto y mantener el motor en óptimas condiciones.', content:`<p>El aceite del motor es la sangre de tu vehículo. Mantenerlo en buen estado es fundamental para garantizar la vida útil del motor.</p><h3>¿Cada cuántos kilómetros?</h3><p>La regla general es cada 10.000 km o una vez al año (lo que ocurra primero) para aceites minerales. Los aceites sintéticos pueden durar hasta 15.000 km.</p><h3>Señales de que necesitás cambio</h3><ul><li>Color oscuro y espeso</li><li>Nivel bajo en la varilla</li><li>Ruido del motor más notorio</li><li>Testigo de aceite encendido</li></ul><p>En Taller Gutiérrez usamos aceites de primera calidad y te recomendamos el mejor para tu vehículo.</p>`, category:'mantenimiento', tags:['aceite','motor','mantenimiento','lubricacion'], published:true },
    { title:'Luces del tablero: qué significan y qué hacer', slug:'luces-tablero-significado', excerpt:'Aprendé a identificar las luces de advertencia del tablero de tu auto y sabé qué hacer cuando se enciende cada una.', content:`<p>El tablero de tu auto habla. Cada luz tiene un significado y es importante saber interpretarlas.</p><h3>Luces rojas (detenerse ya)</h3><ul><li><strong>Batería:</strong> problema en el sistema de carga</li><li><strong>Aceite:</strong> presión baja de aceite</li><li><strong>Freno:</strong> líquido de frenos bajo o freno de mano puesto</li></ul><h3>Luces amarillas (revisar pronto)</h3><ul><li><strong>Check Engine:</strong> múltiples causas, desde una tapa de combustible floja hasta una falla grave</li><li><strong>ABS:</strong> sistema antibloqueo con falla</li><li><strong>Presión de neumáticos:</strong> algún neumático tiene baja presión</li></ul><p>Si tenés alguna luz encendida, traé tu auto al taller y la diagnosticamos sin cargo.</p>`, category:'consejos', tags:['tablero','luces','diagnostico','seguridad'], published:true },
    { title:'Mantenimiento de la batería en invierno', slug:'mantenimiento-bateria-invierno', excerpt:'El frío afecta el rendimiento de la batería. Conocé cómo cuidarla y evitar quedarte varado en los meses de invierno.', content:`<p>Las bajas temperaturas reducen la capacidad de la batería hasta un 30%. Acá te contamos cómo prevenir fallas.</p><h3>Cuidados básicos</h3><ul><li>Revisar bornes y conexiones</li><li>Mantener la batería limpia y seca</li><li>Evitar trayectos muy cortos que no permitan recargarla</li><li>Controlar el nivel de electrolito (baterías con mantenimiento)</li></ul><p>En nuestro taller hacemos revisión gratuita de batería con equipos profesionales.</p>`, category:'consejos', tags:['bateria','invierno','electricidad','mantenimiento'], published:true },
    { title:'Diagnóstico con scanner: mitos y verdades', slug:'diagnostico-scanner-mitos', excerpt:'El scanner es una herramienta poderosa, pero no lo resuelve todo. Te explicamos cómo funciona realmente el diagnóstico computarizado.', content:`<p>Hay muchos mitos alrededor del escaneo computarizado. Aclaramos los más comunes.</p><h3>Mito: "El scanner dice exactamente qué pieza cambiar"</h3><p>Realidad: El scanner indica dónde está la falla, pero no siempre qué pieza específica. Un diagnóstico correcto requiere interpretación y experiencia.</p><h3>Mito: "Si no hay código de falla, no hay problema"</h3><p>Realidad: Muchas fallas mecánicas no generan códigos. El scanner es una herramienta más, no el diagnóstico completo.</p><p>En Taller Gutiérrez combinamos scanner de última generación con la experiencia de nuestros técnicos.</p>`, category:'tecnologia', tags:['scanner','diagnostico','electronica','mitos'], published:true },
    { title:'¿Por qué tiembla mi auto? Causas comunes', slug:'por-que-tiembla-auto', excerpt:'Las vibraciones del auto pueden tener muchas causas. Te ayudamos a identificar las más frecuentes y sus soluciones.', content:`<p>Un auto que tiembla no es normal. Estas son las causas más comunes según el tipo de vibración.</p><h3>Vibración en el volante</h3><p>Generalmente es problema de balanceo o alineación de las ruedas delanteras.</p><h3>Vibración en el asiento</h3><p>Suele ser transmisión, cardán o soportes de motor.</p><h3>Vibración al frenar</h3><p>Discos de freno deformados o pastillas en mal estado.</p><h3>Vibración en punto muerto</h3><p>Puede ser bujías, inyectores, soportes de motor o problemas de admisión.</p><p>No dejes pasar las vibraciones. Traé tu auto y lo revisamos.</p>`, category:'tutoriales', tags:['vibraciones','temblor','ruedas','frenos','motor'], published:true }
  ]);
  console.log(`  ${posts.length} posts creados`);

  const gallery = await GalleryImage.insertMany([
    { title:'Reparación de motor BMW', description:'Rectificación completa de motor BMW 320i', category:'motores', imageUrl:'/images/gallery/motor-1.jpg', thumbUrl:'/images/gallery/motor-1-thumb.jpg', sortOrder:1 },
    { title:'Escaneo Audi A4', description:'Diagnóstico con scanner multimarca', category:'escaneo', imageUrl:'/images/gallery/escaneo-1.jpg', thumbUrl:'/images/gallery/escaneo-1-thumb.jpg', sortOrder:2 },
    { title:'Instalación eléctrica completa', description:'Cableado nuevo para Ford Ranger', category:'electricidad', imageUrl:'/images/gallery/electricidad-1.jpg', thumbUrl:'/images/gallery/electricidad-1-thumb.jpg', sortOrder:3 },
    { title:'Reparación de alternador', description:'Alternador reconstruido Toyota Corolla', category:'electricidad', imageUrl:'/images/gallery/electricidad-2.jpg', thumbUrl:'/images/gallery/electricidad-2-thumb.jpg', sortOrder:4 },
    { title:'Cambio de distribución', description:'Distribución completa Volkswagen Gol', category:'motores', imageUrl:'/images/gallery/motor-2.jpg', thumbUrl:'/images/gallery/motor-2-thumb.jpg', sortOrder:5 },
    { title:'Scanner de última generación', description:'Equipo Autel Maxisys Ultra en acción', category:'escaneo', imageUrl:'/images/gallery/escaneo-2.jpg', thumbUrl:'/images/gallery/escaneo-2-thumb.jpg', sortOrder:6 }
  ]);
  console.log(`  ${gallery.length} imágenes creadas`);

  await mongoose.disconnect();
  console.log('Seed completado exitosamente.');
}

seed().catch(err => { console.error(err); process.exit(1); });

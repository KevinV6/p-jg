const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productoRoutes = require('./routes/productoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const cobroRoutes = require('./routes/cobroRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const configRoutes = require('./routes/configRoutes');
const { healthCheck } = require('./controllers/healthController');

const app = express();

// Middlewares de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configurado para desarrollo y producción
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Logging
app.use(morgan('dev'));

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ruta de salud
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'JG Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check mejorado
app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/cobros', cobroRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/config', configRoutes);

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Error de Multer (archivos muy grandes)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'El archivo es demasiado grande. Máximo 5MB.'
    });
  }
  
  // Error de validación de JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'JSON inválido en el cuerpo de la petición'
    });
  }
  
  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoices');
const providerRoutes = require('./routes/providers');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const { errorHandler } = require('./middleware/errorHandler');
const { verifyToken } = require('./middleware/auth');

const app = express();

// Middlewares de seguridad y parsing
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Rutas públicas
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
app.use('/api/invoices', verifyToken, invoiceRoutes);
app.use('/api/providers', verifyToken, providerRoutes);
app.use('/api/reports', verifyToken, reportRoutes);
app.use('/api/users', verifyToken, userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  📄 SISTEMA DE FACTURAS CON OCR       ║
║  🚀 Servidor iniciado correctamente    ║
║  ✅ Puerto: ${PORT}                      ║
║  ✅ Entorno: ${process.env.NODE_ENV}    ║
╚════════════════════════════════════════╝
  `);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

module.exports = app;

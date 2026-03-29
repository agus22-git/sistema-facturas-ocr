# 🔗 Guía de Integración - Nuevas Características

Esta guía te ayudará a integrar las nuevas características en el servidor.

---

## 📋 Pasos de Integración

### 1. Instalar Dependencias Nuevas

```bash
npm install nodemailer node-cache express-rate-limit rate-limit-redis redis pdfkit exceljs swagger-jsdoc swagger-ui-express
```

### 2. Actualizar Variables de Entorno

Agregar a `.env`:

```env
# EMAIL
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_contraseña_app

# RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# REDIS (OPCIONAL)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# EXPORTACIÓN
EXPORT_DIR=./exports
```

### 3. Actualizar server.js

Reemplazar el contenido de `server.js` con esto:

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Rutas
const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoices');
const providerRoutes = require('./routes/providers');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');      // NUEVO
const exportRoutes = require('./routes/export');    // NUEVO

// Middleware
const { errorHandler } = require('./middleware/errorHandler');
const { verifyToken } = require('./middleware/auth');
const { generalLimiter, authLimiter } = require('./middleware/rateLimit'); // NUEVO

// Swagger
const { swaggerSpec, swaggerUi } = require('./swagger');

const app = express();

// Middlewares de seguridad
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

// Rate limiting global
app.use(generalLimiter);

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rutas públicas
app.use('/api/auth', authLimiter, authRoutes);

// Rutas protegidas
app.use('/api/invoices', verifyToken, invoiceRoutes);
app.use('/api/providers', verifyToken, providerRoutes);
app.use('/api/reports', verifyToken, reportRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/admin', verifyToken, adminRoutes);        // NUEVO
app.use('/api/export', verifyToken, exportRoutes);      // NUEVO

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
║  ✅ Versión: 1.1.0                      ║
║  ✅ Swagger: /api-docs                  ║
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
```

### 4. Actualizar Migrations (init.sql)

Agregar estos comandos al final de `migrations/init.sql`:

```sql
-- Agregar columnas nuevas si no existen
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;

-- Tabla de audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  action VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Tabla de password resets
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);

-- Tabla de email logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  recipient VARCHAR(255),
  subject VARCHAR(255),
  email_type VARCHAR(50),
  status VARCHAR(20), -- sent, failed, bounced
  error_message TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
```

### 5. Ejecutar Migraciones

```bash
npm run migrate
```

### 6. Integrar Servicio de Email

En las rutas de autenticación (`routes/auth.js`), agregar:

```javascript
const emailService = require('../services/emailService');

// En el POST /register
router.post('/register', validate('register'), async (req, res, next) => {
  try {
    // ... código existente ...
    
    // AGREGAR ESTO:
    await emailService.sendWelcomeEmail(result.rows[0]);
    
    // ... resto del código
  } catch (error) {
    next(error);
  }
});
```

En las rutas de facturas (`routes/invoices.js`):

```javascript
const emailService = require('../services/emailService');
const cacheService = require('../services/cacheService');

// En el POST /invoices
router.post('/', upload.single('image'), validate('createInvoice'), async (req, res, next) => {
  try {
    // ... código existente ...
    
    // AGREGAR ESTO:
    await emailService.sendInvoiceNotification(result.invoice, 'created');
    cacheService.invalidateUserCache(req.user.id);
    
    // ... resto del código
  } catch (error) {
    next(error);
  }
});
```

### 7. Crear Cron Jobs para Tareas Automáticas

Crear archivo `jobs/emailJobs.js`:

```javascript
const cron = require('node-cron');
const { query } = require('../config/database');
const emailService = require('../services/emailService');

// Recordatorio diario de facturas próximas a vencer
cron.schedule('0 9 * * *', async () => {
  try {
    console.log('🔔 Ejecutando recordatorio de facturas...');
    
    const result = await query(`
      SELECT DISTINCT i.user_id
      FROM invoices i
      WHERE i.payment_type = 'credit'
      AND CURRENT_DATE - i.invoice_date BETWEEN 25 AND 30
    `);

    for (const row of result.rows) {
      const invoices = await query(`
        SELECT * FROM invoices 
        WHERE user_id = $1 
        AND payment_type = 'credit'
        AND CURRENT_DATE - invoice_date BETWEEN 25 AND 30
      `, [row.user_id]);

      if (invoices.rows.length > 0) {
        await emailService.sendDueInvoiceReminder(invoices.rows);
      }
    }

    console.log('✅ Recordatorio enviado');
  } catch (error) {
    console.error('Error en recordatorio:', error);
  }
});

// Reporte mensual
cron.schedule('0 8 1 * *', async () => {
  try {
    console.log('📊 Generando reportes mensuales...');
    
    const users = await query('SELECT * FROM users WHERE is_active = true');

    for (const user of users.rows) {
      const stats = await query(`
        SELECT 
          COUNT(*) as total_invoices,
          SUM(amount) as total_amount,
          AVG(amount) as average_amount
        FROM invoices
        WHERE user_id = $1 AND EXTRACT(MONTH FROM invoice_date) = EXTRACT(MONTH FROM NOW())
      `, [user.id]);

      if (stats.rows[0].total_invoices > 0) {
        await emailService.sendMonthlyReport(user, stats.rows[0]);
      }
    }

    console.log('✅ Reportes enviados');
  } catch (error) {
    console.error('Error en reportes:', error);
  }
});

module.exports = { startJobs: () => console.log('Cron jobs iniciados') };
```

Agregar a `server.js`:

```javascript
const { startJobs } = require('./jobs/emailJobs');

// Después de iniciar el servidor
server.listen(PORT, () => {
  // ...
  startJobs();
});
```

### 8. Instalar node-cron

```bash
npm install node-cron
```

### 9. Actualizar Frontend

Agregar ruta de Admin en `frontend/src/App.jsx`:

```javascript
import { AdminDashboard } from './pages/AdminDashboard'

// En el componente App:
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

Agregar enlace en Navbar si el usuario es admin:

```javascript
// En Navbar.jsx
{user?.is_admin && (
  <Link to="/admin" className="text-gray-600 hover:text-blue-600">
    <BarChart3 className="w-5 h-5" />
    Admin
  </Link>
)}
```

### 10. Agregar Botones de Exportación

En `frontend/src/pages/InvoiceList.jsx`:

```javascript
import { Download } from 'lucide-react'

// Agregar botones:
<button
  onClick={() => window.location.href = '/api/export/invoices/pdf'}
  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded"
>
  <Download className="w-4 h-4" />
  PDF
</button>

<button
  onClick={() => window.location.href = '/api/export/invoices/excel'}
  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"
>
  <Download className="w-4 h-4" />
  Excel
</button>
```

---

## 🧪 Testing

```bash
# Instalar dependencias de testing si no existen
npm install --save-dev jest supertest

# Ejecutar tests
npm test
```

---

## ✅ Checklist de Integración

- [ ] Instalar todas las dependencias
- [ ] Actualizar `.env`
- [ ] Actualizar `server.js`
- [ ] Ejecutar migraciones
- [ ] Integrar servicios de email
- [ ] Crear cron jobs
- [ ] Actualizar frontend
- [ ] Agregar botones de exportación
- [ ] Probar flujos completos
- [ ] Verificar logs

---

## 🔍 Verificación

### 1. Verificar Swagger UI
```
http://localhost:3000/api-docs
```

### 2. Verificar Admin Panel
```
http://localhost:5173/admin
```

### 3. Verificar Exportación
```
GET http://localhost:3000/api/export/invoices/pdf
```

### 4. Verificar Email (Mock)
```javascript
// En tests con nodemailer mock
const nodemailer = require('nodemailer');
nodemailer.createTransport = jest.fn(() => ({
  sendMail: jest.fn().mockResolvedValue({})
}));
```

---

## 📞 Soporte

Si tienes problemas durante la integración:
1. Revisar los logs: `docker-compose logs backend`
2. Consultar documentación: `NUEVAS_CARACTERISTICAS.md`
3. Abrir issue en GitHub
4. Email: soporte@sistemafacturas.com

---

**Última actualización**: 2024-03-26
**Tiempo estimado de integración**: 30-45 minutos

# 📄 Sistema de Gestión de Facturas con OCR

Una solución profesional y escalable para gestionar facturas de crédito y contado, con reconocimiento óptico de caracteres (OCR) automático, reportes avanzados y análisis de datos.

## ✨ Características Principales

### 🎯 Funcionalidades Core
- ✅ **Carga de Facturas** - Sube imágenes o PDFs
- ✅ **OCR Automático** - Extrae datos automáticamente usando Tesseract
- ✅ **Categorización** - Facturas al crédito o contado
- ✅ **Base de Datos** - PostgreSQL con estructura optimizada
- ✅ **API REST** - Endpoints completos y documentados
- ✅ **Autenticación JWT** - Seguridad de nivel empresarial
- ✅ **Reportes Avanzados** - Análisis y estadísticas

### 📊 Reportes y Análisis
- Resumen general de facturas
- Flujo de efectivo
- Análisis de proveedores
- Envejecimiento de deuda (aging)
- Comparación período a período
- Exportación a PDF

### 🔐 Seguridad
- Autenticación basada en JWT
- Encriptación de contraseñas con bcrypt
- Validación de datos con Joi
- Manejo centralizado de errores
- Logs de auditoría

---

## 📋 Requisitos Previos

### Sistema Operativo
- Linux (Ubuntu 18+) o macOS
- Windows con WSL2

### Software Requerido
- **Node.js** >= 14.x
- **npm** >= 6.x
- **PostgreSQL** >= 12.x
- **Git**

### Espacios en Disco
- ~500MB para dependencias
- ~1GB para uploads de facturas

---

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tusuario/sistema-facturas-ocr.git
cd sistema-facturas-ocr
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_facturas
DB_USER=postgres
DB_PASSWORD=tu_contraseña
JWT_SECRET=tu_secreto_muy_seguro
```

### 4. Crear base de datos
```bash
createdb sistema_facturas
```

### 5. Ejecutar migraciones
```bash
npm run migrate
```

### 6. Cargar datos de prueba (opcional)
```bash
npm run seed
```

### 7. Iniciar el servidor
```bash
npm start
# o para desarrollo con auto-reload
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

---

## 📚 Documentación de API

### Autenticación

#### Registro
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "MiContraseña123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "company": "Mi Empresa"
}

Response: { token, user }
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "MiContraseña123"
}

Response: { token, user }
```

### Facturas

#### Crear Factura con OCR
```
POST /api/invoices
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- image: (file)
- provider: "Útiles de Honduras S.A."
- rtn: "0501999510489"
- invoiceNumber: "003-003-01-00217745"
- invoiceDate: "2024-03-24"
- amount: "4878.02"
- paymentType: "credit"
- notes: "Observaciones opcionales"

Response: { invoice, ocrData }
```

#### Obtener Facturas
```
GET /api/invoices?paymentType=credit&limit=50&offset=0
Authorization: Bearer {token}

Response: { data: [...], count }
```

#### Obtener Factura por ID
```
GET /api/invoices/{id}
Authorization: Bearer {token}

Response: { data: {...} }
```

#### Actualizar Factura
```
PUT /api/invoices/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "provider": "Nuevo Proveedor",
  "amount": "5000.00"
}

Response: { data: {...} }
```

#### Eliminar Factura
```
DELETE /api/invoices/{id}
Authorization: Bearer {token}

Response: { success: true, message }
```

### Estadísticas

#### Resumen General
```
GET /api/invoices/stats/summary
Authorization: Bearer {token}

Response: {
  total_invoices: 10,
  credit_invoices: 6,
  cash_invoices: 4,
  total_amount: 50000.00,
  credit_total: 30000.00,
  cash_total: 20000.00,
  average_amount: 5000.00
}
```

#### Top Proveedores
```
GET /api/invoices/stats/top-providers?limit=10
Authorization: Bearer {token}

Response: {
  data: [
    {
      provider: "Útiles de Honduras",
      rtn: "0501999510489",
      invoice_count: 5,
      total_amount: 15000.00,
      average_amount: 3000.00
    }
  ]
}
```

### Reportes

#### Reporte de Resumen
```
GET /api/reports/summary?startDate=2024-01-01&endDate=2024-03-31
Authorization: Bearer {token}

Response: { data: [...] }
```

#### Flujo de Efectivo
```
GET /api/reports/cash-flow?month=3&year=2024
Authorization: Bearer {token}

Response: { data: [...] }
```

#### Análisis de Proveedores
```
GET /api/reports/providers
Authorization: Bearer {token}

Response: { data: [...] }
```

#### Envejecimiento de Deuda
```
GET /api/reports/aging
Authorization: Bearer {token}

Response: {
  data: {
    "Current (0-30 days)": [...],
    "30-60 days": [...],
    "60-90 days": [...],
    "Over 90 days": [...]
  },
  totals: {...},
  totalOutstanding: 0
}
```

---

## 📁 Estructura del Proyecto

```
sistema-facturas-ocr/
├── config/
│   └── database.js                 # Configuración PostgreSQL
├── middleware/
│   ├── auth.js                     # JWT y autenticación
│   ├── errorHandler.js             # Manejo de errores
│   └── validation.js               # Validación con Joi
├── routes/
│   ├── auth.js                     # Rutas de autenticación
│   ├── invoices.js                 # Rutas de facturas (CRUD)
│   ├── providers.js                # Rutas de proveedores
│   ├── reports.js                  # Rutas de reportes
│   └── users.js                    # Rutas de usuarios
├── services/
│   ├── ocr.js                      # Servicio OCR (Tesseract)
│   └── invoiceService.js           # Lógica de negocio
├── migrations/
│   ├── init.sql                    # Schema de BD
│   ├── run.js                      # Script de migraciones
│   └── seed.js                     # Datos de prueba
├── uploads/                        # Archivos subidos por usuarios
├── .env                            # Variables de entorno
├── .env.example                    # Template de .env
├── package.json                    # Dependencias del proyecto
├── server.js                       # Servidor Express principal
└── README.md                       # Esta documentación
```

---

## 🔧 Configuración Avanzada

### Variables de Entorno

```env
# Servidor
NODE_ENV=production                  # development, testing, production
PORT=3000

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_facturas
DB_USER=postgres
DB_PASSWORD=contraseña_segura

# JWT
JWT_SECRET=tu_secreto_muy_seguro_con_caracteres_aleatorios
JWT_EXPIRATION=7d

# Archivos
MAX_FILE_SIZE=10485760              # 10MB en bytes
UPLOAD_DIR=./uploads

# OCR
ENABLE_OCR=true
OCR_LANGUAGE=spa                    # Idioma para OCR

# Email (para notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=contraseña_app

# Reportes
REPORT_FORMAT=pdf
TIMEZONE=America/Tegucigalpa
```

### Uso de Docker (Opcional)

```bash
# Crear archivo docker-compose.yml
docker-compose up -d

# Ejecutar migraciones
docker-compose exec app npm run migrate
```

---

## 🧪 Testing

```bash
# Ejecutar pruebas unitarias
npm test

# Con cobertura
npm run test:coverage

# En modo watch
npm run test:watch
```

---

## 📈 Mejoras Futuras

- [ ] Integración con APIs bancarias
- [ ] Exportación a Excel avanzada
- [ ] Alertas automáticas por email
- [ ] Sincronización con contabilidad
- [ ] App móvil nativa
- [ ] Dashboard en tiempo real
- [ ] Machine Learning para clasificación
- [ ] Reconocimiento de facturas duplicadas

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo licencia MIT - ver archivo LICENSE para detalles.

---

## 📞 Soporte

- **Email**: soporte@sistemafacturas.com
- **Issues**: GitHub Issues
- **Documentación**: https://docs.sistemafacturas.com

---

## 🎉 Créditos

Desarrollado por **Sistema de Facturas** con ❤️

### Tecnologías Usadas
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **Tesseract.js** - OCR
- **JWT** - Autenticación
- **Joi** - Validación

---

**¡Gracias por usar Sistema de Gestión de Facturas!** 🚀

# 📚 Documentación de API - Sistema de Facturas

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.sistemafacturas.com/api
```

## Autenticación

Todas las rutas (excepto Auth) requieren un token JWT en el header:

```bash
Authorization: Bearer <token>
```

---

## 🔐 Autenticación (Auth)

### Registro
```http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "MiContraseña123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "company": "Mi Empresa S.A."
}
```

**Respuesta (201)**
```json
{
  "success": true,
  "message": "Usuario registrado correctamente",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "first_name": "Juan",
    "last_name": "Pérez"
  },
  "token": "eyJhbGc..."
}
```

**Errores**
- `409`: Email ya registrado
- `400`: Validación fallida (contraseña < 8 caracteres)

---

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "MiContraseña123"
}
```

**Respuesta (200)**
```json
{
  "success": true,
  "message": "Login exitoso",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "first_name": "Juan",
    "last_name": "Pérez"
  },
  "token": "eyJhbGc..."
}
```

**Errores**
- `401`: Credenciales inválidas

---

### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <token>
```

**Respuesta (200)**
```json
{
  "success": true,
  "token": "eyJhbGc..."
}
```

---

## 📄 Facturas (Invoices)

### Crear Factura con OCR
```http
POST /invoices
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- image: <archivo> (JPG, PNG o PDF)
- provider: "Útiles de Honduras S.A."
- rtn: "0501999510489"
- invoiceNumber: "003-003-01-00217745"
- invoiceDate: "2024-03-24"
- amount: "4878.02"
- paymentType: "credit"
- notes: "Observaciones opcionales"
```

**Respuesta (201)**
```json
{
  "success": true,
  "message": "Factura creada exitosamente",
  "invoice": {
    "id": "uuid",
    "user_id": "uuid",
    "provider": "Útiles de Honduras S.A.",
    "rtn": "0501999510489",
    "invoice_number": "003-003-01-00217745",
    "invoice_date": "2024-03-24",
    "amount": "4878.02",
    "payment_type": "credit",
    "image_path": "/uploads/invoice-xxx.jpg",
    "notes": "Observaciones",
    "created_at": "2024-03-25T10:30:00Z",
    "updated_at": "2024-03-25T10:30:00Z"
  },
  "ocrData": {
    "provider": "Útiles de Honduras S.A.",
    "rtn": "0501999510489",
    "invoiceNumber": "003-003-01-00217745",
    "amount": "4878.02",
    "invoiceDate": "2024-03-24"
  }
}
```

**Errores**
- `400`: Validación fallida
- `401`: No autenticado
- `413`: Archivo muy grande (> 10MB)

---

### Obtener Todas las Facturas
```http
GET /invoices?paymentType=credit&provider=Útiles&startDate=2024-01-01&endDate=2024-12-31&limit=50&offset=0
Authorization: Bearer <token>
```

**Parámetros Query**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `paymentType` | string | `credit` o `cash` |
| `provider` | string | Nombre del proveedor (búsqueda parcial) |
| `startDate` | date | Formato: YYYY-MM-DD |
| `endDate` | date | Formato: YYYY-MM-DD |
| `limit` | integer | Por defecto: 50 |
| `offset` | integer | Por defecto: 0 |

**Respuesta (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "provider": "Útiles de Honduras S.A.",
      "rtn": "0501999510489",
      "invoice_number": "003-003-01-00217745",
      "invoice_date": "2024-03-24",
      "amount": "4878.02",
      "payment_type": "credit",
      "notes": null,
      "created_at": "2024-03-25T10:30:00Z"
    }
  ],
  "count": 1
}
```

---

### Obtener Factura por ID
```http
GET /invoices/{id}
Authorization: Bearer <token>
```

**Respuesta (200)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "provider": "Útiles de Honduras S.A.",
    "rtn": "0501999510489",
    "invoice_number": "003-003-01-00217745",
    "invoice_date": "2024-03-24",
    "amount": "4878.02",
    "payment_type": "credit",
    "image_path": "/uploads/invoice-xxx.jpg",
    "notes": null,
    "created_at": "2024-03-25T10:30:00Z",
    "updated_at": "2024-03-25T10:30:00Z"
  }
}
```

**Errores**
- `404`: Factura no encontrada

---

### Actualizar Factura
```http
PUT /invoices/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "provider": "Nuevo Proveedor",
  "amount": "5000.00",
  "paymentType": "cash"
}
```

**Respuesta (200)**
```json
{
  "success": true,
  "message": "Factura actualizada",
  "data": { ... }
}
```

---

### Eliminar Factura
```http
DELETE /invoices/{id}
Authorization: Bearer <token>
```

**Respuesta (200)**
```json
{
  "success": true,
  "message": "Factura eliminada"
}
```

---

### Estadísticas Resumen
```http
GET /invoices/stats/summary
Authorization: Bearer <token>
```

**Respuesta (200)**
```json
{
  "success": true,
  "data": {
    "total_invoices": 10,
    "credit_invoices": 6,
    "cash_invoices": 4,
    "total_amount": "50000.00",
    "credit_total": "30000.00",
    "cash_total": "20000.00",
    "average_amount": "5000.00"
  }
}
```

---

### Top Proveedores
```http
GET /invoices/stats/top-providers?limit=10
Authorization: Bearer <token>
```

**Respuesta (200)**
```json
{
  "success": true,
  "data": [
    {
      "provider": "Útiles de Honduras",
      "rtn": "0501999510489",
      "invoice_count": 5,
      "total_amount": "15000.00",
      "average_amount": "3000.00"
    }
  ]
}
```

---

## 👥 Usuarios (Users)

### Obtener Perfil
```http
GET /users/profile
Authorization: Bearer <token>
```

**Respuesta (200)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "company": "Mi Empresa",
    "created_at": "2024-01-15T10:30:00Z",
    "last_login": "2024-03-25T10:30:00Z"
  }
}
```

---

### Actualizar Perfil
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Juan Carlos",
  "lastName": "Pérez López",
  "company": "Nueva Empresa"
}
```

**Respuesta (200)**
```json
{
  "success": true,
  "message": "Perfil actualizado",
  "data": { ... }
}
```

---

### Cambiar Contraseña
```http
PUT /users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "ContraseñaActual123",
  "newPassword": "NuevaContraseña456",
  "confirmPassword": "NuevaContraseña456"
}
```

**Respuesta (200)**
```json
{
  "success": true,
  "message": "Contraseña actualizada correctamente"
}
```

**Errores**
- `400`: Campos incompletos o contraseñas no coinciden
- `401`: Contraseña actual incorrecta

---

### Eliminar Cuenta
```http
DELETE /users/account
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "ContraseñaActual123"
}
```

**Respuesta (200)**
```json
{
  "success": true,
  "message": "Cuenta eliminada"
}
```

---

## 📊 Reportes (Reports)

### Resumen General
```http
GET /reports/summary?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

**Respuesta (200)**
```json
{
  "success": true,
  "data": [
    {
      "month": "2024-03-01T00:00:00Z",
      "payment_type": "credit",
      "count": 5,
      "total_amount": "25000.00",
      "avg_amount": "5000.00"
    }
  ]
}
```

---

### Flujo de Efectivo
```http
GET /reports/cash-flow?month=3&year=2024
Authorization: Bearer <token>
```

**Respuesta (200)**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-03-01T00:00:00Z",
      "payment_type": "credit",
      "transactions": 2,
      "amount": "10000.00"
    }
  ]
}
```

---

### Análisis de Proveedores
```http
GET /reports/providers
Authorization: Bearer <token>
```

**Respuesta (200)**
```json
{
  "success": true,
  "data": [
    {
      "provider": "Útiles de Honduras",
      "rtn": "0501999510489",
      "invoice_count": 5,
      "total_amount": "15000.00",
      "credit_amount": "10000.00",
      "cash_amount": "5000.00",
      "average_invoice": "3000.00",
      "first_invoice_date": "2024-01-15",
      "last_invoice_date": "2024-03-20"
    }
  ]
}
```

---

### Envejecimiento de Deuda (Aging)
```http
GET /reports/aging
Authorization: Bearer <token>
```

**Respuesta (200)**
```json
{
  "success": true,
  "data": {
    "Current (0-30 days)": [
      {
        "provider": "Proveedor A",
        "invoice_number": "001-001-01-00000001",
        "invoice_date": "2024-03-20",
        "amount": "1000.00",
        "days_outstanding": 5
      }
    ],
    "30-60 days": [...],
    "60-90 days": [...],
    "Over 90 days": [...]
  },
  "totals": {
    "Current (0-30 days)": 1000.00,
    "30-60 days": 0,
    "60-90 days": 0,
    "Over 90 days": 0
  },
  "totalOutstanding": 1000.00
}
```

---

### Comparación Período a Período
```http
GET /reports/comparison?period=month
Authorization: Bearer <token>
```

**Parámetros Query**
| Parámetro | Valores |
|-----------|---------|
| `period` | `month`, `quarter`, `year` |

**Respuesta (200)**
```json
{
  "success": true,
  "data": [
    {
      "period": "2024-03",
      "payment_type": "credit",
      "invoice_count": 5,
      "total_amount": "25000.00",
      "avg_amount": "5000.00"
    }
  ],
  "period": "month"
}
```

---

## 👨‍💼 Proveedores (Providers)

### Obtener Todos los Proveedores
```http
GET /providers
Authorization: Bearer <token>
```

**Respuesta (200)**
```json
{
  "success": true,
  "data": [
    {
      "provider": "Útiles de Honduras S.A.",
      "rtn": "0501999510489"
    }
  ],
  "count": 1
}
```

---

### Obtener Detalles de Proveedor
```http
GET /providers/{rtn}
Authorization: Bearer <token>
```

**Respuesta (200)**
```json
{
  "success": true,
  "data": {
    "provider": "Útiles de Honduras S.A.",
    "rtn": "0501999510489",
    "total_invoices": 5,
    "total_amount": "15000.00",
    "credit_amount": "10000.00",
    "cash_amount": "5000.00",
    "average_amount": "3000.00",
    "first_invoice_date": "2024-01-15",
    "last_invoice_date": "2024-03-20"
  }
}
```

---

### Obtener Facturas de un Proveedor
```http
GET /providers/{rtn}/invoices
Authorization: Bearer <token>
```

**Respuesta (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "invoice_number": "003-003-01-00217745",
      "invoice_date": "2024-03-24",
      "amount": "4878.02",
      "payment_type": "credit"
    }
  ],
  "count": 1
}
```

---

## ⚠️ Códigos de Error

| Código | Significado | Ejemplo |
|--------|-------------|---------|
| `200` | OK | Operación exitosa |
| `201` | Created | Recurso creado |
| `400` | Bad Request | Validación fallida |
| `401` | Unauthorized | Token no válido/expirado |
| `404` | Not Found | Recurso no existe |
| `409` | Conflict | Email duplicado |
| `413` | Payload Too Large | Archivo > 10MB |
| `500` | Server Error | Error interno |

---

## 🔄 Rate Limiting

No hay límites de rate actualmente, pero se recomienda no exceder:
- 100 requests por minuto
- 1000 requests por hora

---

## 📝 Ejemplos con CURL

### Registro
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "Password123",
    "firstName": "Juan",
    "lastName": "Pérez"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "Password123"
  }'
```

### Crear Factura
```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "image=@factura.jpg" \
  -F "provider=Proveedor A" \
  -F "rtn=0501999510489" \
  -F "invoiceNumber=001-001-01-00000001" \
  -F "invoiceDate=2024-03-25" \
  -F "amount=1000.00" \
  -F "paymentType=credit"
```

### Obtener Facturas
```bash
curl -X GET "http://localhost:3000/api/invoices?paymentType=credit&limit=10" \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 📚 Recursos Adicionales

- **Swagger UI**: http://localhost:3000/api-docs
- **GitHub**: https://github.com/tusuario/sistema-facturas-ocr
- **Soporte**: soporte@sistemafacturas.com

---

**Última actualización**: 2024-03-25
**Versión API**: 1.0.0

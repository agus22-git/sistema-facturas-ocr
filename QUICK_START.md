# ⚡ Guía Rápida de Inicio

**Comienza a usar el Sistema de Gestión de Facturas en 5 minutos**

---

## 🚀 Opción 1: Inicio con Docker (RECOMENDADO)

La forma más rápida y sin dependencias locales.

### Paso 1: Clonar y entrar al directorio
```bash
git clone https://github.com/tusuario/sistema-facturas-ocr.git
cd sistema-facturas-ocr
```

### Paso 2: Iniciar todo con Docker Compose
```bash
docker-compose up -d
```

### Paso 3: Ejecutar migraciones
```bash
docker-compose exec backend npm run migrate
```

### Paso 4: Cargar datos de prueba
```bash
docker-compose exec backend npm run seed
```

### Paso 5: Acceder a la aplicación
```
Frontend:  http://localhost:5173
Backend:   http://localhost:3000
API Docs:  http://localhost:3000/api-docs (Swagger)
```

### Credenciales de Prueba
```
Email:    usuario@prueba.com
Contraseña: Password123
```

**¡Listo!** El sistema está funcionando completamente. 🎉

---

## 💻 Opción 2: Inicio Local (Sin Docker)

### Requisitos Previos
- Node.js 18+
- PostgreSQL 12+
- Git

### Paso 1: Clonar repositorio
```bash
git clone https://github.com/tusuario/sistema-facturas-ocr.git
cd sistema-facturas-ocr
```

### Paso 2: Configurar Backend

```bash
# Copiar variables de entorno
cp .env.example .env

# Instalar dependencias del backend
npm install

# Crear base de datos PostgreSQL
createdb sistema_facturas

# Ejecutar migraciones
npm run migrate

# Cargar datos de prueba
npm run seed

# Iniciar backend en otra terminal
npm run dev
```

El backend estará en: `http://localhost:3000`

### Paso 3: Configurar Frontend

```bash
# En otra terminal, entrar a frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar frontend
npm run dev
```

El frontend estará en: `http://localhost:5173`

---

## 📝 Primeros Pasos en la Aplicación

### 1. Login
```
Accede a: http://localhost:5173
Email: usuario@prueba.com
Contraseña: Password123
```

### 2. Ver Dashboard
- Verás estadísticas generales
- Últimas facturas
- Top proveedores

### 3. Crear tu Primera Factura
1. Click en "Nueva Factura"
2. Sube una imagen o PDF de una factura
3. El OCR extrae automáticamente:
   - Proveedor
   - RTN
   - Número de factura
   - Fecha
   - Monto
4. Edita si es necesario
5. Selecciona tipo de pago (Crédito/Contado)
6. Click en "Guardar Factura"

### 4. Explorar Listado
- Ve a "Facturas" en el menú
- Filtra por tipo, proveedor, fechas
- Edita o elimina facturas

### 5. Ver Reportes
- Ve a "Reportes"
- Selecciona el tipo de reporte
- Aplica filtros
- Descarga en PDF

---

## 🛠️ Comandos Útiles

### Backend

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start

# Ejecutar migraciones
npm run migrate

# Cargar datos de prueba
npm run seed

# Ejecutar tests
npm test

# Tests con cobertura
npm run test:coverage
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de build
npm run preview

# Lint del código
npm run lint

# Formatear código
npm run format
```

### Docker

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reconstruir imágenes
docker-compose build

# Ejecutar comando en contenedor
docker-compose exec backend npm run migrate
```

---

## 🔗 Links Importantes

| Link | Descripción |
|------|-------------|
| http://localhost:5173 | Frontend React |
| http://localhost:3000 | Backend API |
| http://localhost:3000/health | Health check |
| http://localhost:3000/api-docs | Swagger UI |
| localhost:5432 | PostgreSQL |

---

## 📚 Documentación

| Archivo | Contenido |
|---------|-----------|
| `README.md` | Documentación principal |
| `API_DOCUMENTATION.md` | Endpoints API detallados |
| `DEPLOYMENT.md` | Guía de deployment |
| `PROYECTO_COMPLETO.md` | Resumen completo del proyecto |
| `.env.example` | Variables de entorno |

---

## 🆘 Solución de Problemas

### "Connection refused" a la BD
```bash
# Verificar que PostgreSQL está corriendo
sudo service postgresql status

# O si usas Docker Compose
docker-compose ps
```

### OCR no funciona
```bash
# Verificar que Tesseract está instalado
tesseract --version

# Si no está instalado:
# Ubuntu/Debian: sudo apt-get install tesseract-ocr
# macOS: brew install tesseract
# Windows: Descargar de https://github.com/UB-Mannheim/tesseract/wiki
```

### Puerto ya está en uso
```bash
# Cambiar puerto en .env
PORT=3001  # o el puerto que desees

# Para frontend, ver en vite.config.js
```

### Base de datos no existe
```bash
# Crear manualmente
createdb sistema_facturas

# Luego ejecutar migraciones
npm run migrate
```

### Eliminar todo y empezar de cero (Docker)
```bash
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

---

## 🎯 Próximos Pasos Recomendados

1. **Explorar el Dashboard**
   - Ver estadísticas
   - Entender la interfaz

2. **Crear Facturas de Prueba**
   - Subir imágenes reales
   - Probar OCR
   - Categorizar

3. **Leer Documentación**
   - `API_DOCUMENTATION.md` para endpoints
   - `DEPLOYMENT.md` para deploy

4. **Personalizar**
   - Cambiar colores en `frontend/src/index.css`
   - Modificar variables en `.env`
   - Agregar más funcionalidades

5. **Deployar**
   - Seguir guía en `DEPLOYMENT.md`
   - Elegir plataforma (AWS, Heroku, DigitalOcean)

---

## 📞 Necesitas Ayuda?

- 📧 Email: soporte@sistemafacturas.com
- 🐛 Issues: https://github.com/tusuario/sistema-facturas-ocr/issues
- 📖 Docs: https://docs.sistemafacturas.com

---

## ✅ Checklist de Primeros Pasos

- [ ] Clonaste el repositorio
- [ ] Iniciaste Docker Compose (o instalaste localmente)
- [ ] Ejecutaste migraciones
- [ ] Cargaste datos de prueba
- [ ] Accediste al frontend
- [ ] Hiciste login con credenciales de prueba
- [ ] Creaste una nueva factura
- [ ] Viste los reportes
- [ ] Leíste la documentación
- [ ] Entiendes la arquitectura

---

**¡Felicidades!** Ya tienes el Sistema de Gestión de Facturas con OCR en funcionamiento. 🎉

---

*Última actualización: 2024-03-25*
*Versión: 1.0.0*

# 🚀 Guía de Deployment

## Índice
1. [Deployment Local con Docker](#deployment-local-con-docker)
2. [Deployment en Producción](#deployment-en-producción)
3. [AWS](#aws-amazon-web-services)
4. [Heroku](#heroku)
5. [DigitalOcean](#digitalocean)
6. [Troubleshooting](#troubleshooting)

---

## Deployment Local con Docker

### Requisitos
- Docker >= 20.x
- Docker Compose >= 2.x

### Pasos

1. **Clonar repositorio**
```bash
git clone https://github.com/tusuario/sistema-facturas-ocr.git
cd sistema-facturas-ocr
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con valores locales
```

3. **Iniciar servicios**
```bash
docker-compose up -d
```

4. **Ejecutar migraciones**
```bash
docker-compose exec backend npm run migrate
```

5. **Cargar datos de prueba (opcional)**
```bash
docker-compose exec backend npm run seed
```

6. **Acceder a la aplicación**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

### Logs
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
```

### Detener servicios
```bash
docker-compose down

# Con volúmenes
docker-compose down -v
```

---

## Deployment en Producción

### Checklist

- [ ] Variables de entorno en `.env.production`
- [ ] JWT_SECRET único y seguro
- [ ] Base de datos respaldada
- [ ] SSL/TLS configurado
- [ ] Backups automáticos habilitados
- [ ] Monitoreo configurado
- [ ] CORS configurado correctamente

### Configuración de Producción

**`.env.production`**
```env
NODE_ENV=production
PORT=3000
DB_HOST=db.servidor.com
DB_NAME=sistema_facturas_prod
DB_USER=app_user
DB_PASSWORD=contraseña_fuerte_aleatoria
JWT_SECRET=secreto_unico_y_largo
FRONTEND_URL=https://app.tudominio.com
ENABLE_OCR=true
```

### Nginx (Reverse Proxy)

```bash
# Usar con perfil de producción
docker-compose --profile production up -d
```

### SSL/TLS con Certbot

```bash
# Obtener certificado
certbot certonly --standalone -d app.tudominio.com

# Renovación automática
certbot renew --quiet --no-eff-email
```

---

## AWS (Amazon Web Services)

### Usando Elastic Beanstalk

1. **Instalar EB CLI**
```bash
pip install awsebcli
```

2. **Inicializar aplicación**
```bash
eb init -p node.js-18 sistema-facturas
eb create sistema-facturas-env
```

3. **Configurar base de datos RDS**
```bash
eb setenv \
  DB_HOST=sistema-facturas-db.xxxxx.us-east-1.rds.amazonaws.com \
  DB_USER=postgres \
  DB_PASSWORD=secure_password \
  DB_NAME=sistema_facturas
```

4. **Configurar S3 para uploads**
```bash
# En la aplicación, cambiar configuración de almacenamiento
# Usar AWS SDK para S3 en lugar de sistema de archivos
```

5. **Deploy**
```bash
eb deploy
```

### Usando ECS + Fargate

1. **Crear repositorio ECR**
```bash
aws ecr create-repository --repository-name sistema-facturas
```

2. **Construir y pushear imagen**
```bash
docker build -t sistema-facturas:latest .
docker tag sistema-facturas:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/sistema-facturas:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/sistema-facturas:latest
```

3. **Crear tarea ECS** (via AWS Console o CLI)
   - Usar imagen del ECR
   - Asignar 512 MB de memoria
   - Configurar variables de entorno

---

## Heroku

### Pasos

1. **Instalar Heroku CLI**
```bash
curl https://cli.heroku.com/install.sh | sh
```

2. **Login a Heroku**
```bash
heroku login
```

3. **Crear aplicación**
```bash
heroku create sistema-facturas
```

4. **Agregar PostgreSQL**
```bash
heroku addons:create heroku-postgresql:standard-0
```

5. **Configurar variables de entorno**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu_secreto_seguro
```

6. **Deploy**
```bash
git push heroku main
```

7. **Ejecutar migraciones**
```bash
heroku run npm run migrate
```

---

## DigitalOcean

### Usando App Platform

1. **Conectar repositorio GitHub**
   - Ir a https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Seleccionar repositorio

2. **Configurar servicio web**
   - **Build Command**: `npm install`
   - **Run Command**: `node server.js`
   - **HTTP Port**: 3000

3. **Agregar base de datos PostgreSQL**
   - Crear nueva base de datos
   - Conectar al servicio web

4. **Configurar variables de entorno**
   ```
   NODE_ENV=production
   DB_HOST=${db.HOSTNAME}
   DB_PORT=${db.PORT}
   DB_NAME=${db.DATABASE}
   DB_USER=${db.USERNAME}
   DB_PASSWORD=${db.PASSWORD}
   JWT_SECRET=tu_secreto_seguro
   ```

5. **Deploy automático**
   - Cada push a main dispara deploy automático

### Usando Droplet + Docker

1. **Crear Droplet**
   - Ubuntu 22.04 LTS
   - 2GB RAM, 2 CPU cores

2. **Instalar Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

3. **Clonar código**
```bash
git clone https://github.com/tusuario/sistema-facturas-ocr.git
cd sistema-facturas-ocr
```

4. **Configurar `.env`**
```bash
cp .env.example .env
nano .env  # editar valores
```

5. **Iniciar con Docker Compose**
```bash
docker-compose -f docker-compose.yml up -d
```

6. **Configurar Firewall**
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

7. **Configurar SSL con Let's Encrypt**
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d app.tudominio.com
```

---

## Monitoreo y Logs

### PM2 (Sin Docker)

```bash
npm install -g pm2

pm2 start server.js --name "sistema-facturas"
pm2 startup
pm2 save

# Logs
pm2 logs sistema-facturas
pm2 monit
```

### Docker Health Checks

Los contenedores tienen health checks configurados:
```bash
docker ps --no-trunc
```

### Logging centralizado

```bash
# Con ELK Stack (Elasticsearch, Logstash, Kibana)
docker-compose up -d elasticsearch logstash kibana
```

---

## Backups

### PostgreSQL

```bash
# Backup manual
docker-compose exec postgres pg_dump -U postgres sistema_facturas > backup.sql

# Restaurar
docker-compose exec -T postgres psql -U postgres sistema_facturas < backup.sql

# Backup automático diario
0 2 * * * docker-compose exec -T postgres pg_dump -U postgres sistema_facturas > /backups/$(date +\%Y\%m\%d).sql
```

### Uploads

```bash
# Sincronizar con S3
aws s3 sync ./uploads s3://mi-bucket/uploads --delete
```

---

## Troubleshooting

### Problema: "Connection refused"

```bash
# Verificar que todos los servicios estén corriendo
docker-compose ps

# Reiniciar servicios
docker-compose restart

# Ver logs
docker-compose logs backend
```

### Problema: "Out of memory"

```bash
# Aumentar límite en docker-compose.yml
services:
  backend:
    environment:
      NODE_OPTIONS: "--max-old-space-size=4096"
```

### Problema: "Database connection timeout"

```bash
# Verificar conectividad
docker-compose exec backend curl http://postgres:5432

# Ver logs de PostgreSQL
docker-compose logs postgres
```

### Problema: OCR no funciona

```bash
# Verificar que Tesseract está instalado
docker-compose exec backend which tesseract

# Instalar si es necesario
apt-get install tesseract-ocr
```

---

## Performance Tuning

### PostgreSQL
```sql
-- Configurar connection pooling (pgBouncer)
-- Aumentar trabajo_mem para queries grandes
-- Crear índices en columnas frecuentemente consultadas
```

### Node.js
```bash
# Usar cluster mode con PM2
pm2 start server.js -i max --name "sistema-facturas"

# Aumentar límite de file descriptors
ulimit -n 65536
```

### Frontend
```bash
# Comprimir assets con gzip
gzip -r dist/

# Usar CDN para assets estáticos
```

---

## Actualización

```bash
# Pull última versión
git pull origin main

# Reconstruir imágenes
docker-compose build

# Redeploy
docker-compose up -d

# Ejecutar migraciones si hay cambios de BD
docker-compose exec backend npm run migrate
```

---

## Rollback

```bash
# Volver a versión anterior
git checkout <commit-hash>

# Reconstruir y redeploy
docker-compose up -d --build

# O usar docker image tags
docker-compose pull && docker-compose up -d
```

---

¿Necesitas ayuda con alguna plataforma específica? 🚀

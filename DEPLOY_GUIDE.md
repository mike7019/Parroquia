# 🚀 Guía de Despliegue - API Parroquia

Esta guía te ayudará a desplegar la API de gestión de parroquia en diferentes entornos.

## 📋 Requisitos Previos

### Sistema
- Node.js 18+ 
- PostgreSQL 12+
- Git
- PM2 (para producción)

### Variables de Entorno
Asegúrate de tener configurados los archivos `.env` correspondientes:
- `.env.development` - Para desarrollo
- `.env.production` - Para producción

## ⚡ Configuración Rápida

### 1. Clonar el Repositorio
```bash
git clone https://github.com/mike7019/Parroquia.git
cd Parroquia
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Base de Datos
```bash
# Crear base de datos
npm run db:create

# Ejecutar migraciones
npm run db:migrate

# Cargar datos iniciales
npm run db:seed
npm run db:load-catalogs
```

## 🔧 Despliegue en Desarrollo

### Opción 1: Desarrollo Local
```bash
# Copiar archivo de configuración de desarrollo
cp .env.development .env

# Iniciar en modo desarrollo
npm run dev
```

### Opción 2: Con Docker
```bash
# Iniciar base de datos con Docker
npm run docker:db

# O iniciar toda la aplicación con Docker
npm run docker:dev
```

### Opción 3: Con HTTPS Local
```bash
# Generar certificados SSL
npm run ssl:create

# Iniciar con HTTPS
npm run dev:https
```

**La aplicación estará disponible en:**
- HTTP: `http://localhost:3000`
- HTTPS: `https://localhost:3443`
- Swagger: `http://localhost:3000/api-docs`

## 🚀 Despliegue en Producción

### Preparación del Servidor

#### 1. Instalar Dependencias del Sistema
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm postgresql postgresql-contrib nginx git

# CentOS/RHEL
sudo yum install -y nodejs npm postgresql postgresql-server nginx git
```

#### 2. Configurar PostgreSQL
```bash
# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear usuario y base de datos
sudo -u postgres psql
CREATE USER parroquia_user WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE parroquia_db OWNER parroquia_user;
GRANT ALL PRIVILEGES ON DATABASE parroquia_db TO parroquia_user;
\q
```

#### 3. Instalar PM2 (Gestor de Procesos)
```bash
sudo npm install -g pm2
```

### Proceso de Deploy

#### 1. Clonar y Configurar el Proyecto
```bash
# Clonar en el servidor
cd /var/www
sudo git clone https://github.com/mike7019/Parroquia.git
sudo chown -R $USER:$USER /var/www/Parroquia
cd Parroquia

# Instalar dependencias
npm install --production

# Configurar variables de entorno
cp .env.example .env.production
nano .env.production
```

#### 2. Configurar `.env.production`
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parroquia_db
DB_USER=parroquia_user
DB_PASSWORD=tu_password_seguro
JWT_SECRET=tu_jwt_secret_muy_seguro
CORS_ORIGIN=https://tu-dominio.com
```

#### 3. Preparar Base de Datos
```bash
# Ejecutar migraciones
npm run db:migrate

# Cargar datos iniciales
npm run db:seed
npm run db:load-catalogs

# Crear usuario administrador
npm run admin:create
```

#### 4. Configurar PM2
```bash
# Iniciar aplicación con PM2
pm2 start src/app.js --name "parroquia-api"

# Configurar para inicio automático
pm2 startup
pm2 save
```

#### 5. Configurar Nginx (Proxy Reverso)
```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/parroquia-api
```

Contenido del archivo de configuración:
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/parroquia-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Configurar SSL con Let's Encrypt
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Configurar renovación automática
sudo crontab -e
# Agregar esta línea:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🤖 Despliegue Automatizado

### Usando el Script de Deploy
El proyecto incluye scripts automatizados:

```bash
# Para Linux/Mac
chmod +x deploy.sh
./deploy.sh

# Para Windows
.\deploy.ps1
```

### Verificación Pre-Deploy
```bash
# Verificar configuración antes del deploy
npm run deploy:check
```

### Deploy a Producción
```bash
# Deploy completo
npm run deploy:prod
```

## 🐳 Despliegue con Docker

### Producción con Docker
```bash
# Construir imagen
docker build -t parroquia-api .

# Ejecutar con docker-compose
docker-compose -f docker-compose.yml up -d

# Ver logs
docker-compose logs -f
```

### Docker en Producción
```bash
# Crear network
docker network create parroquia-network

# Ejecutar PostgreSQL
docker run -d \
  --name parroquia-postgres \
  --network parroquia-network \
  -e POSTGRES_DB=parroquia_db \
  -e POSTGRES_USER=parroquia_user \
  -e POSTGRES_PASSWORD=tu_password \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15

# Ejecutar API
docker run -d \
  --name parroquia-api \
  --network parroquia-network \
  -p 3000:3000 \
  --env-file .env.production \
  parroquia-api
```

## 🔧 Mantenimiento y Monitoreo

### Comandos Útiles de PM2
```bash
# Ver estado de procesos
pm2 status

# Ver logs en tiempo real
pm2 logs parroquia-api

# Reiniciar aplicación
pm2 restart parroquia-api

# Detener aplicación
pm2 stop parroquia-api

# Eliminar proceso
pm2 delete parroquia-api

# Ver métricas
pm2 monit
```

### Backup de Base de Datos
```bash
# Crear backup
pg_dump -h localhost -U parroquia_user parroquia_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
psql -h localhost -U parroquia_user parroquia_db < backup_file.sql
```

### Logs de la Aplicación
```bash
# Ver logs de la aplicación
tail -f logs/app.log

# Ver logs de error
tail -f logs/error.log

# Ver logs de Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🚨 Troubleshooting

### Problemas Comunes

#### Error de Conexión a Base de Datos
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql

# Verificar conexión
psql -h localhost -U parroquia_user -d parroquia_db
```

#### Aplicación No Responde
```bash
# Verificar proceso
pm2 status

# Reiniciar aplicación
pm2 restart parroquia-api

# Ver logs de error
pm2 logs parroquia-api --err
```

#### Problemas de Permisos
```bash
# Verificar propiedad de archivos
ls -la /var/www/Parroquia

# Corregir permisos
sudo chown -R www-data:www-data /var/www/Parroquia
sudo chmod -R 755 /var/www/Parroquia
```

### Verificar Estado del Sistema
```bash
# Estado de servicios
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Uso de recursos
top
df -h
free -h
```

## 📌 URLs Importantes

- **API Base:** `https://tu-dominio.com/api`
- **Documentación:** `https://tu-dominio.com/api-docs`
- **Health Check:** `https://tu-dominio.com/api/health`
- **Admin Panel:** `https://tu-dominio.com/admin`

## 📞 Soporte

Para más información, consulta:
- [README.md](./README.md)
- [Documentación específica de deploy](./docs/)
- Repositorio: https://github.com/mike7019/Parroquia

---
**¡Deploy exitoso! 🎉**
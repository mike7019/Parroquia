# 🐧 Guía de Despliegue para Linux

## Parroquia API - Despliegue con Docker en Linux

Esta guía te ayudará a desplegar la aplicación Parroquia API usando Docker en un servidor Linux.

## 📋 Prerrequisitos

### Sistema Operativo Soportado

- **Ubuntu 20.04 LTS** o superior
- **CentOS 8** o superior
- **Debian 10** o superior
- **Red Hat Enterprise Linux 8** o superior

### Software Requerido

- **Docker Engine** (versión 20.10 o superior)
- **Docker Compose** (versión 2.0 o superior)
- **Git** (para clonar el repositorio)
- **curl** (para testing)

## 🛠️ Instalación de Docker

### Ubuntu/Debian

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Agregar clave GPG de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Agregar repositorio de Docker
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar para aplicar cambios
sudo systemctl enable docker
sudo systemctl start docker
```

### CentOS/RHEL

```bash
# Instalar dependencias
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

# Agregar repositorio de Docker
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Instalar Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Iniciar y habilitar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
```

### Verificar Instalación

```bash
# Cerrar sesión y volver a iniciar sesión, luego verificar:
docker --version
docker compose version

# Test de funcionamiento
docker run hello-world
```

## 🚀 Despliegue en Servidor (206.62.139.11)

### 1. Preparar el Servidor

```bash
# Conectar al servidor
ssh root@206.62.139.11

# Crear usuario para la aplicación (recomendado)
sudo useradd -m -s /bin/bash parroquia
sudo usermod -aG docker parroquia
sudo su - parroquia
```

### 2. Clonar el Repositorio

```bash
# Clonar proyecto
git clone https://github.com/mike7019/Parroquia.git
cd Parroquia

# Dar permisos de ejecución al script
chmod +x scripts/deployment/deploy.sh
```

### 3. Configurar Variables de Entorno en .bashrc

```bash
# Editar archivo .bashrc para agregar variables de entorno
nano ~/.bashrc

# Verificar configuración de variables de entorno
./scripts/deployment/check-environment.sh
```

**Configuración para servidor de producción:**

```bash
# Variables de entorno para .bashrc - AGREGAR AL FINAL del archivo ~/.bashrc

# Configuración de la aplicación
export NODE_ENV=production
export PORT=3000
export VERBOSE_LOGGING=true

# Configuración de base de datos
export DB_HOST=postgres
export DB_PORT=5432
export DB_NAME=parroquia_db
export DB_USER=parroquia_user
export DB_PASS=UnPasswordMuySeguro123!

# Configuración de seguridad - CAMBIAR EN PRODUCCIÓN
export BCRYPT_ROUNDS=12
export JWT_SECRET=jwt_secret_super_seguro_para_produccion_123456789
export JWT_REFRESH_SECRET=refresh_secret_super_seguro_para_produccion_987654321
export JWT_EXPIRES_IN=15m
export JWT_REFRESH_EXPIRES_IN=7d

# Configuración del frontend
export FRONTEND_URL=http://206.62.139.11:3000

# Configuración de email (SMTP)
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=tu_email@gmail.com
export SMTP_PASS=tu_app_password_de_gmail
export EMAIL_FROM=noreply@parroquia.com
export SMTP_FROM_EMAIL=noreply@parroquia.com
export SEND_REAL_EMAILS=true

# Después de agregar las variables, ejecutar:
# source ~/.bashrc
```

### 5. Ejecutar Script de Despliegue

### 4. Verificar Variables de Entorno

```bash
# Recargar variables de entorno
source ~/.bashrc

# Verificar que las variables están cargadas
echo "NODE_ENV: $NODE_ENV"
echo "DB_HOST: $DB_HOST"  
echo "JWT_SECRET configurado: $(if [ -n "$JWT_SECRET" ]; then echo "✓"; else echo "✗"; fi)"

# Ejecutar script de verificación completa
./scripts/deployment/check-environment.sh

# Ejecutar pre-deploy para verificación completa
./scripts/deployment/pre-deploy.sh
```

./scripts/deployment/deploy.sh

# NOTA: Si es la primera vez, también puedes usar:

chmod +x scripts/deployment/deploy.sh && ./scripts/deployment/deploy.sh

```bash
# Ejecutar script de despliegue
./scripts/deployment/deploy.sh
```

El script realizará automáticamente:

- ✅ Verificación de Docker
- ✅ Construcción de imágenes
- ✅ Inicio de servicios
- ✅ Migraciones de base de datos
- ✅ Carga de datos de catálogo
- ✅ Configuración inicial

## 🔧 Verificación del Despliegue

### Health Checks

```bash
# Verificar estado de contenedores
docker compose ps

# Test de conectividad
curl -I http://localhost:3000/api/health
curl -I http://206.62.139.11:3000/api/health

# Verificar respuesta JSON
curl http://localhost:3000/api/health | jq
```

## 🔗 URLs de Acceso

Una vez desplegado exitosamente:

- **🌐 API Base:** http://206.62.139.11:3000/api
- **📚 Documentación:** http://206.62.139.11:3000/api-docs
- **💚 Health Check:** http://206.62.139.11:3000/api/health

## 🔄 Comandos Útiles de Administración

```bash
# Ver estado de servicios
docker compose ps

# Reiniciar aplicación
docker compose restart api

# Detener todos los servicios
docker compose down

# Iniciar servicios
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f

# Ver uso de recursos
docker stats

# Limpiar recursos no utilizados
docker system prune -f
```

### Backup de Base de Datos

```bash
# Crear backup
docker compose exec postgres pg_dump -U parroquia_user parroquia_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
cat backup_20250128_120000.sql | docker compose exec -T postgres psql -U parroquia_user parroquia_db

# Crear directorio para backups
mkdir -p /home/parroquia/backups

# Backup automatizado (agregar a crontab)
echo "0 2 * * * cd /home/parroquia/Parroquia && docker compose exec postgres pg_dump -U parroquia_user parroquia_db > /home/parroquia/backups/backup_\$(date +\%Y\%m\%d_\%H\%M\%S).sql" | crontab -

# Verificar crontab
crontab -l
```

## 🚨 Solución de Problemas

### Problema: Contenedores no inician

```bash
# Verificar logs
docker compose logs

# Verificar configuración
docker compose config

# Limpiar y reiniciar
docker compose down
docker system prune -f
docker compose up -d
```

### Problema: Error de autenticación SASL

**Error:** `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`

**Solución:**

```bash
# 1. Verificar variables de entorno en el contenedor
docker compose exec api env | grep -E "(DB_|SMTP_|EMAIL_)"

# 2. Verificar que DB_PASS esté configurado (no DB_PASSWORD)
# En el archivo .env debe ser DB_PASS, no DB_PASSWORD
grep DB_PASS .env

# 3. Si falta DB_PASS o hay inconsistencias, corregir:
echo "DB_PASS=UnPasswordMuySeguro123!" >> .env

# 4. Verificar que todas las variables SMTP estén presentes:
grep -E "SMTP_|EMAIL_FROM|SEND_REAL_EMAILS" .env

# 5. Si faltan variables, agregarlas:
echo "SMTP_HOST=smtp.gmail.com" >> .env
echo "SMTP_PORT=587" >> .env
echo "SMTP_USER=tu_email@gmail.com" >> .env
echo "SMTP_PASS=tu_app_password" >> .env
echo "SMTP_FROM_EMAIL=noreply@parroquia.com" >> .env
echo "EMAIL_FROM=noreply@parroquia.com" >> .env
echo "SEND_REAL_EMAILS=true" >> .env

# 6. Reiniciar servicios para cargar nuevas variables
docker compose down
docker compose up -d

# 7. Esperar que los servicios estén listos y ejecutar migraciones
sleep 30
docker compose exec api npm run db:migrate
```

### Problema: Error de conexión a base de datos durante migraciones

**Solución:**

```bash
# Verificar estado de PostgreSQL
docker compose exec postgres pg_isready -U parroquia_user

# Verificar variables de base de datos (usar DB_PASS, no DB_PASSWORD)
docker compose exec api env | grep DB_

# Conectar manualmente para verificar credenciales
docker compose exec postgres psql -U parroquia_user -d parroquia_db

# Si la conexión falla, verificar que DB_PASS esté configurado correctamente
grep DB_PASS .env

# Reiniciar servicios si es necesario
docker compose restart

# Esperar a que PostgreSQL esté completamente listo
echo "Esperando a que PostgreSQL esté listo..."
sleep 30

# Verificar que la base de datos responde
docker compose exec postgres pg_isready -U parroquia_user -d parroquia_db

# Ejecutar migraciones
docker compose exec api npm run db:migrate
```

## 📝 Checklist de Despliegue

- [ ] Docker Engine (20.10+) y Docker Compose (2.0+) instalados
- [ ] Puerto 3000 disponible en el servidor
- [ ] Archivo `.env` configurado con variables correctas:
   - [ ] `DB_PASS` (no `DB_PASSWORD`)
   - [ ] Variables SMTP configuradas
   - [ ] JWT secrets cambiados para producción

- [ ] Firewall configurado para permitir puerto 3000
- [ ] Script `deploy.sh` con permisos de ejecución
- [ ] Script `deploy.sh` ejecutado exitosamente
- [ ] Health check respondiendo 200 OK en `/api/health`
- [ ] Documentación Swagger accesible en `/api-docs`
- [ ] Usuario administrador creado (opcional)
- [ ] Backup inicial configurado
- [ ] Logs de aplicación funcionando correctamente

---

**🎉 ¡Despliegue completado!**

Tu API está lista en:

- **API:** http://206.62.139.11:3000/api
- **Docs:** http://206.62.139.11:3000/api-docs

## 🔒 Próximos Pasos de Seguridad

1. **Configurar HTTPS con Nginx:**

```bash
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com

```

2. **Configurar firewall:**

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3000/tcp  # Solo acceso interno
sudo ufw enable

```

3. **Monitoreo con logs:**

```bash
# Ver logs en tiempo real
docker compose logs -f --tail=100

```
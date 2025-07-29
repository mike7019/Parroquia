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
chmod +x deploy.sh
```

### 3. Configurar Variables de Entorno

```bash
# Crear archivo de configuración
cp .env.example .env

# Editar configuración
nano .env
```

**Configuración para servidor de producción:**

```bash
# Base de datos
DB_HOST=postgres
DB_PORT=5432
DB_NAME=parroquia_db
DB_USER=parroquia_user
DB_PASSWORD=UnPasswordMuySeguro123!

# JWT - CAMBIAR EN PRODUCCIÓN
JWT_SECRET=jwt_secret_super_seguro_para_produccion_123456789
JWT_REFRESH_SECRET=refresh_secret_super_seguro_para_produccion_987654321

# Email para notificaciones
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password

# Configuración del servidor
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Configuración de seguridad
CORS_ORIGIN=http://206.62.139.11:3000
API_BASE_URL=http://206.62.139.11:3000/api
```

### 4. Ejecutar Despliegue Automático

```bash
# Ejecutar script de despliegue
./deploy.sh
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

# Backup automatizado (agregar a crontab)
echo "0 2 * * * cd /home/parroquia/Parroquia && docker compose exec postgres pg_dump -U parroquia_user parroquia_db > /home/parroquia/backups/backup_\$(date +\%Y\%m\%d_\%H\%M\%S).sql" | crontab -
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

## 📝 Checklist de Despliegue

- [ ] Docker y Docker Compose instalados
- [ ] Puerto 3000 disponible
- [ ] Archivo `.env` configurado
- [ ] Firewall configurado
- [ ] Script `deploy.sh` ejecutado exitosamente
- [ ] Health check respondiendo 200 OK
- [ ] Usuario administrador creado
- [ ] Backup inicial realizado

---

**🎉 ¡Despliegue completado!** Tu API está lista en http://206.62.139.11:3000/api
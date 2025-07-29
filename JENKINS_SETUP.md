# Configuración de Jenkins para Despliegue Automatizado

## 📋 Prerrequisitos

### En Jenkins:
1. **Plugins necesarios:**
   - SSH Agent Plugin
   - Git Plugin
   - Pipeline Plugin
   - Credentials Plugin

2. **Credenciales SSH configuradas:**
   - ID: `servidor-produccion-ssh`
   - Tipo: SSH Username with private key
   - Username: `ubuntu` (o tu usuario de servidor)
   - Private Key: Tu clave privada SSH

### En el Servidor (206.62.139.11):
1. **Usuario y permisos:**
   ```bash
   # Crear usuario si no existe
   sudo adduser ubuntu
   sudo usermod -aG docker ubuntu
   sudo usermod -aG sudo ubuntu
   ```

2. **Directorio del proyecto:**
   ```bash
   sudo mkdir -p /home/ubuntu/Parroquia
   sudo chown -R ubuntu:ubuntu /home/ubuntu/Parroquia
   ```

3. **Configuración SSH:**
   ```bash
   # Agregar la clave pública de Jenkins
   mkdir -p ~/.ssh
   echo "TU_CLAVE_PUBLICA_DE_JENKINS" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   ```

## 🚀 Configuración del Pipeline

### Variables de Entorno a Configurar:
- `SERVER_IP`: 206.62.139.11
- `SERVER_USER`: ubuntu
- `PROJECT_PATH`: /home/ubuntu/Parroquia
- `SSH_CREDENTIAL_ID`: servidor-produccion-ssh

### Proceso de Despliegue:
1. **Checkout**: Clona el código desde GitHub
2. **Deploy**: Despliega usando Docker Compose
3. **Health Check**: Verifica que la aplicación esté funcionando

## 🔧 Configuración Inicial en el Servidor

### 1. Clonar el repositorio:
```bash
cd /home/ubuntu
git clone https://github.com/mike7019/Parroquia.git
cd Parroquia
git checkout develop
```

### 2. Configurar variables de entorno:
```bash
# Copiar y editar el archivo de producción
cp .env.production .env
nano .env

# Actualizar las siguientes variables:
DB_PASSWORD=tu_password_seguro_real
JWT_SECRET=tu_jwt_secret_muy_seguro_de_al_menos_32_caracteres
JWT_REFRESH_SECRET=tu_refresh_secret_diferente
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
```

### 3. Primer despliegue manual:
```bash
# Hacer el script ejecutable
chmod +x scripts/setup-production.sh

# Ejecutar setup inicial
./scripts/setup-production.sh

# Construir y levantar los servicios
docker-compose up --build -d

# Verificar que todo esté funcionando
docker-compose ps
curl http://localhost:3000/api/health
```

## 🔍 Verificación del Sistema

### Endpoints de Salud:
- **Health Check**: `GET /api/health`
- **Status Detallado**: `GET /api/status`

### Comandos de Debugging:
```bash
# Ver logs de la aplicación
docker-compose logs -f api

# Ver logs de la base de datos
docker-compose logs -f postgres

# Estado de los contenedores
docker-compose ps

# Recursos del sistema
docker stats

# Verificar conectividad de red
docker network ls
docker network inspect parroquia_parroquia-network
```

## 🚨 Troubleshooting

### Problemas Comunes:

1. **Error de conexión SSH:**
   - Verificar que la clave SSH esté configurada correctamente
   - Comprobar permisos: `chmod 600 ~/.ssh/authorized_keys`

2. **Error de permisos de Docker:**
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Base de datos no se conecta:**
   - Verificar variables en `.env`
   - Comprobar que el contenedor de PostgreSQL esté corriendo

4. **Aplicación no responde:**
   ```bash
   docker-compose logs api
   docker-compose restart api
   ```

5. **Puerto 3000 ocupado:**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 PID_DEL_PROCESO
   ```

## 📊 Monitoreo

### Logs importantes:
- `/home/ubuntu/Parroquia/logs/` (en el host)
- Logs de Docker: `docker-compose logs`

### Métricas del sistema:
```bash
# CPU y memoria
htop

# Espacio en disco
df -h

# Estadísticas de Docker
docker stats
```

## 🔄 Rollback

En caso de fallo, hacer rollback:
```bash
cd /home/ubuntu/Parroquia

# Volver a la versión anterior
git log --oneline -10
git reset --hard COMMIT_ANTERIOR

# Redesplegar
docker-compose down
docker-compose up --build -d
```

## 📝 Configuración Paso a Paso en Jenkins

### 1. Crear un nuevo Pipeline Job:
1. En Jenkins Dashboard → "New Item"
2. Seleccionar "Pipeline"
3. Nombrar: `Parroquia-Production-Deploy`

### 2. Configurar Source Code Management:
- **Repository URL**: `https://github.com/mike7019/Parroquia.git`
- **Branch**: `*/develop`
- **Script Path**: `jenkinsfile`

### 3. Configurar Trigger:
- **GitHub hook trigger for GITScm polling** (para webhook)
- O **Poll SCM**: `H/5 * * * *` (cada 5 minutos)

### 4. Configurar Credenciales SSH:
1. Manage Jenkins → Manage Credentials
2. Add Credentials → SSH Username with private key
3. ID: `servidor-produccion-ssh`
4. Username: `ubuntu`
5. Private Key: Pegar tu clave privada SSH

### 5. Variables de Entorno (si necesitas override):
En la configuración del job, agregar parámetros:
- `SERVER_IP`: 206.62.139.11
- `SERVER_USER`: ubuntu
- `PROJECT_PATH`: /home/ubuntu/Parroquia

## 🎯 Verificación Final

### Test del Pipeline:
1. Hacer un commit en la rama `develop`
2. El pipeline debería ejecutarse automáticamente
3. Verificar en: http://206.62.139.11:3000/api/health

### Logs del Pipeline:
- Ver la consola de Jenkins para debugging
- Logs del servidor: `ssh ubuntu@206.62.139.11 "cd /home/ubuntu/Parroquia && docker-compose logs"`

## 🔐 Seguridad y Mejores Prácticas

### Variables Sensibles:
- Nunca hardcodear passwords en el código
- Usar Jenkins Credentials para secretos
- Variables de entorno en `.env` del servidor

### Backup:
```bash
# Backup de la base de datos
docker-compose exec postgres pg_dump -U parroquia_user parroquia_db > backup_$(date +%Y%m%d).sql

# Backup de volúmenes
docker run --rm -v parroquia_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz -C /data .
```

### Monitoreo de Recursos:
- Configurar alertas para espacio en disco
- Monitorear memoria y CPU del servidor
- Logs de aplicación para errores
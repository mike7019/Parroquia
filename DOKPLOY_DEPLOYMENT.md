# Deployment con Dokploy - Parroquia API

Este documento explica cómo desplegar la API de Parroquia usando **Dokploy**.

##  Prerequisitos

- Cuenta en Dokploy
- Repositorio Git con el código
- Acceso a un servidor o VPS

##  Pasos para el Deployment

### 1. Preparación del Repositorio

Asegúrate de que tu repositorio tenga estos archivos:
-  docker-compose.dokploy.yml (configuración optimizada para Dokploy)
-  Dockerfile (imagen optimizada para producción)
-  .env.dokploy (variables de entorno de ejemplo)

### 2. Configuración en Dokploy

1. **Crear Nueva Aplicación**
   - Ve a tu dashboard de Dokploy
   - Clic en "New Application"
   - Selecciona "Docker Compose"

2. **Configurar Repositorio**
   - Repository URL: https://github.com/mike7019/Parroquia.git
   - Branch: feature (o la rama que prefieras)
   - Docker Compose File: docker-compose.dokploy.yml

3. **Variables de Entorno**
   
   Configura estas variables en Dokploy:

   `
   # Obligatorias - CAMBIAR EN PRODUCCIÓN
   JWT_SECRET=tu_jwt_secret_muy_seguro_de_al_menos_32_caracteres
   JWT_REFRESH_SECRET=tu_refresh_secret_diferente_y_muy_seguro
   DB_PASSWORD=tu_password_de_base_de_datos_muy_seguro
   
   # Recomendadas
   FRONTEND_URL=https://tu-dominio.com
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=tu-app-password
   EMAIL_FROM=noreply@tu-dominio.com
   `

### 3. Configuración de Dominio

1. **En Dokploy:**
   - Ve a la sección "Domains"
   - Agrega tu dominio personalizado
   - Configura SSL automático

2. **Endpoints importantes:**
   - API Base: https://tu-dominio.com/api
   - Documentación: https://tu-dominio.com/api-docs
   - Health Check: https://tu-dominio.com/api/health

### 4. Configuración de Base de Datos

La configuración incluye PostgreSQL automáticamente. Los datos se persistirán en volúmenes de Docker.

**Backup automático:**
- Los backups se configuran automáticamente con Dokploy
- Volumen: postgres_backups

### 5. Monitoreo y Logs

**Ver logs en tiempo real:**
En Dokploy dashboard, ve a la sección "Logs"

**Health Check:**
- URL: https://tu-dominio.com/api/health
- Se ejecuta cada 30 segundos
- Timeout: 10 segundos

##  Seguridad

### Variables Críticas

**NUNCA usar valores por defecto en producción:**
- JWT_SECRET
- JWT_REFRESH_SECRET
- DB_PASSWORD

### Generar secretos seguros:

Para JWT secrets (Node.js):
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

Para passwords de DB:
openssl rand -base64 32

### HTTPS y SSL

Dokploy configura automáticamente:
- Certificados SSL gratuitos (Let's Encrypt)
- Redirección HTTP  HTTPS
- Headers de seguridad (HSTS, etc.)

##  Actualizaciones

Para actualizar la aplicación:
1. Push cambios a la rama configurada
2. Dokploy detectará los cambios automáticamente
3. Se ejecutará un nuevo deployment

O manualmente en Dokploy:
- Ve a tu aplicación
- Clic en "Redeploy"

---

¿Problemas? Revisa los logs en Dokploy o contacta al equipo de desarrollo.

#  Resumen de Configuración para Dokploy

##  Archivos Creados/Optimizados

### 1. **Configuración Principal**
-  docker-compose.dokploy.yml - Configuración optimizada para Dokploy
-  .env.dokploy - Variables de entorno de ejemplo para Dokploy
-  Dockerfile - Actualizado para puerto 5000
-  docker-compose.yml - Actualizado para puerto 5000

### 2. **Documentación**
-  DOKPLOY_DEPLOYMENT.md - Guía completa de deployment
-  DOKPLOY_SETUP_SUMMARY.md - Este archivo

### 3. **Scripts de Verificación**
-  pre-deployment-check.sh - Script bash para verificación
-  pre-deployment-check-simple.ps1 - Script PowerShell simplificado

### 4. **Archivos Actualizados**
-  src/app.js - Puerto 5000 por defecto
-  .env.production - Puerto 5000
-  ecosystem.config.cjs - Puerto 5000
-  nginx.conf - Proxy a puerto 5000
-  nginx.docker.conf - Upstream a puerto 5000

##  Configuración de Dokploy

### 1. **Archivo Docker Compose**
Usar: docker-compose.dokploy.yml

### 2. **Variables de Entorno Críticas**
`
# CAMBIAR OBLIGATORIAMENTE EN PRODUCCIÓN:
JWT_SECRET=tu_jwt_secret_muy_seguro_64_caracteres_minimo
JWT_REFRESH_SECRET=tu_refresh_secret_diferente_64_caracteres
DB_PASSWORD=tu_password_de_base_de_datos_muy_seguro

# CONFIGURAR SEGÚN TU DOMINIO:
FRONTEND_URL=https://tu-dominio.com

# CONFIGURAR SI QUIERES EMAILS:
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
EMAIL_FROM=noreply@tu-dominio.com
`

### 3. **Puertos Expuestos**
- **API**: Puerto 5000
- **PostgreSQL**: Puerto 5432 (interno)

### 4. **Endpoints Importantes**
- **API Base**: https://tu-dominio.com/api
- **Documentación**: https://tu-dominio.com/api-docs
- **Health Check**: https://tu-dominio.com/api/health

##  Pasos para Deployment

### 1. **Preparación Local**
`
# Ejecutar verificación
.\pre-deployment-check-simple.ps1

# Commit y push
git add .
git commit -m "Configuración optimizada para Dokploy - Puerto 5000"
git push origin feature
`

### 2. **Configuración en Dokploy**

1. **Crear Nueva Aplicación**
   - Tipo: Docker Compose
   - Repositorio: https://github.com/mike7019/Parroquia.git
   - Rama: feature
   - Archivo Compose: docker-compose.dokploy.yml

2. **Variables de Entorno**
   - Copiar desde .env.dokploy
   - **CAMBIAR** valores de seguridad
   - Configurar dominio real

3. **Dominio**
   - Configurar dominio personalizado
   - SSL automático (Let's Encrypt)

4. **Deploy**
   - Iniciar deployment
   - Monitorear logs

### 3. **Post-Deployment**

1. **Verificar Health Check**
   `
   https://tu-dominio.com/api/health
   `

2. **Acceder a Documentación**
   `
   https://tu-dominio.com/api-docs
   `

3. **Crear Usuario Admin** (opcional)
   `
   # En la terminal de Dokploy
   docker-compose exec api npm run admin:create
   `

##  Configuraciones Avanzadas

### Escalado

Para escalar la aplicación:
`
# En docker-compose.dokploy.yml
services:
  api:
    deploy:
      replicas: 3  # Múltiples instancias
`

### Performance de PostgreSQL

Ajusta estas variables según tu servidor:
`
POSTGRES_SHARED_BUFFERS=512MB  # Para servidores con más RAM
POSTGRES_MAX_CONNECTIONS=200   # Para más conexiones concurrentes
`

### Rate Limiting

Ajusta los límites según tu tráfico:
`
RATE_LIMIT_WINDOW_MS=900000    # 15 minutos
RATE_LIMIT_MAX_REQUESTS=200    # 200 requests por ventana
`

##  Seguridad

### Variables Críticas que DEBES cambiar:
- JWT_SECRET - Mínimo 64 caracteres aleatorios
- JWT_REFRESH_SECRET - Diferente al JWT_SECRET
- DB_PASSWORD - Password fuerte para PostgreSQL

### Generar secretos seguros:
`
# Para JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Para passwords
openssl rand -base64 32
`

##  Monitoreo

### Logs en Dokploy:
- Dashboard  Tu App  Logs
- Logs en tiempo real
- Filtros por servicio (api, postgres)

### Métricas:
- CPU y RAM usage
- Network traffic
- Health check status

##  Actualizaciones

Para actualizar la aplicación:
1. Push cambios a la rama configurada
2. Dokploy auto-detecta y redespliega
3. O manualmente: Dashboard  Redeploy

##  Soporte

Si hay problemas:
1. Revisar logs en Dokploy
2. Verificar health check: /api/health
3. Verificar variables de entorno
4. Consultar DOKPLOY_DEPLOYMENT.md

---

**Estado**:  Todo configurado para deployment con puerto 5000
**Última actualización**: 2025-08-24 11:32

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Contenido del PDF en Markdown
const content = `# 🐳 Guía de Despliegue con Docker - Parroquia API

## Descripción

**Parroquia API** está completamente containerizada usando Docker Compose, facilitando el despliegue en cualquier entorno de desarrollo, staging o producción.

## Requisitos Previos

- **Docker Engine** 20.10 o superior
- **Docker Compose** 2.0 o superior
- **Git** (para clonar el repositorio)

## Configuración Inicial

### 1. Clonar el Repositorio

\`\`\`bash
git clone <url-del-repositorio>
cd Parroquia
\`\`\`

### 2. Configurar Variables de Entorno

Copia el archivo \`.env.example\` y renómbralo a \`.env\`:

\`\`\`bash
# En Windows PowerShell
Copy-Item .env.example .env

# En Linux/Mac
cp .env.example .env
\`\`\`

### 3. Editar Variables de Entorno

Abre el archivo \`.env\` y configura las siguientes variables críticas:

#### Variables de Base de Datos

\`\`\`env
DB_HOST=postgres          # ⚠️ Usar 'postgres' en Docker, no 'localhost'
DB_PORT=5432
DB_NAME=parroquia_db
DB_USER=parroquia_user
DB_PASSWORD=tu_password_seguro_aqui
\`\`\`

#### Variables JWT (Autenticación)

Genera secrets seguros con el siguiente comando:

\`\`\`bash
openssl rand -base64 32
\`\`\`

\`\`\`env
JWT_SECRET=tu_jwt_secret_minimo_32_caracteres
JWT_REFRESH_SECRET=tu_refresh_secret_diferente_32_caracteres
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
\`\`\`

#### Variables de Email (SMTP)

Para Gmail, debes generar una **App Password**:
1. Ve a tu cuenta de Google
2. Seguridad → Verificación en 2 pasos
3. Contraseñas de aplicaciones
4. Genera una contraseña para "Correo"

\`\`\`env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password_de_16_digitos
EMAIL_FROM=noreply@parroquia.com
\`\`\`

#### Otras Variables

\`\`\`env
NODE_ENV=production
PORT=3000
API_PORT=3000
FRONTEND_URL=http://localhost:3001
CORS_ORIGIN=*
\`\`\`

## Inicio Rápido

### Opción A: Scripts Automatizados

#### En Windows PowerShell

\`\`\`powershell
.\\docker-start.ps1
\`\`\`

Este script:
- ✅ Verifica instalación de Docker
- ✅ Crea \`.env\` si no existe
- ✅ Construye las imágenes
- ✅ Inicia los contenedores
- ✅ Espera a que los servicios estén listos
- ✅ Muestra información de acceso

#### En Linux/Mac

\`\`\`bash
chmod +x docker-start.sh
./docker-start.sh
\`\`\`

### Opción B: Comandos Manuales

\`\`\`bash
# 1. Construir las imágenes
docker-compose build

# 2. Iniciar los servicios en segundo plano
docker-compose up -d

# 3. Ver logs en tiempo real
docker-compose logs -f
\`\`\`

## Acceso a la Aplicación

Una vez iniciados los contenedores, la aplicación estará disponible en:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **API** | http://localhost:3000/api | Endpoints REST |
| **Swagger** | http://localhost:3000/api-docs | Documentación interactiva |
| **Health** | http://localhost:3000/api/health | Estado del servidor |

## Comandos Útiles de Docker

### Ver Estado de los Contenedores

\`\`\`bash
docker-compose ps
\`\`\`

Salida esperada:
\`\`\`
NAME                STATUS              PORTS
parroquia-api       Up (healthy)        0.0.0.0:3000->3000/tcp
parroquia-postgres  Up (healthy)        0.0.0.0:5432->5432/tcp
\`\`\`

### Ver Logs

\`\`\`bash
# Todos los servicios
docker-compose logs -f

# Solo API
docker-compose logs -f api

# Solo PostgreSQL
docker-compose logs -f postgres

# Últimas 100 líneas
docker-compose logs --tail=100 api
\`\`\`

### Reiniciar Servicios

\`\`\`bash
# Reiniciar todos los servicios
docker-compose restart

# Reiniciar solo la API
docker-compose restart api

# Reiniciar solo PostgreSQL
docker-compose restart postgres
\`\`\`

### Detener Servicios

\`\`\`bash
# Detener servicios (mantiene volúmenes)
docker-compose down

# Detener y eliminar volúmenes ⚠️ BORRA LA BASE DE DATOS
docker-compose down -v

# Detener y eliminar todo (imágenes, volúmenes, redes)
docker-compose down -v --rmi all
\`\`\`

## Gestión de Base de Datos

### Acceder al Contenedor de la API

\`\`\`bash
docker-compose exec api sh
\`\`\`

### Ejecutar Migraciones y Seeders

Dentro del contenedor:

\`\`\`bash
# Sincronizar modelos con la base de datos
npm run db:sync:complete

# Cargar datos de catálogo (departamentos, municipios, etc.)
npm run db:seed:config

# Crear usuario administrador
npm run admin:create
\`\`\`

### Backup de PostgreSQL

#### Crear Backup

\`\`\`bash
# Backup completo
docker-compose exec postgres pg_dump -U parroquia_user parroquia_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup solo esquema
docker-compose exec postgres pg_dump -U parroquia_user -s parroquia_db > schema_backup.sql

# Backup solo datos
docker-compose exec postgres pg_dump -U parroquia_user -a parroquia_db > data_backup.sql
\`\`\`

#### Restaurar Backup

\`\`\`bash
# Restaurar backup completo
docker-compose exec -T postgres psql -U parroquia_user parroquia_db < backup_20250120_143000.sql

# Restaurar desde archivo comprimido
gunzip -c backup.sql.gz | docker-compose exec -T postgres psql -U parroquia_user parroquia_db
\`\`\`

### Conectar Directamente a PostgreSQL

\`\`\`bash
# Usando psql dentro del contenedor
docker-compose exec postgres psql -U parroquia_user -d parroquia_db

# Comandos útiles de psql:
# \\dt              - Listar tablas
# \\d+ tablename    - Describir tabla
# \\q              - Salir
\`\`\`

### Usando Cliente Externo (DBeaver, pgAdmin)

Configuración de conexión:
- **Host**: localhost
- **Port**: 5432
- **Database**: parroquia_db
- **Username**: parroquia_user
- **Password**: (el configurado en .env)

## Troubleshooting

### Problema: El contenedor de la API no inicia

**Síntomas:**
- Estado "Restarting" o "Exited"
- No responde en http://localhost:3000

**Soluciones:**

1. **Ver logs detallados:**
   \`\`\`bash
   docker-compose logs api
   \`\`\`

2. **Verificar que PostgreSQL esté healthy:**
   \`\`\`bash
   docker-compose ps postgres
   \`\`\`

3. **Verificar variables de entorno:**
   \`\`\`bash
   docker-compose config
   \`\`\`

4. **Reconstruir imagen:**
   \`\`\`bash
   docker-compose build --no-cache api
   docker-compose up -d
   \`\`\`

### Problema: Error de conexión a la base de datos

**Síntomas:**
- Error "ECONNREFUSED" en logs
- "Unable to connect to database"

**Soluciones:**

1. **Verificar DB_HOST en .env:**
   - ✅ Debe ser \`DB_HOST=postgres\`
   - ❌ NO usar \`localhost\` o \`127.0.0.1\`

2. **Verificar que PostgreSQL esté corriendo:**
   \`\`\`bash
   docker-compose ps postgres
   \`\`\`

3. **Revisar logs de PostgreSQL:**
   \`\`\`bash
   docker-compose logs postgres
   \`\`\`

4. **Reiniciar ambos servicios:**
   \`\`\`bash
   docker-compose restart
   \`\`\`

### Problema: Puerto 3000 ya en uso

**Síntomas:**
- Error "port is already allocated"

**Soluciones:**

1. **Cambiar puerto en .env:**
   \`\`\`env
   API_PORT=3001
   \`\`\`

2. **O detener el proceso que usa el puerto 3000:**
   \`\`\`bash
   # En Windows
   netstat -ano | findstr :3000
   taskkill /PID <pid> /F
   
   # En Linux/Mac
   lsof -ti:3000 | xargs kill -9
   \`\`\`

### Problema: Cambios en el código no se reflejan

**Causa:**
- Docker usa la imagen construida, no el código en vivo

**Soluciones:**

1. **Reconstruir la imagen:**
   \`\`\`bash
   docker-compose build api
   docker-compose up -d
   \`\`\`

2. **Forzar reconstrucción completa:**
   \`\`\`bash
   docker-compose build --no-cache api
   docker-compose up -d
   \`\`\`

### Problema: Disco lleno / Sin espacio

**Soluciones:**

1. **Limpiar imágenes no utilizadas:**
   \`\`\`bash
   docker image prune -a
   \`\`\`

2. **Limpiar volúmenes no utilizados:**
   \`\`\`bash
   docker volume prune
   \`\`\`

3. **Limpiar todo (⚠️ cuidado):**
   \`\`\`bash
   docker system prune -a --volumes
   \`\`\`

## Estructura de Volúmenes

Los siguientes directorios se montan como volúmenes para persistencia de datos:

| Volumen | Tipo | Ubicación | Propósito |
|---------|------|-----------|-----------|
| \`postgres_data\` | Docker Volume | Gestionado por Docker | Datos de PostgreSQL |
| \`./logs\` | Host Mount | \`d:\\proyecto parroquia\\logs\` | Logs de la aplicación |
| \`./uploads\` | Host Mount | \`d:\\proyecto parroquia\\uploads\` | Archivos subidos |
| \`./temp\` | Host Mount | \`d:\\proyecto parroquia\\temp\` | Archivos temporales |
| \`./backups\` | Host Mount | \`d:\\proyecto parroquia\\backups\` | Backups de PostgreSQL |

### Ver Volúmenes

\`\`\`bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect parroquia_postgres_data

# Ver tamaño de volúmenes
docker system df -v
\`\`\`

## Producción

### Checklist de Seguridad

Antes de desplegar en producción, asegúrate de:

- [ ] **NODE_ENV=production** en .env
- [ ] **Contraseñas seguras** para DB (mínimo 16 caracteres, alfanuméricos + símbolos)
- [ ] **JWT secrets únicos** (generados con \`openssl rand -base64 32\`)
- [ ] **CORS_ORIGIN específico** (no usar \`*\`)
- [ ] **FRONTEND_URL correcto** (dominio de producción)
- [ ] **SMTP configurado** correctamente
- [ ] **Backups automáticos** configurados
- [ ] **Monitoreo** de logs implementado
- [ ] **Reverse proxy** (Nginx/Apache) con SSL/TLS
- [ ] **Firewall** configurado correctamente
- [ ] **Límites de recursos** en docker-compose.yml

### Ejemplo de Configuración de Nginx

\`\`\`nginx
server {
    listen 80;
    server_name api.tudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

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
\`\`\`

### Límites de Recursos (docker-compose.yml)

\`\`\`yaml
services:
  api:
    # ... otras configuraciones
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
\`\`\`

### Backups Automáticos con Cron

\`\`\`bash
# Agregar a crontab (crontab -e)
# Backup diario a las 2 AM
0 2 * * * cd /ruta/a/proyecto && docker-compose exec -T postgres pg_dump -U parroquia_user parroquia_db | gzip > backups/backup_$(date +\%Y\%m\%d).sql.gz

# Limpiar backups antiguos (mantener últimos 30 días)
0 3 * * * find /ruta/a/proyecto/backups -name "*.sql.gz" -mtime +30 -delete
\`\`\`

### Monitoreo con Prometheus y Grafana

Puedes agregar servicios de monitoreo a tu \`docker-compose.yml\`:

\`\`\`yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
\`\`\`

## Actualizaciones

### Actualizar la Aplicación

\`\`\`bash
# 1. Obtener últimos cambios
git pull origin develop

# 2. Reconstruir imagen
docker-compose build api

# 3. Reiniciar servicios
docker-compose up -d

# 4. Verificar logs
docker-compose logs -f api
\`\`\`

### Rollback a Versión Anterior

\`\`\`bash
# 1. Ver commits anteriores
git log --oneline

# 2. Hacer checkout a commit anterior
git checkout <commit-hash>

# 3. Reconstruir
docker-compose build api
docker-compose up -d
\`\`\`

## Soporte y Contacto

Para problemas o preguntas:

- **Repositorio**: [GitHub - Parroquia](https://github.com/mike7019/Parroquia)
- **Issues**: [GitHub Issues](https://github.com/mike7019/Parroquia/issues)
- **Documentación API**: http://localhost:3000/api-docs

---

**Versión del Documento**: 1.0  
**Última Actualización**: Diciembre 2025  
**Autor**: Equipo de Desarrollo Parroquia API
`;

// Guardar como archivo Markdown
const outputPath = path.join(__dirname, 'DOCKER_DEPLOYMENT_GUIDE.md');
fs.writeFileSync(outputPath, content, 'utf8');

console.log('✅ Guía de Docker generada exitosamente:');
console.log(`   📄 ${outputPath}`);
console.log('');
console.log('Para generar PDF puedes usar:');
console.log('   1. Pandoc: pandoc DOCKER_DEPLOYMENT_GUIDE.md -o DOCKER_DEPLOYMENT_GUIDE.pdf');
console.log('   2. VSCode: Extensión "Markdown PDF"');
console.log('   3. Herramientas online: https://www.markdowntopdf.com/');

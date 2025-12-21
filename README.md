# Parroquia API

## Descripción

**Parroquia API** es un sistema RESTful robusto diseñado para la gestión integral de la información parroquial. Esta aplicación facilita la administración eficiente de feligreses, núcleos familiares, sacramentos, grupos pastorales y la generación de reportes estadísticos y certificados.

El proyecto está construido con tecnologías modernas de backend, asegurando escalabilidad, seguridad y facilidad de mantenimiento.

## Características Principales

* **Gestión de Personas**: Registro detallado de feligreses con información personal, contacto y roles.
* **Núcleos Familiares**: Administración de familias, vinculando miembros y datos socioeconómicos (vivienda, servicios, etc.).
* **Sacramentos y Celebraciones**: Registro de bautizos, matrimonios, confirmaciones y otras celebraciones litúrgicas.
* **Geografía Eclesiástica**: Gestión de barrios, sectores, veredas y corregimientos.
* **Reportes y Documentos**: Generación automática de certificados en PDF y reportes en Excel.
* **Seguridad**: Autenticación mediante JWT y control de acceso basado en roles.
* **Documentación API**: Integración con Swagger para documentación interactiva de endpoints.

## Stack Tecnológico

* **Runtime**: [Node.js](https://nodejs.org/)
* **Framework**: [Express.js](https://expressjs.com/)
* **Base de Datos**: [PostgreSQL](https://www.postgresql.org/)
* **Cliente Postgres**: [DBeaver](https://dbeaver.io/)
* **ORM**: [Sequelize](https://sequelize.org/)
* **Contenedores**: [Docker](https://www.docker.com/)

## Requisitos Previos

Asegúrate de tener instalado lo siguiente antes de comenzar:

* Node.js (v18 o superior)
* PostgreSQL (v15 o superior)
* Docker & Docker Compose (Opcional, para despliegue en contenedores)

## Instalación y Configuración

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd Parroquia

```

2. **Instalar dependencias**

```bash
npm install

```

3. **Configurar Variables de Entorno**
Crea un archivo `.env` en la raíz del proyecto basándote en el siguiente ejemplo:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parroquia_db
DB_USER=parroquia_user
DB_PASSWORD=ParroquiaSecure2025
BCRYPT_ROUNDS=12
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=12h
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:8080
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587  
EMAIL_USER=sistemaparroquia17@gmail.com
EMAIL_PASS=ykgg ogoc infr bjgl
EMAIL_FROM=noreply@parroquia.com
SEND_REAL_EMAILS=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sistemaparroquia17@gmail.com
SMTP_PASS=ykgg ogoc infr bjgl
SMTP_FROM_EMAIL=noreply@parroquia.com
VERBOSE_LOGGING=true

```

4. **Inicializar Base de Datos**
para iniciar la base de datos tenemos que instalar en el equipo la herramienta DBeaver o cualquier otro cliente de base de datos para postgresql.
aqui solo debemos levantar el contenedor de postgresql que se encuentra en el archivo docker-compose.yml con el comando

```bash
docker-compose up -d

```

una vez el contenedor este levantado, debemos conectarnos a el usando el cliente y luego restaurando la base de datos con el archivo sql que se encuentra en la carpeta databases, el archivo se llama bd_poblada_encuestas.sql y este restaura la BD con todos los datos de prueba.

## Ejecución

### Modo Desarrollo

Para levantar el servidor con recarga automática (nodemon):

```bash
npm run dev

```

### Modo Producción

```bash
npm start

```

## 🐳 Despliegue con Docker

La aplicación está completamente containerizada usando Docker Compose, facilitando el despliegue en cualquier entorno.

### Requisitos Previos para Docker

- Docker Engine 20.10+
- Docker Compose 2.0+

### Configuración Inicial

#### 1. Configurar Variables de Entorno

Copia el archivo `.env.example` y renómbralo a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` y configura las variables necesarias:

**Variables críticas:**
- `DB_HOST=postgres` (⚠️ en Docker usar nombre del servicio, no localhost)
- `DB_PASSWORD` - Contraseña segura para PostgreSQL
- `JWT_SECRET` - Mínimo 32 caracteres (generar con `openssl rand -base64 32`)
- `JWT_REFRESH_SECRET` - Diferente al JWT_SECRET
- Configuración SMTP si usas email (Gmail requiere App Password)

#### 2. Inicio Rápido

**Opción A: Usando scripts automatizados**

```bash
# En Windows PowerShell
.\docker-start.ps1

# En Linux/Mac
chmod +x docker-start.sh
./docker-start.sh
```

**Opción B: Comandos manuales**

```bash
# Construir las imágenes
docker-compose build

# Iniciar los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

#### 3. Acceso a la Aplicación

Una vez iniciados los contenedores, la aplicación estará disponible en:

- **API**: http://localhost:3000/api
- **Swagger Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

### Comandos Útiles de Docker

#### Ver el estado de los contenedores

```bash
docker-compose ps
```

#### Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo API
docker-compose logs -f api

# Solo PostgreSQL
docker-compose logs -f postgres
```

#### Reiniciar servicios

```bash
# Reiniciar todo
docker-compose restart

# Reiniciar solo API
docker-compose restart api
```

#### Detener y limpiar

```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ Borra la base de datos)
docker-compose down -v

# Detener y eliminar todo (imágenes, volúmenes, redes)
docker-compose down -v --rmi all
```

### Gestión de Base de Datos en Docker

#### Ejecutar migraciones/seeders

```bash
# Acceder al contenedor de la API
docker-compose exec api sh

# Dentro del contenedor
npm run db:sync:complete
npm run db:seed:config
npm run admin:create
```

#### Backup y restauración de PostgreSQL

```bash
# Crear backup
docker-compose exec postgres pg_dump -U parroquia_user parroquia_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T postgres psql -U parroquia_user parroquia_db < backup_20250101_120000.sql

# Conectar a PostgreSQL directamente
docker-compose exec postgres psql -U parroquia_user -d parroquia_db
```

### Troubleshooting Docker

#### El contenedor de la API no inicia

1. Verificar logs: `docker-compose logs api`
2. Verificar que PostgreSQL esté healthy: `docker-compose ps postgres`
3. Verificar variables de entorno en `.env`

#### Error de conexión a la base de datos

1. Asegurarse de que `DB_HOST=postgres` en el `.env` (no `localhost`)
2. Verificar que el contenedor postgres esté corriendo: `docker-compose ps postgres`
3. Revisar logs de PostgreSQL: `docker-compose logs postgres`

#### Reconstruir después de cambios en el código

```bash
docker-compose build --no-cache api
docker-compose up -d
```

### Estructura de Volúmenes

Los siguientes directorios se montan como volúmenes para persistencia de datos:

- `postgres_data/` - Datos de PostgreSQL (volumen Docker persistente)
- `./logs/` - Logs de la aplicación (montado desde host)
- `./uploads/` - Archivos subidos (montado desde host)
- `./temp/` - Archivos temporales (montado desde host)
- `./backups/` - Backups de PostgreSQL (montado desde host)

### Producción con Docker

Para despliegue en producción, asegúrate de:

1. Configurar `NODE_ENV=production` en `.env`
2. Usar contraseñas seguras para DB y JWT
3. Configurar `CORS_ORIGIN` con el dominio específico
4. Configurar un reverse proxy (Nginx/Apache) para SSL/TLS
5. Implementar backups automáticos de la base de datos
6. Monitorear logs con herramientas como ELK Stack o Prometheus

### Configuración Inicial

#### 1. Configurar Variables de Entorno

Copia el archivo `.env.example` y renómbralo a `.env`:

```bash
cp .env.example .env

```

Edita el archivo `.env` y configura las variables necesarias:

**Variables críticas:**
- `DB_HOST=postgres` (en Docker usar nombre del servicio)
- `DB_PASSWORD` - Contraseña segura para PostgreSQL
- `JWT_SECRET` - Mínimo 32 caracteres (generar con `openssl rand -base64 32`)
- `JWT_REFRESH_SECRET` - Diferente al JWT_SECRET
- Configuración SMTP si usas email (Gmail requiere App Password)

#### 2. Inicio Rápido

**Opción A: Usando scripts automatizados**

```bash
# En Windows PowerShell
.\docker-start.ps1

# En Linux/Mac
chmod +x docker-start.sh
./docker-start.sh

```

**Opción B: Comandos manuales**

```bash
# Construir las imágenes
docker-compose build

# Iniciar los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

```

#### 3. Acceso a la Aplicación Containerizada

Una vez iniciados los contenedores, la aplicación estará disponible en:

- **API**: http://localhost:3000/api
- **Swagger Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

### Comandos Útiles de Docker

#### Ver el estado de los contenedores

```bash
docker-compose ps

```

#### Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo API
docker-compose logs -f api

# Solo PostgreSQL
docker-compose logs -f postgres

```

#### Reiniciar servicios

```bash
# Reiniciar todo
docker-compose restart

# Reiniciar solo API
docker-compose restart api

```

#### Detener y limpiar

```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ Borra la base de datos)
docker-compose down -v

# Detener y eliminar todo (imágenes, volúmenes, redes)
docker-compose down -v --rmi all

```

### Gestión de Base de Datos en Docker

#### Ejecutar migraciones/seeders

```bash
# Acceder al contenedor de la API
docker-compose exec api sh

# Dentro del contenedor
npm run db:sync:complete
npm run db:seed:config
npm run admin:create

```

#### Backup y restauración de PostgreSQL

```bash
# Crear backup
docker-compose exec postgres pg_dump -U parroquia_user parroquia_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T postgres psql -U parroquia_user parroquia_db < backup_20250101_120000.sql

# Conectar a PostgreSQL directamente
docker-compose exec postgres psql -U parroquia_user -d parroquia_db

```

### Troubleshooting Docker

#### El contenedor de la API no inicia

1. Verificar logs: `docker-compose logs api`
2. Verificar que PostgreSQL esté healthy: `docker-compose ps postgres`
3. Verificar variables de entorno en `.env`

#### Error de conexión a la base de datos

1. Asegurarse de que `DB_HOST=postgres` en el `.env` (no `localhost`)
2. Verificar que el contenedor postgres esté corriendo: `docker-compose ps postgres`
3. Revisar logs de PostgreSQL: `docker-compose logs postgres`

#### Reconstruir después de cambios en el código

```bash
docker-compose build --no-cache api
docker-compose up -d

```

### Estructura de Volúmenes

Los siguientes directorios se montan como volúmenes para persistencia de datos:

- `postgres_data/` - Datos de PostgreSQL (volumen Docker persistente)
- `./logs/` - Logs de la aplicación (montado desde host)
- `./uploads/` - Archivos subidos (montado desde host)
- `./temp/` - Archivos temporales (montado desde host)
- `./backups/` - Backups de PostgreSQL (montado desde host)

### Producción con Docker

Para despliegue en producción, asegúrate de:

1. Configurar `NODE_ENV=production` en `.env`
2. Usar contraseñas seguras para DB y JWT
3. Configurar `CORS_ORIGIN` con el dominio específico
4. Configurar un reverse proxy (Nginx/Apache) para SSL/TLS
5. Implementar backups automáticos de la base de datos
6. Monitorear logs con herramientas como ELK Stack o Prometheus

## Estructura del Proyecto

```ini
parroquia/
├── config/         # Configuraciones de BD y Sequelize
├── docs/           # Documentación y artefactos del proyecto
├── scripts/        # Scripts de mantenimiento y utilidades de BD
├── src/
│   ├── controllers/ # Lógica de los endpoints
│   ├── models/      # Modelos de Sequelize (Catalog y Main)
│   ├── routes/      # Definición de rutas de la API
│   ├── middlewares/ # Middlewares de autenticación y validación
│   └── app.js       # Punto de entrada de la aplicación
└── ...

```

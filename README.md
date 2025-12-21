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

### Usando Docker

Para levantar la aplicación y la base de datos usando Docker Compose:

```bash
docker-compose up -d

```

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

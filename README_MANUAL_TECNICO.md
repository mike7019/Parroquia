# 📘 MANUAL TÉCNICO - SISTEMA DE GESTIÓN PARROQUIAL
## Parroquia API - Guía Completa de Instalación y Despliegue

---

**Versión:** 1.0  
**Fecha:** 27 de Enero de 2025  
**Sistema:** Parroquia API

---

## 📋 Tabla de Contenidos

1. [Descripción del Sistema](#1-descripción-del-sistema)
2. [Requisitos Previos](#2-requisitos-previos)
3. [Instalación en Servidor](#3-instalación-en-servidor)
4. [Script de Despliegue Automático](#4-script-de-despliegue-automático)
5. [Acceso a la Aplicación](#5-acceso-a-la-aplicación)
6. [Administración del Sistema](#6-administración-del-sistema)
7. [Solución de Problemas](#7-solución-de-problemas)
8. [Soporte y Contacto](#8-soporte-y-contacto)

---

## 1️⃣ DESCRIPCIÓN DEL SISTEMA

**Parroquia API** es un sistema completo de gestión parroquial diseñado para administrar toda la información pastoral de manera eficiente y segura.

### ✨ Funcionalidades Principales

| Módulo | Descripción |
|--------|-------------|
| 👥 **Personas** | Información completa de feligreses |
| 🏠 **Familias** | Núcleos familiares y datos socioeconómicos |
| ⛪ **Sacramentos** | Bautizos, matrimonios, confirmaciones |
| 🗺️ **Geografía** | Departamentos, municipios, parroquias, sectores |
| 📊 **Encuestas** | Diagnósticos pastorales |
| 📄 **Reportes** | Certificados y documentos en PDF |
| 🔐 **Seguridad** | Control de acceso basado en roles |
| 📖 **Documentación** | API REST documentada con Swagger |

### 🛠️ Stack Tecnológico

- **Backend:** Node.js 18+ con Express.js
- **Base de Datos:** PostgreSQL 15+
- **ORM:** Sequelize
- **Contenerización:** Docker & Docker Compose
- **Documentación:** Swagger/OpenAPI 3.0

---

## 2️⃣ REQUISITOS PREVIOS

### 🖥️ Para Servidor de Producción

| Requisito | Especificación |
|-----------|----------------|
| **Sistema Operativo** | Linux (Ubuntu 20.04 LTS o superior) |
| **Docker Engine** | Versión 20.10 o superior |
| **Docker Compose** | Versión 2.0 o superior |
| **Memoria RAM** | 4GB mínimo (8GB recomendado) |
| **Espacio en Disco** | 20GB mínimo disponible |
| **Conectividad** | Acceso SSH, puerto 3000 abierto |

### 💻 Para Desarrollo Local

- **Node.js** v18 o superior
- **PostgreSQL** 15 o superior
- **Docker & Docker Compose** (opcional pero recomendado)
- **Git** para control de versiones

---

## 3️⃣ INSTALACIÓN EN SERVIDOR

### 📝 Paso 1: Conectarse al Servidor

ssh usuario@206.62.139.11
# Cambiar 'usuario' y la IP según su servidor

---

```bash
# Verificar que el servicio responde
curl http://localhost:3000/api/health

# Resultado esperado (JSON):
# {"status":"ok","timestamp":"2025-01-27T10:30:00.000Z"}
```

### ✅ Paso 5: Verificar Instalación

```bash
# Construir las imágenes Docker
docker-compose build

# Iniciar servicios en segundo plano
docker-compose up -d

# Verificar estado
docker-compose ps

# Ver logs (presionar Ctrl+C para salir)
docker-compose logs -f
```

### 🚀 Paso 4: Construir e Iniciar Servicios

```bash
openssl rand -base64 32
# Ejecutar 2 veces para JWT_SECRET y JWT_REFRESH_SECRET
```

💡 **Generar claves JWT seguras:**

```bash
# ENTORNO
NODE_ENV=production
PORT=3000

# BASE DE DATOS
DB_HOST=postgres
DB_PORT=5432
DB_NAME=parroquia_db
DB_USER=parroquia_user
DB_PASSWORD=ParroquiaSecure2025!
DB_DIALECT=postgres

# SEGURIDAD JWT
JWT_SECRET=tu-clave-secreta-minimo-32-caracteres
JWT_REFRESH_SECRET=otra-clave-diferente-minimo-32-caracteres
JWT_EXPIRES_IN=12h
JWT_REFRESH_EXPIRES_IN=7d

# EMAIL (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sistemaparroquia17@gmail.com
SMTP_PASS=ykgg ogoc infr bjgl

# FRONTEND
FRONTEND_URL=http://localhost:8080
CORS_ORIGIN=http://localhost:8080
```

**Contenido mínimo requerido del archivo `.env`:**

```bash
nano .env
```

### ⚙️ Paso 3: Configurar Variables de Entorno

Crear archivo `.env` con la configuración necesaria:

```bash
# Navegar al directorio de aplicaciones
cd /opt

# Clonar el repositorio
sudo git clone https://github.com/mike7019/Parroquia.git parroquia-api

# Cambiar permisos (reemplazar $USER con su usuario si es necesario)
sudo chown -R $USER:$USER parroquia-api

# Entrar al directorio
cd parroquia-api
```

### 📦 Paso 2: Clonar el Repositorio

## 4️⃣ SCRIPT DE DESPLIEGUE AUTOMÁTICO

### 🔄 ¿Qué es el Script `deploy_from_git.sh`?

Script automatizado que simplifica las actualizaciones del sistema. **Automatiza completamente:**

✅ Descarga de cambios desde Git (rama main)  
✅ Detención de contenedores antiguos  
✅ Reconstrucción de imágenes  
✅ Inicio de servicios actualizados  
✅ Ejecución de seeders de datos  
✅ Verificación de estado del servicio  

### 📖 Cómo Usar el Script

# Hacer el script ejecutable (solo primera vez)
chmod +x deploy_from_git.sh

# Ejecutar el despliegue automático
./deploy_from_git.sh

⚠️ **Recomendaciones:**
- Ejecutar durante **horas de bajo uso** (preferible madrugada)
- Tiempo aproximado: **5-10 minutos**
- **Sin pérdida de datos** (PostgreSQL persiste en volúmenes)
- Crear **backup previo** (ver sección 6)

---

```bash
Iniciando despliegue automático de parroquia-api...
Actualizando repositorio existente...
Deteniendo contenedores existentes...
Limpiando imágenes antiguas...
Construyendo nueva imagen...
Iniciando aplicación...
Ejecutando seeders de la base de datos...
Esperando a que el servicio esté listo...
Servicio está funcionando correctamente
Despliegue completado exitosamente!
Aplicación disponible en: http://206.62.139.11:3000
Documentación Swagger: http://206.62.139.11:3000/api-docs
```

### 📊 Salida Esperada

## 5️⃣ ACCESO A LA APLICACIÓN

### 🌐 URLs Disponibles

| Servicio | URL | Descripción |
|----------|-----|-------------|
| 🚀 **API REST** | http://206.62.139.11:3000/api | Endpoints de la API |
| 📚 **Swagger Docs** | http://206.62.139.11:3000/api-docs | Documentación interactiva |
| 💚 **Health Check** | http://206.62.139.11:3000/api/health | Verificación de estado |
| 🔐 **Login** | POST http://206.62.139.11:3000/api/auth/login | Autenticación |

### 👤 Crear Primer Usuario Administrador

# Ejecutar comando para crear administrador
docker-compose exec api npm run admin:create

# Seguir instrucciones interactivas:
# Email: admin@parroquia.com
# Nombre: Administrador
# Apellido: Sistema
# Contraseña: [escribir contraseña segura]

---

```bash
curl -X POST http://206.62.139.11:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@parroquia.com",
    "password": "tu-contraseña-admin"
  }'
```

### 🧪 Probar el Login

## 6️⃣ ADMINISTRACIÓN DEL SISTEMA

### 🐳 Comandos Docker Principales

# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs solo de API
docker-compose logs -f api

# Ver logs solo de PostgreSQL
docker-compose logs -f postgres

# Ver últimas 50 líneas
docker-compose logs --tail=50 api

# Reiniciar todos los servicios
docker-compose restart

# Reiniciar solo API
docker-compose restart api

# Reiniciar solo PostgreSQL
docker-compose restart postgres

# Detener servicios (sin eliminar datos)
docker-compose down

# Detener y eliminar volúmenes (⚠️ BORRA LA BASE DE DATOS)
docker-compose down -v

### 💾 Backup de Base de Datos

# Crear backup con fecha y hora
docker-compose exec postgres pg_dump -U parroquia_user parroquia_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Guardar en carpeta específica
mkdir -p backups
docker-compose exec postgres pg_dump -U parroquia_user parroquia_db > backups/backup_$(date +%Y%m%d_%H%M%S).sql

### 📥 Restaurar Desde Backup

# Restaurar desde archivo backup
docker-compose exec -T postgres psql -U parroquia_user parroquia_db < backups/backup_20250127_150000.sql

# Verificar restauración
docker-compose exec postgres psql -U parroquia_user -d parroquia_db -c "SELECT COUNT(*) FROM personas;"

---

```bash
# Inicializar base de datos (primera vez)
docker-compose exec api npm run db:sync:complete

# Cargar datos de catálogos (geografía, roles, etc.)
docker-compose exec api npm run db:seed:config

# Ver recursos utilizados
docker stats

# Espacio usado por Docker
docker system df

# Limpiar imágenes no usadas
docker image prune -a -f
```

### 🔧 Operaciones de Mantenimiento

## 7️⃣ SOLUCIÓN DE PROBLEMAS

### ❌ ERROR: "Connection refused" en puerto 3000

**Causa:** El contenedor de API no está iniciando correctamente

**Solución:**

# Ver logs detallados
docker-compose logs api | head -100

# Verificar estado de PostgreSQL
docker-compose ps postgres

# Reiniciar API
docker-compose restart api

### ❌ ERROR: "Cannot connect to database"

**Causa:** Problema de conexión entre contenedores

**Verificar:**

# 1. Asegurar que DB_HOST sea "postgres" (no localhost)
grep DB_HOST .env

# 2. Verificar que PostgreSQL esté corriendo
docker-compose ps postgres

# 3. Ver logs de PostgreSQL
docker-compose logs postgres

# 4. Reiniciar ambos servicios
docker-compose restart

### ❌ ERROR: "Port 3000 already in use"

**Causa:** Otro servicio está usando el puerto

**Solución:**

# Ver qué está usando el puerto
sudo lsof -i :3000

# Cambiar puerto en .env a 3001
sed -i 's/PORT=3000/PORT=3001/' .env

# Recrear contenedores
docker-compose up -d

### ❌ ERROR: "Disco lleno"

**Causa:** Logs o imágenes Docker acumuladas

**Solución:**

# Ver uso de disco Docker
docker system df

# Limpiar imágenes no usadas
docker image prune -a -f

# Limpiar contenedores detenidos
docker container prune -f

# Limpiar todo (⚠️ CUIDADO)
docker system prune -a

---

## 8️⃣ SOPORTE Y CONTACTO

### 📞 Información de Contacto

| Recurso | Enlace |
|---------|--------|
| 📦 **Repositorio GitHub** | https://github.com/mike7019/Parroquia |
| 📖 **Documentación API** | http://206.62.139.11:3000/api-docs |
| 💚 **Health Check** | http://206.62.139.11:3000/api/health |
| 📧 **Email Soporte** | [contacto técnico] |

### ✅ Checklist Pre-Entrega

Antes de entregar al cliente, verificar:

- [ ] Servidor accesible por SSH
- [ ] Docker y Docker Compose instalados
- [ ] Archivo `.env` configurado
- [ ] `docker-compose build` ejecutado
- [ ] `docker-compose up -d` servicios corriendo
- [ ] Health check responde correctamente
- [ ] Swagger accesible
- [ ] Usuario administrador creado
- [ ] Seeders de catálogos cargados
- [ ] Backup inicial realizado
- [ ] Script `deploy_from_git.sh` probado
- [ ] Documentación entregada
- [ ] Contacto de soporte asignado

---

---

## 📄 Información del Documento

**Manual Técnico Versión:** 1.0  
**Última Actualización:** 27 de Enero de 2025  
**Sistema:** Parroquia API v1.0  
**Autor:** Equipo de Desarrollo

---

**© 2025 Sistema de Gestión Parroquial - Todos los derechos reservados**

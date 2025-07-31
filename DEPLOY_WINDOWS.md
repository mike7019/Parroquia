# 🚀 Guía de Despliegue para Windows

## Parroquia API - Despliegue con Docker en Windows

Esta guía te ayudará a desplegar la aplicación Parroquia API usando Docker en un sistema Windows.

## 📋 Prerrequisitos

### Software Requerido
- **Windows 10/11** (versión 1903 o superior)
- **Docker Desktop for Windows** (versión 4.0 o superior)
- **PowerShell** (incluido en Windows)
- **Git** (para clonar el repositorio)

### Instalación de Docker Desktop

1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
2. Ejecuta el instalador como administrador
3. Reinicia el sistema cuando se solicite
4. Verifica la instalación abriendo PowerShell y ejecutando:

```powershell
docker --version
docker-compose --version
```

## 🛠️ Configuración Inicial

### 1. Clonar el Repositorio

```powershell
git clone https://github.com/mike7019/Parroquia.git
cd Parroquia
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:

```powershell
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tu editor favorito
notepad .env
```

**Configuración mínima requerida:**

```bash
# Base de datos
DB_HOST=postgres
DB_PORT=5432
DB_NAME=parroquia_db
DB_USER=parroquia_user
DB_PASSWORD=tu_password_seguro

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro

# Email (opcional para desarrollo)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password

# Servidor
NODE_ENV=production
PORT=3000
```

## 🚀 Despliegue

### Opción 1: Script Automático (Recomendado)
Ejecuta el script de PowerShell incluido:

```powershell
# Dar permisos de ejecución (si es necesario)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Ejecutar script de despliegue
.\deploy.ps1
```

### Opción 2: Comandos Manuales
Si prefieres ejecutar los comandos paso a paso:

```powershell
# 1. Construir la imagen
docker-compose build --no-cache

# 2. Iniciar servicios
docker-compose up -d

# 3. Verificar estado
docker-compose ps

# 4. Ejecutar migraciones
docker-compose exec api npm run db:migrate

# 5. Cargar datos de catálogo
docker-compose exec api npm run db:load-catalogs

# 6. Crear usuario administrador
docker-compose exec api npm run admin:create
```

## 🔧 Verificación del Despliegue

### Health Check

```powershell
# Verificar que la API responde
curl http://localhost:3000/api/health
```

### Acceso a la Aplicación
- **API Base URL:** http://localhost:3000/api
- **Documentación Swagger:** http://localhost:3000/api-docs
- **Health Check:** http://localhost:3000/api/health

## 🛡️ Comandos Útiles para Administración

```powershell
# Ver estado de contenedores
docker-compose ps

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Ver logs en tiempo real
docker-compose logs -f

# Acceder al contenedor de la API
docker-compose exec api sh

# Backup de base de datos
docker-compose exec postgres pg_dump -U parroquia_user parroquia_db > backup.sql
```

## 🔍 Solución de Problemas

### Problema: Docker no arranca
**Solución:**
1. Verificar que la virtualización esté habilitada en BIOS
2. Habilitar Hyper-V en Windows Features
3. Reiniciar Docker Desktop

### Problema: Puerto 3000 ocupado
**Solución:**

```powershell
# Encontrar proceso que usa el puerto
netstat -ano | findstr :3000

# Terminar proceso (reemplazar PID)
taskkill /PID <PID> /F
```

### Problema: Permisos de PowerShell
**Solución:**

```powershell
# Cambiar política de ejecución
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📝 Checklist de Despliegue

- [ ] Docker Desktop instalado y funcionando
- [ ] Repositorio clonado
- [ ] Archivo `.env` configurado
- [ ] Puerto 3000 disponible
- [ ] Contenedores iniciados correctamente
- [ ] Migraciones ejecutadas
- [ ] Health check respondiendo 200 OK
- [ ] Usuario administrador creado

---

**¡Listo!** Tu aplicación Parroquia API debe estar corriendo en http://localhost:3000/api

## 📞 Soporte

Si encuentras problemas durante el despliegue:
- **Revisar logs:** `docker-compose logs`
- **Verificar configuración:** Archivo `.env`
- **GitHub Issues:** https://github.com/mike7019/Parroquia/issues
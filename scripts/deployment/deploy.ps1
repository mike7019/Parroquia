# Script de despliegue para Parroquia API - Versión Windows PowerShell
# Uso: .\deploy.ps1

param(
    [switch]$SkipEnvCheck,
    [switch]$SkipMigrations,
    [switch]$SkipAdmin
)

# Configuración de colores
$Host.UI.RawUI.ForegroundColor = "White"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Info($message) {
    Write-ColorOutput Green "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $message"
}

function Write-Warning($message) {
    Write-ColorOutput Yellow "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] WARNING: $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR: $message"
}

Write-Info "🚀 Iniciando despliegue de Parroquia API..."

# Verificar que Docker está instalado
try {
    $dockerVersion = docker --version
    Write-Info "Docker encontrado: $dockerVersion"
} catch {
    Write-Error "Docker no está instalado o no está en el PATH. Por favor instala Docker Desktop primero."
    exit 1
}

try {
    $dockerComposeVersion = docker-compose --version
    Write-Info "Docker Compose encontrado: $dockerComposeVersion"
} catch {
    Write-Error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
}

# Verificar que existe el archivo .env
if (-not (Test-Path ".env") -and -not $SkipEnvCheck) {
    Write-Warning "El archivo .env no existe. Creando uno desde .env.production..."
    Copy-Item ".env.production" ".env"
    Write-Warning "Por favor edita el archivo .env con tus configuraciones antes de continuar."
    Write-ColorOutput Blue "Presiona Enter cuando hayas configurado el archivo .env..."
    Read-Host
}

# Crear directorios necesarios
Write-Info "Creando directorios necesarios..."
if (-not (Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" -Force | Out-Null }
if (-not (Test-Path "temp")) { New-Item -ItemType Directory -Path "temp" -Force | Out-Null }

# Construir imágenes
Write-Info "Construyendo imagen Docker..."
docker-compose build --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al construir la imagen Docker"
    exit 1
}

# Detener servicios existentes
Write-Info "Deteniendo servicios existentes..."
docker-compose down

# Limpiar recursos no utilizados
Write-Info "Limpiando recursos no utilizados..."
docker system prune -f

# Iniciar servicios
Write-Info "Iniciando servicios..."
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al iniciar los servicios"
    exit 1
}

# Esperar a que los servicios estén listos
Write-Info "Esperando a que los servicios estén listos..."
Start-Sleep -Seconds 30

# Verificar estado de los servicios
Write-Info "Verificando estado de los servicios..."
docker-compose ps

# Verificar health checks
Write-Info "Verificando health checks..."
Start-Sleep -Seconds 10

# Ejecutar migraciones de base de datos
if (-not $SkipMigrations) {
    Write-Info "Ejecutando migraciones de base de datos..."
    docker-compose exec api npm run db:migrate
    
    # Cargar datos de catálogo
    Write-Info "Cargando datos de catálogo..."
    docker-compose exec api npm run db:load-catalogs
}

# Crear usuario administrador
if (-not $SkipAdmin) {
    $createAdmin = Read-Host "¿Deseas crear un usuario administrador? (y/N)"
    if ($createAdmin -match "^[Yy]$") {
        docker-compose exec api npm run admin:create
    }
}

# Mostrar logs en tiempo real
$showLogs = Read-Host "¿Deseas ver los logs en tiempo real? (y/N)"
if ($showLogs -match "^[Yy]$") {
    docker-compose logs -f
    return
}

# Información final
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Info "✅ Despliegue completado exitosamente!"
Write-Host ""
Write-ColorOutput Blue "🌐 API URL: http://localhost:5000/api"
Write-ColorOutput Blue "📚 Documentación: http://localhost:5000/api-docs"
Write-ColorOutput Blue "💚 Health Check: http://localhost:5000/api/health"
Write-Host ""
Write-ColorOutput Yellow "📝 Comandos útiles:"
Write-Host "  • Ver logs: docker-compose logs -f"
Write-Host "  • Reiniciar: docker-compose restart"
Write-Host "  • Detener: docker-compose down"
Write-Host "  • Ver estado: docker-compose ps"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# ==============================================
# PARROQUIA API - QUICK START SCRIPT (Windows)
# ==============================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando despliegue de Parroquia API con Docker..." -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker está instalado
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker está instalado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker no está instalado" -ForegroundColor Red
    exit 1
}

try {
    $dockerComposeVersion = docker-compose --version
    Write-Host "✅ Docker Compose está instalado: $dockerComposeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker Compose no está instalado" -ForegroundColor Red
    exit 1
}

# Verificar si existe .env
if (-not (Test-Path .env)) {
    Write-Host "⚠️  Archivo .env no encontrado. Creando desde .env.example..." -ForegroundColor Yellow
    
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "✅ Archivo .env creado" -ForegroundColor Green
        Write-Host "⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones antes de continuar" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Presiona ENTER cuando hayas configurado el archivo .env..." -ForegroundColor Yellow
        Read-Host
    } else {
        Write-Host "❌ Error: No se encontró .env.example" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
}

# Detener contenedores existentes si los hay
Write-Host ""
Write-Host "🔄 Deteniendo contenedores existentes..." -ForegroundColor Cyan
docker-compose down 2>$null

# Construir imágenes
Write-Host ""
Write-Host "🏗️  Construyendo imágenes Docker..." -ForegroundColor Cyan
docker-compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir las imágenes" -ForegroundColor Red
    exit 1
}

# Iniciar servicios
Write-Host ""
Write-Host "🚀 Iniciando servicios..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar los servicios" -ForegroundColor Red
    exit 1
}

# Esperar a que PostgreSQL esté listo
Write-Host ""
Write-Host "⏳ Esperando a que PostgreSQL esté listo..." -ForegroundColor Cyan

$maxRetries = 30
$retryCount = 0

while ($retryCount -lt $maxRetries) {
    try {
        docker-compose exec -T postgres pg_isready -U parroquia_user -d parroquia_db 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            break
        }
    } catch {}
    
    Write-Host "   Esperando PostgreSQL..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
    $retryCount++
}

if ($retryCount -ge $maxRetries) {
    Write-Host "❌ PostgreSQL no respondió después de $maxRetries intentos" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PostgreSQL está listo" -ForegroundColor Green

# Esperar a que la API esté lista
Write-Host ""
Write-Host "⏳ Esperando a que la API esté lista..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

$maxRetries = 30
$retryCount = 0

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            break
        }
    } catch {}
    
    Write-Host "   Esperando API... (intento $($retryCount + 1)/$maxRetries)" -ForegroundColor Gray
    Start-Sleep -Seconds 2
    $retryCount++
}

if ($retryCount -ge $maxRetries) {
    Write-Host "❌ La API no respondió después de $maxRetries intentos" -ForegroundColor Red
    Write-Host ""
    Write-Host "Ver logs con: docker-compose logs api" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ API está lista" -ForegroundColor Green

# Mostrar estado de los contenedores
Write-Host ""
Write-Host "📊 Estado de los contenedores:" -ForegroundColor Cyan
docker-compose ps

# Mostrar información de acceso
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "🎉 ¡Despliegue exitoso!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Accesos:" -ForegroundColor Cyan
Write-Host "   - API: http://localhost:3000/api"
Write-Host "   - Swagger: http://localhost:3000/api-docs"
Write-Host "   - Health: http://localhost:3000/api/health"
Write-Host ""
Write-Host "📋 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   - Ver logs: docker-compose logs -f"
Write-Host "   - Reiniciar: docker-compose restart"
Write-Host "   - Detener: docker-compose down"
Write-Host ""
Write-Host "📖 Para más información, consulta DOCKER_README.md"
Write-Host ""

# Preguntar si desea ver los logs
$response = Read-Host "¿Deseas ver los logs en tiempo real? (y/n)"
if ($response -match "^[yY]") {
    docker-compose logs -f
}

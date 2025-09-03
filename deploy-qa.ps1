# ==============================================
# SCRIPT DE DESPLIEGUE PARA AMBIENTE QA
# Puerto: 5000
# ==============================================

Write-Host "🚀 Iniciando despliegue de ambiente QA en puerto 5000..." -ForegroundColor Blue

# Función para logs con colores
function Write-Info {
    param($message)
    Write-Host "ℹ️  $message" -ForegroundColor Cyan
}

function Write-Success {
    param($message)
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Warning {
    param($message)
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Write-ErrorMsg {
    param($message)
    Write-Host "❌ $message" -ForegroundColor Red
}

# Verificar si Docker está corriendo
try {
    docker info | Out-Null
    Write-Success "Docker está ejecutándose"
} catch {
    Write-ErrorMsg "Docker no está ejecutándose. Por favor inicia Docker."
    exit 1
}

# Detener servicios QA existentes si están corriendo
Write-Info "Deteniendo servicios QA existentes..."
docker-compose -f docker-compose.qa.yml down --remove-orphans

# Limpiar volúmenes QA si se solicita
if ($args -contains "--clean") {
    Write-Warning "Limpiando volúmenes de QA (se perderán todos los datos)..."
    docker volume rm parroquia_postgres_qa_data 2>$null
    docker volume rm parroquia_app_qa_logs 2>$null
    docker volume rm parroquia_app_qa_temp 2>$null
    docker volume rm parroquia_app_qa_uploads 2>$null
    docker volume rm parroquia_nginx_qa_logs 2>$null
}

# Crear network si no existe
Write-Info "Creando network de QA..."
docker network create parroquia-qa-network 2>$null

# Construir y levantar servicios
Write-Info "Construyendo y levantando servicios QA..."
docker-compose -f docker-compose.qa.yml up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Error al construir o levantar servicios QA"
    exit 1
}

# Esperar a que la base de datos esté lista
Write-Info "Esperando a que PostgreSQL QA esté listo..."
$maxAttempts = 30
$attempt = 0

do {
    $attempt++
    try {
        docker exec parroquia-postgres-qa pg_isready -U parroquia_qa_user -d parroquia_qa_db 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "PostgreSQL QA está listo"
            break
        }
    } catch {}
    
    if ($attempt -eq $maxAttempts) {
        Write-ErrorMsg "Timeout esperando PostgreSQL QA"
        exit 1
    }
    Start-Sleep 2
} while ($attempt -lt $maxAttempts)

# Sincronizar base de datos si es necesario
if ($args -contains "--sync-db") {
    Write-Info "Sincronizando base de datos QA..."
    
    # Copiar script de sincronización al contenedor
    docker cp sync-database.js parroquia-api-qa:/app/
    
    # Ejecutar sincronización
    docker exec parroquia-api-qa node sync-database.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Base de datos QA sincronizada correctamente"
    } else {
        Write-ErrorMsg "Error al sincronizar base de datos QA"
        exit 1
    }
}

# Esperar a que la API esté lista
Write-Info "Esperando a que la API QA esté lista..."
$maxAttempts = 60
$attempt = 0

do {
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Success "API QA está funcionando"
            break
        }
    } catch {}
    
    if ($attempt -eq $maxAttempts) {
        Write-ErrorMsg "Timeout esperando API QA"
        exit 1
    }
    Start-Sleep 2
} while ($attempt -lt $maxAttempts)

# Verificar servicios
Write-Info "Verificando estado de servicios QA..."
docker-compose -f docker-compose.qa.yml ps

# Mostrar URLs de acceso
Write-Host ""
Write-Success "🎉 Ambiente QA desplegado exitosamente!"
Write-Host ""
Write-Host "📱 URLs de Acceso:" -ForegroundColor White
Write-Host "   • API QA:           http://localhost:5000/api" -ForegroundColor Gray
Write-Host "   • Health Check:     http://localhost:5000/api/health" -ForegroundColor Gray
Write-Host "   • Documentación:    http://localhost:5000/api-docs" -ForegroundColor Gray
Write-Host "   • Nginx QA:         http://localhost:8081" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 Base de Datos QA:" -ForegroundColor White
Write-Host "   • Host: localhost" -ForegroundColor Gray
Write-Host "   • Puerto: 5433" -ForegroundColor Gray
Write-Host "   • Database: parroquia_qa_db" -ForegroundColor Gray
Write-Host "   • User: parroquia_qa_user" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 Comandos útiles:" -ForegroundColor White
Write-Host "   • Ver logs API:     docker-compose -f docker-compose.qa.yml logs -f api-qa" -ForegroundColor Gray
Write-Host "   • Ver logs DB:      docker-compose -f docker-compose.qa.yml logs -f postgres-qa" -ForegroundColor Gray
Write-Host "   • Parar servicios:  docker-compose -f docker-compose.qa.yml down" -ForegroundColor Gray
Write-Host "   • Restart API:      docker-compose -f docker-compose.qa.yml restart api-qa" -ForegroundColor Gray
Write-Host ""

# Probar endpoint de salud
Write-Info "Probando endpoint de salud..."
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 10
    Write-Success "Endpoint de salud respondiendo correctamente"
    Write-Host "   Respuesta: $($healthResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Warning "Endpoint de salud no está respondiendo como se esperaba"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Success "✨ Despliegue QA completado!"

# SCRIPT DE CONFIGURACIÓN COMPLETA PARA SERVIDOR DE TESTING (Windows)
# ===================================================================
#
# Este script configura completamente un nuevo servidor de testing
# después de clonar el repositorio.
#
# USO: .\setup-testing-server.ps1
#

Write-Host "🚀 CONFIGURACIÓN COMPLETA DEL SERVIDOR DE TESTING" -ForegroundColor Green
Write-Host "═════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "📅 $(Get-Date)"
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: No se encuentra package.json" -ForegroundColor Red
    Write-Host "   Ejecutar desde el directorio raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Verificar que estamos en la rama testing
$currentBranch = git branch --show-current
if ($currentBranch -ne "testing") {
    Write-Host "⚠️ ADVERTENCIA: No estás en la rama 'testing'" -ForegroundColor Yellow
    Write-Host "   Rama actual: $currentBranch" -ForegroundColor Yellow
    Write-Host "   Cambiando a rama testing..." -ForegroundColor Yellow
    git checkout testing
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERROR: No se pudo cambiar a la rama testing" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Rama testing activa" -ForegroundColor Green

# Instalar dependencias
Write-Host ""
Write-Host "📦 INSTALANDO DEPENDENCIAS" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Falló la instalación de dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencias instaladas" -ForegroundColor Green

# Verificar que existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "⚠️ ARCHIVO .env NO ENCONTRADO" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "Creando archivo .env básico..." -ForegroundColor Yellow
    
    $envContent = @"
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parroquia_db
DB_USER=parroquia_user
DB_PASSWORD=ParroquiaSecure2025

# Configuración de Aplicación
PORT=3000
NODE_ENV=testing

# JWT Secrets
JWT_SECRET=testing_jwt_secret_key_2025_parroquia_system
JWT_REFRESH_SECRET=testing_refresh_secret_key_2025_parroquia

# SMTP Configuration (opcional para testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Logging
VERBOSE_LOGGING=true
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host "✅ Archivo .env creado con configuración básica" -ForegroundColor Green
    Write-Host "⚠️ IMPORTANTE: Revisar y ajustar las credenciales de base de datos" -ForegroundColor Yellow
} else {
    Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
}

# Ejecutar sincronización completa de base de datos
Write-Host ""
Write-Host "🗄️ SINCRONIZACIÓN COMPLETA DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
npm run sync:testing:robust
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Falló la sincronización de base de datos" -ForegroundColor Red
    Write-Host "   Verificar:" -ForegroundColor Yellow
    Write-Host "   - Que PostgreSQL esté ejecutándose" -ForegroundColor Yellow
    Write-Host "   - Que las credenciales en .env sean correctas" -ForegroundColor Yellow
    Write-Host "   - Que la base de datos exista" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 ¡CONFIGURACIÓN COMPLETA EXITOSA!" -ForegroundColor Green
Write-Host "═════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
Write-Host "✅ Base de datos sincronizada" -ForegroundColor Green
Write-Host "✅ Catálogos básicos cargados" -ForegroundColor Green
Write-Host "✅ Usuario administrador creado" -ForegroundColor Green
Write-Host "✅ Sistema de encuestas verificado" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 SERVIDOR DE TESTING LISTO" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "   1. Iniciar el servidor: npm run dev" -ForegroundColor White
Write-Host "   2. Acceder a: http://localhost:3000" -ForegroundColor White
Write-Host "   3. API Docs: http://localhost:3000/api-docs" -ForegroundColor White
Write-Host "   4. Login con: admin@testing.parroquia / Testing2025!" -ForegroundColor White
Write-Host ""
Write-Host "🛠️ COMANDOS ÚTILES:" -ForegroundColor Cyan
Write-Host "   npm run dev          - Iniciar en modo desarrollo" -ForegroundColor White
Write-Host "   npm run pm2:start    - Iniciar con PM2" -ForegroundColor White
Write-Host "   npm run docker:dev   - Iniciar con Docker" -ForegroundColor White
Write-Host ""
Write-Host "🔧 MANTENIMIENTO:" -ForegroundColor Cyan
Write-Host "   npm run fix:production:robust - Aplicar correcciones" -ForegroundColor White
Write-Host "   npm run sync:complete:testing - Re-sincronizar DB" -ForegroundColor White

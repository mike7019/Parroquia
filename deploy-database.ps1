# Script de despliegue de base de datos para Windows PowerShell
# Ejecutar después de git pull

param(
    [switch]$Force,
    [switch]$NoBackup
)

Write-Host "🚀 Iniciando despliegue de base de datos..." -ForegroundColor Blue

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. ¿Estás en el directorio correcto?" -ForegroundColor Red
    exit 1
}

# Paso 1: Backup (opcional)
if (-not $NoBackup) {
    Write-Host "ℹ️  Crear backup manual con:" -ForegroundColor Yellow
    Write-Host "pg_dump -h HOST -U USER -d DATABASE > backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql" -ForegroundColor Gray
    $continue = Read-Host "¿Continuar? (Y/n)"
    if ($continue -eq 'n' -or $continue -eq 'N') {
        Write-Host "❌ Despliegue cancelado" -ForegroundColor Red
        exit 1
    }
}

# Paso 2: Instalar dependencias
Write-Host "ℹ️  Instalando dependencias..." -ForegroundColor Blue
npm install --production
Write-Host "✅ Dependencias actualizadas" -ForegroundColor Green

# Paso 3: Limpieza de tablas
Write-Host "ℹ️  Ejecutando limpieza de tablas duplicadas..." -ForegroundColor Blue
try {
    node clean-duplicate-tables.js
    Write-Host "✅ Limpieza completada" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Limpieza tuvo warnings (normal si ya están limpias)" -ForegroundColor Yellow
}

# Paso 4: Sincronización
Write-Host "ℹ️  Ejecutando sincronización de base de datos..." -ForegroundColor Blue
if ($Force) {
    npm run db:sync:complete force
} else {
    npm run db:sync:complete
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Sincronización completada" -ForegroundColor Green
} else {
    Write-Host "❌ Error en sincronización" -ForegroundColor Red
    exit 1
}

# Paso 5: Verificación
Write-Host "ℹ️  Verificando conexión..." -ForegroundColor Blue
$testScript = @"
import sequelize from './config/sequelize.js';
try {
    await sequelize.authenticate();
    console.log('✅ Conexión verificada');
    await sequelize.close();
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
"@

$testScript | node --input-type=module
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Verificación completada" -ForegroundColor Green
} else {
    Write-Host "❌ Error en verificación" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Despliegue completado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Blue
Write-Host "  1. Reiniciar servidor: pm2 restart ecosystem.config.cjs" -ForegroundColor Gray
Write-Host "  2. Verificar API funciona correctamente" -ForegroundColor Gray
Write-Host "  3. Probar endpoints críticos" -ForegroundColor Gray

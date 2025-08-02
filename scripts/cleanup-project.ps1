# Script de limpieza completa del proyecto Parroquia
# Autor: GitHub Copilot  
# Fecha: 2025-08-02

Write-Host "🧹 INICIANDO LIMPIEZA COMPLETA DEL PROYECTO PARROQUIA" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Crear directorios de organización si no existen
Write-Host "📁 Creando estructura de directorios..." -ForegroundColor Yellow
$directories = @(
    "scripts\utilities",
    "scripts\tests", 
    "scripts\deployment",
    "scripts\database",
    "temp\old-files"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Mover archivos de verificación de base de datos
Write-Host "📦 Organizando archivos de utilidad..." -ForegroundColor Yellow

# Scripts de verificación de base de datos
$dbCheckFiles = Get-ChildItem -Name "check-*.cjs" -ErrorAction SilentlyContinue
if ($dbCheckFiles) {
    foreach ($file in $dbCheckFiles) {
        Move-Item $file "scripts\database\" -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  ✅ Scripts de verificación movidos a scripts\database\" -ForegroundColor Green
}

$dbCheckJsFiles = Get-ChildItem -Name "check-*.js" -ErrorAction SilentlyContinue
if ($dbCheckJsFiles) {
    foreach ($file in $dbCheckJsFiles) {
        Move-Item $file "scripts\database\" -Force -ErrorAction SilentlyContinue
    }
}

# Scripts de población y configuración
$dbScripts = @(
    "populate-roles.js",
    "createAdminUser.js", 
    "updateAdminEmail.js"
)

foreach ($script in $dbScripts) {
    if (Test-Path $script) {
        Move-Item $script "scripts\database\" -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ $script movido" -ForegroundColor Green
    }
}

# Scripts de deployment
$deployScripts = @(
    "deploy.sh",
    "deploy.ps1",
    "pre-deploy.sh", 
    "prepare-for-deploy.sh"
)

foreach ($script in $deployScripts) {
    if (Test-Path $script) {
        Move-Item $script "scripts\deployment\" -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "  ✅ Scripts de deployment movidos" -ForegroundColor Green

# Scripts de utilidad general
$utilityScripts = @(
    "load-basic-data.js",
    "loadCatalogData.js",
    "list-tables.js",
    "run-migration.js",
    "sector-creation-guide.js",
    "setup-roles-admin.js",
    "show-all-personas-columns.cjs"
)

foreach ($script in $utilityScripts) {
    if (Test-Path $script) {
        Move-Item $script "scripts\utilities\" -Force -ErrorAction SilentlyContinue
    }
}

$validateFiles = Get-ChildItem -Name "validate-*" -ErrorAction SilentlyContinue
if ($validateFiles) {
    foreach ($file in $validateFiles) {
        Move-Item $file "scripts\utilities\" -Force -ErrorAction SilentlyContinue
    }
}

$generateFiles = Get-ChildItem -Name "generate-*" -ErrorAction SilentlyContinue  
if ($generateFiles) {
    foreach ($file in $generateFiles) {
        Move-Item $file "scripts\utilities\" -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "  ✅ Scripts de utilidad organizados" -ForegroundColor Green

# Eliminar archivos de prueba temporales
Write-Host "🗑️  Eliminando archivos de prueba temporales..." -ForegroundColor Yellow

$testFiles = @(
    "test-user-registration.js",
    "test-registration-fix*.ps1", 
    "test-app.js",
    "test-imports.js",
    "test-relaciones-territoriales.js",
    "ejemplo-parroquia-municipio.js",
    "ejemplos-familias.js"
)

foreach ($pattern in $testFiles) {
    $files = Get-ChildItem -Name $pattern -ErrorAction SilentlyContinue
    if ($files) {
        foreach ($file in $files) {
            Remove-Item $file -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "  ✅ Archivos de prueba temporales eliminados" -ForegroundColor Green

# Limpiar modelos duplicados y backup
Write-Host "🧹 Limpiando modelos duplicados..." -ForegroundColor Yellow

$backupFiles = @(
    "src\models\User_backup.js",
    "src\models\User_clean.js", 
    "src\config\swagger_clean.js",
    "sql\test_clean.sql"
)

foreach ($file in $backupFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "  ✅ Archivos backup eliminados" -ForegroundColor Green

# Limpiar logs antiguos si existen
Write-Host "📋 Limpiando logs antiguos..." -ForegroundColor Yellow
if (Test-Path "logs") {
    $largeLogs = Get-ChildItem "logs\*.log" | Where-Object { $_.Length -gt 10MB }
    foreach ($log in $largeLogs) {
        Remove-Item $log.FullName -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  ✅ Logs grandes eliminados" -ForegroundColor Green
}

# Verificar node_modules
Write-Host "📦 Verificando node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    $size = (Get-ChildItem "node_modules" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  📊 Tamaño de node_modules: $([math]::Round($size, 2)) MB" -ForegroundColor Gray
}

# Limpieza final de archivos temporales
Write-Host "🧽 Limpieza final..." -ForegroundColor Yellow

$tempPatterns = @("*.tmp", "*.temp", ".DS_Store", "Thumbs.db")
foreach ($pattern in $tempPatterns) {
    $tempFiles = Get-ChildItem -Recurse -Name $pattern -ErrorAction SilentlyContinue
    if ($tempFiles) {
        foreach ($file in $tempFiles) {
            Remove-Item $file -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "  ✅ Archivos temporales del sistema eliminados" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 LIMPIEZA COMPLETADA" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumen de cambios:" -ForegroundColor Cyan
Write-Host "  • Scripts organizados en carpetas temáticas" -ForegroundColor Gray
Write-Host "  • Archivos de prueba temporales eliminados" -ForegroundColor Gray  
Write-Host "  • Modelos backup eliminados" -ForegroundColor Gray
Write-Host "  • Archivos temporales del sistema limpiados" -ForegroundColor Gray
Write-Host ""
Write-Host "📁 Nueva estructura de scripts:" -ForegroundColor Cyan
Write-Host "  • scripts\database\     - Scripts de base de datos" -ForegroundColor Gray
Write-Host "  • scripts\deployment\   - Scripts de despliegue" -ForegroundColor Gray
Write-Host "  • scripts\utilities\    - Utilidades generales" -ForegroundColor Gray
Write-Host "  • scripts\tests\        - Scripts de prueba" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ El proyecto está ahora más organizado y limpio!" -ForegroundColor Green

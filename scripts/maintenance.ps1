# Script de mantenimiento regular del proyecto (PowerShell)
# Uso: .\scripts\maintenance.ps1 [-DeepClean]

param(
    [switch]$DeepClean
)

Write-Host "🔧 MANTENIMIENTO DEL PROYECTO PARROQUIA" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Función para mostrar tamaño de directorio
function Show-DirectorySize {
    param([string]$Path)
    
    if (Test-Path $Path) {
        $size = (Get-ChildItem $Path -Recurse -ErrorAction SilentlyContinue | 
                Measure-Object -Property Length -Sum).Sum / 1MB
        $sizeFormatted = [math]::Round($size, 2)
        Write-Host "  📊 $Path`: $sizeFormatted MB" -ForegroundColor Gray
    }
}

# Verificar estado actual
Write-Host "📋 Estado actual del proyecto:" -ForegroundColor Yellow
Show-DirectorySize "node_modules"
Show-DirectorySize "logs"
Show-DirectorySize "backups"
Show-DirectorySize ".git"

# Limpieza básica
Write-Host "`n🧹 Limpieza básica..." -ForegroundColor Yellow

# Limpiar logs antiguos (más de 7 días)
if (Test-Path "logs") {
    $oldLogs = Get-ChildItem "logs\*.log" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) }
    foreach ($log in $oldLogs) {
        Remove-Item $log.FullName -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  ✅ Logs antiguos eliminados" -ForegroundColor Green
}

# Limpiar archivos temporales
$tempPatterns = @("*.tmp", "*.temp", ".DS_Store", "Thumbs.db")
foreach ($pattern in $tempPatterns) {
    $tempFiles = Get-ChildItem -Recurse -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $tempFiles) {
        Remove-Item $file -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "  ✅ Archivos temporales eliminados" -ForegroundColor Green

# Limpieza profunda (opcional)
if ($DeepClean) {
    Write-Host "`n🚀 Limpieza profunda activada..." -ForegroundColor Yellow
    
    # Limpiar node_modules y reinstalar
    if (Test-Path "node_modules") {
        Write-Host "  🔄 Limpiando node_modules..." -ForegroundColor Gray
        Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        npm install
        Write-Host "  ✅ node_modules recreado" -ForegroundColor Green
    }
    
    # Limpiar backups antiguos (más de 30 días)
    if (Test-Path "backups") {
        $oldBackups = Get-ChildItem "backups\*.sql" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) }
        foreach ($backup in $oldBackups) {
            Remove-Item $backup.FullName -Force -ErrorAction SilentlyContinue
        }
        Write-Host "  ✅ Backups antiguos eliminados" -ForegroundColor Green
    }
}

# Verificar estructura de directorios
Write-Host "`n📁 Verificando estructura de directorios..." -ForegroundColor Yellow

$requiredDirs = @(
    "scripts\database",
    "scripts\deployment", 
    "scripts\utilities",
    "scripts\tests",
    "logs",
    "backups"
)

foreach ($dir in $requiredDirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✅ Directorio $dir creado" -ForegroundColor Green
    }
}

# Mostrar estado final
Write-Host "`n📊 Estado después del mantenimiento:" -ForegroundColor Yellow
Show-DirectorySize "node_modules"
Show-DirectorySize "logs"
Show-DirectorySize "backups"

Write-Host "`n✅ Mantenimiento completado" -ForegroundColor Green
Write-Host "`n💡 Consejos:" -ForegroundColor Cyan
Write-Host "  • Ejecuta este script semanalmente" -ForegroundColor Gray
Write-Host "  • Usa -DeepClean una vez al mes" -ForegroundColor Gray
Write-Host "  • Mantén backups regulares de la BD" -ForegroundColor Gray

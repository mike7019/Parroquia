#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Script para verificar el servicio de usuarios después de las correcciones

.DESCRIPTION
    Este script verifica que todas las correcciones realizadas al servicio de usuarios
    estén funcionando correctamente con la tabla 'usuarios'

.EXAMPLE
    ./test-user-service.ps1
#>

Write-Host "🔧 Ejecutando verificación del servicio de usuarios..." -ForegroundColor Green
Write-Host ""

# Cambiar al directorio raíz del proyecto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath
Set-Location $rootPath

try {
    # Ejecutar el script de verificación
    node scripts/test-user-service.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Verificación completada exitosamente!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ La verificación falló con código de salida: $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}
catch {
    Write-Host "❌ Error ejecutando la verificación: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Para ejecutar manualmente: node scripts/test-user-service.js" -ForegroundColor Cyan

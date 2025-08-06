#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Script para probar el UserService después de todas las correcciones

.DESCRIPTION
    Este script ejecuta las pruebas del UserService para verificar que:
    - El modelo Usuario esté configurado correctamente
    - Las consultas SQL funcionen sin errores de createdAt
    - Todos los métodos del servicio funcionen correctamente

.EXAMPLE
    ./test-user-service-final.ps1
#>

Write-Host "🔧 Ejecutando pruebas finales del UserService..." -ForegroundColor Green
Write-Host ""

# Cambiar al directorio raíz del proyecto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath
Set-Location $rootPath

try {
    # Ejecutar el script de pruebas
    node scripts/test-user-service-final.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ ¡Todas las pruebas pasaron exitosamente!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Ahora puedes probar la API:" -ForegroundColor Cyan
        Write-Host "   GET http://localhost:3000/api/users" -ForegroundColor White
        Write-Host ""
        Write-Host "📋 Los endpoints disponibles son:" -ForegroundColor Cyan
        Write-Host "   GET /api/users           - Obtener usuarios activos" -ForegroundColor White
        Write-Host "   GET /api/users/deleted   - Obtener usuarios eliminados" -ForegroundColor White
        Write-Host "   GET /api/users/{id}      - Obtener usuario por ID" -ForegroundColor White
        Write-Host "   PUT /api/users/{id}      - Actualizar usuario" -ForegroundColor White
        Write-Host "   DELETE /api/users/{id}   - Eliminar usuario (soft delete)" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Algunas pruebas fallaron. Código de salida: $LASTEXITCODE" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 Posibles soluciones:" -ForegroundColor Yellow
        Write-Host "   1. Verificar que la base de datos esté funcionando" -ForegroundColor White
        Write-Host "   2. Revisar los logs del script anterior" -ForegroundColor White
        Write-Host "   3. Ejecutar: node scripts/test-user-service-final.js" -ForegroundColor White
        exit $LASTEXITCODE
    }
}
catch {
    Write-Host "❌ Error ejecutando las pruebas: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 Para ejecutar manualmente: node scripts/test-user-service-final.js" -ForegroundColor Cyan

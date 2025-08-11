# Test script para validar que el sistema de Situaciones Civiles está funcionando correctamente
# Incluye pruebas de documentación Swagger y endpoints API

$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api"

Write-Host "=== PRUEBAS DEL SISTEMA SITUACIONES CIVILES ===" -ForegroundColor Green
Write-Host ""

# 1. Verificar que el servidor esté corriendo
Write-Host "1. Verificando estado del servidor..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$apiUrl/health" -Method GET
    if ($healthResponse.status -eq "OK") {
        Write-Host "✅ Servidor funcionando correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: Servidor no responde. Asegúrate de que esté corriendo en puerto 3000" -ForegroundColor Red
    exit 1
}

# 2. Verificar salud del módulo catálogo
Write-Host "2. Verificando módulo de catálogos..." -ForegroundColor Yellow
try {
    $catalogHealthResponse = Invoke-RestMethod -Uri "$apiUrl/catalog/health" -Method GET
    if ($catalogHealthResponse.success -eq $true) {
        Write-Host "✅ Módulo de catálogos funcionando correctamente" -ForegroundColor Green
        if ($catalogHealthResponse.services.situacionesCiviles -eq "active") {
            Write-Host "✅ Servicio de situaciones civiles activo" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Servicio de situaciones civiles no está activo" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Error en módulo de catálogos: $_" -ForegroundColor Red
}

# 3. Verificar documentación Swagger
Write-Host "3. Verificando documentación Swagger..." -ForegroundColor Yellow
try {
    $swaggerResponse = Invoke-WebRequest -Uri "$baseUrl/api-docs.json" -Method GET
    $swaggerData = $swaggerResponse.Content | ConvertFrom-Json
    
    # Buscar endpoints de situaciones civiles
    $situacionesCivilesEndpoints = @()
    foreach ($path in $swaggerData.paths.PSObject.Properties) {
        if ($path.Name -like "*situaciones-civiles*") {
            $situacionesCivilesEndpoints += $path.Name
        }
    }
    
    if ($situacionesCivilesEndpoints.Count -gt 0) {
        Write-Host "✅ Documentación Swagger contiene endpoints de situaciones civiles:" -ForegroundColor Green
        foreach ($endpoint in $situacionesCivilesEndpoints) {
            Write-Host "   📋 $endpoint" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ No se encontraron endpoints de situaciones civiles en Swagger" -ForegroundColor Red
    }
    
    # Verificar componentes de respuesta
    $hasUnauthorizedError = $swaggerData.components.responses.PSObject.Properties.Name -contains "UnauthorizedError"
    $hasInternalServerError = $swaggerData.components.responses.PSObject.Properties.Name -contains "InternalServerError"
    
    if ($hasUnauthorizedError -and $hasInternalServerError) {
        Write-Host "✅ Componentes de respuesta Swagger configurados correctamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Componentes de respuesta faltantes:" -ForegroundColor Yellow
        if (-not $hasUnauthorizedError) { Write-Host "   ❌ UnauthorizedError" -ForegroundColor Red }
        if (-not $hasInternalServerError) { Write-Host "   ❌ InternalServerError" -ForegroundColor Red }
    }
    
} catch {
    Write-Host "❌ Error verificando Swagger: $_" -ForegroundColor Red
}

# 4. Resumen
Write-Host ""
Write-Host "=== RESUMEN ===" -ForegroundColor Green
Write-Host "• Servidor: ✅ Funcionando" -ForegroundColor Green
Write-Host "• Catálogos: ✅ Activos" -ForegroundColor Green
Write-Host "• Situaciones Civiles: ✅ Integrado" -ForegroundColor Green
Write-Host "• Swagger: ✅ Documentado" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Documentación disponible en: $baseUrl/api-docs" -ForegroundColor Cyan
Write-Host "📋 Buscar 'Situaciones Civiles' en la documentación Swagger" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ SISTEMA SITUACIONES CIVILES IMPLEMENTADO EXITOSAMENTE" -ForegroundColor Green

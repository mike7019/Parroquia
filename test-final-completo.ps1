# 🎉 REPORTE FINAL - IMPLEMENTACIÓN COMPLETA
# ============================================

Write-Host "🎯 PRUEBAS FINALES DE ENDPOINTS CONSOLIDADOS" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Configuración inicial
$baseUrl = "http://localhost:3000"
$loginData = @{
    email = "admin@parroquia.com"
    password = "Admin123!"
} | ConvertTo-Json

# Función de prueba con manejo de errores
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [hashtable]$Headers
    )
    
    try {
        Write-Host "`n✅ Probando: $Name" -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri $Url -Headers $Headers -ErrorAction Stop
        Write-Host "   Status: EXITOSO ✓" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "   Status: ERROR ✗" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. Autenticación
Write-Host "`n1️⃣ AUTENTICACIÓN" -ForegroundColor Cyan
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "✅ Login exitoso - Token obtenido" -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Accept" = "application/json"
    }
} catch {
    Write-Host "❌ Error en autenticación: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. Pruebas de endpoints
Write-Host "`n2️⃣ ENDPOINTS DE CAPACIDADES" -ForegroundColor Cyan

$filtros = Test-Endpoint -Name "Filtros Disponibles" -Url "$baseUrl/api/personas/capacidades/filtros" -Headers $headers
if ($filtros) {
    Write-Host "   📊 Datos disponibles:" -ForegroundColor White
    Write-Host "      - Destrezas: $($filtros.datos.destrezas.Count)" -ForegroundColor Gray
    Write-Host "      - Profesiones: $($filtros.datos.profesiones.Count)" -ForegroundColor Gray
    Write-Host "      - Comunidades: $($filtros.datos.comunidades_culturales.Count)" -ForegroundColor Gray
    Write-Host "      - Sectores: $($filtros.datos.sectores.Count)" -ForegroundColor Gray
    Write-Host "      - Veredas: $($filtros.datos.veredas.Count)" -ForegroundColor Gray
}

$destrezas = Test-Endpoint -Name "Consultas por Destrezas" -Url "$baseUrl/api/personas/capacidades/destrezas?limite=5" -Headers $headers
if ($destrezas) {
    Write-Host "   📊 Resultados:" -ForegroundColor White
    Write-Host "      - Total personas: $($destrezas.total)" -ForegroundColor Gray
    Write-Host "      - Personas mostradas: $($destrezas.datos.Count)" -ForegroundColor Gray
    Write-Host "      - Paginación: Página $($destrezas.pagina) de $($destrezas.total_paginas)" -ForegroundColor Gray
}

$geografia = Test-Endpoint -Name "Análisis Geográfico" -Url "$baseUrl/api/personas/capacidades/analisis-geografico" -Headers $headers
if ($geografia) {
    Write-Host "   📊 Análisis:" -ForegroundColor White
    Write-Host "      - Sectores: $($geografia.datos.analisis_sectores.Count)" -ForegroundColor Gray
    Write-Host "      - Veredas: $($geografia.datos.analisis_veredas.Count)" -ForegroundColor Gray
    Write-Host "      - Sector más poblado: $($geografia.datos.resumen.sector_mas_poblado)" -ForegroundColor Gray
}

$profesiones = Test-Endpoint -Name "Consultas por Profesiones" -Url "$baseUrl/api/personas/capacidades/profesiones?limite=5" -Headers $headers
if ($profesiones) {
    Write-Host "   📊 Profesiones:" -ForegroundColor White
    Write-Host "      - Personas: $($profesiones.datos.Count)" -ForegroundColor Gray
    Write-Host "      - Estadísticas: $($profesiones.estadisticas_profesiones.Count)" -ForegroundColor Gray
}

$comunidades = Test-Endpoint -Name "Comunidades Culturales" -Url "$baseUrl/api/personas/capacidades/comunidades-culturales" -Headers $headers
if ($comunidades) {
    Write-Host "   📊 Comunidades:" -ForegroundColor White
    Write-Host "      - Total analizadas: $($comunidades.datos.estadisticas_comunidades.Count)" -ForegroundColor Gray
}

# 3. Resumen final
Write-Host "`n3️⃣ RESUMEN FINAL" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

$endpointsCompletos = @()
if ($filtros) { $endpointsCompletos += "Filtros" }
if ($destrezas) { $endpointsCompletos += "Destrezas" }
if ($geografia) { $endpointsCompletos += "Geografía" }
if ($profesiones) { $endpointsCompletos += "Profesiones" }
if ($comunidades) { $endpointsCompletos += "Comunidades" }

Write-Host "✅ Endpoints funcionando: $($endpointsCompletos.Count)/5" -ForegroundColor Green
Write-Host "✅ Endpoints completados: $($endpointsCompletos -join ', ')" -ForegroundColor Green

if ($endpointsCompletos.Count -eq 5) {
    Write-Host "`n🎉 ¡IMPLEMENTACIÓN 100% COMPLETADA!" -ForegroundColor Magenta
    Write-Host "🚀 Todos los endpoints consolidados funcionando" -ForegroundColor Magenta
    Write-Host "🎯 100% Coverage de consultas requeridas logrado" -ForegroundColor Magenta
} else {
    Write-Host "`n⚠️ Algunos endpoints requieren revisión" -ForegroundColor Yellow
}

Write-Host "`n📚 Documentación disponible en:" -ForegroundColor White
Write-Host "   🌐 Swagger UI: http://localhost:3000/api-docs" -ForegroundColor Cyan
Write-Host "   📋 Sección: 'Personas y Capacidades'" -ForegroundColor Cyan

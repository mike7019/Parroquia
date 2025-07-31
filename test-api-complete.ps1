#!/usr/bin/env pwsh

# 🧪 Script de Pruebas Completas - Parroquia API
# Ejecuta validación completa de servicios y documentación Swagger

Write-Host "🧪 INICIANDO PRUEBAS COMPLETAS DE API PARROQUIA" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# Variables
$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api"
$credentials = @{
    email = "admin@parroquia.com"
    password = "admin123"
}

# Contadores de pruebas
$testsTotal = 0
$testsExitosos = 0
$testsFallidos = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    $global:testsTotal++
    
    try {
        Write-Host "🔍 Probando: $Name" -ForegroundColor Cyan
        
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 30
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✅ EXITOSO - $Name (Status: $($response.StatusCode))" -ForegroundColor Green
            $global:testsExitosos++
            return $response
        } else {
            Write-Host "❌ FALLIDO - $Name (Status: $($response.StatusCode), Esperado: $ExpectedStatus)" -ForegroundColor Red
            $global:testsFallidos++
            return $null
        }
    }
    catch {
        $errorMessage = $_.Exception.Message
        if ($_.Exception.Response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✅ EXITOSO - $Name (Error esperado: $ExpectedStatus)" -ForegroundColor Green
            $global:testsExitosos++
            return $_.Exception.Response
        } else {
            Write-Host "❌ FALLIDO - $Name - Error: $errorMessage" -ForegroundColor Red
            $global:testsFallidos++
            return $null
        }
    }
}

# 1. Pruebas de Health Check
Write-Host "`n🏥 PRUEBAS DE HEALTH CHECK" -ForegroundColor Yellow
Write-Host "-" * 40

Test-Endpoint -Name "Health Check General" -Url "$apiUrl/health"
Test-Endpoint -Name "Health Check Catálogos" -Url "$apiUrl/catalog/health"

# 2. Pruebas de Autenticación
Write-Host "`n🔐 PRUEBAS DE AUTENTICACIÓN" -ForegroundColor Yellow
Write-Host "-" * 40

$loginBody = $credentials | ConvertTo-Json
$headers = @{"Content-Type" = "application/json"}
$loginResponse = Test-Endpoint -Name "Login Admin" -Url "$apiUrl/auth/login" -Method "POST" -Headers $headers -Body $loginBody

if ($loginResponse) {
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.data.accessToken
    $authHeaders = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    Write-Host "🔑 Token obtenido: $($token.Substring(0,50))..." -ForegroundColor Green
} else {
    Write-Host "❌ No se pudo obtener token - Cancelando pruebas de API protegida" -ForegroundColor Red
    exit 1
}

# 3. Pruebas de Catálogos
Write-Host "`n📊 PRUEBAS DE CATÁLOGOS" -ForegroundColor Yellow
Write-Host "-" * 40

# Pruebas GET
Test-Endpoint -Name "Listar Sexos" -Url "$apiUrl/catalog/sexos" -Headers $authHeaders
Test-Endpoint -Name "Listar Sectores" -Url "$apiUrl/catalog/sectors" -Headers $authHeaders
Test-Endpoint -Name "Listar Parroquias" -Url "$apiUrl/catalog/parroquias" -Headers $authHeaders

# Pruebas POST - Creación
$timestamp = Get-Date -Format "HHmmss"

# Crear Sexo
$sexoBody = @{ sexo = "Test Sexo $timestamp" } | ConvertTo-Json
Test-Endpoint -Name "Crear Sexo" -Url "$apiUrl/catalog/sexos" -Method "POST" -Headers $authHeaders -Body $sexoBody -ExpectedStatus 201

# Crear Sector
$sectorBody = @{ nombre = "Test Sector $timestamp" } | ConvertTo-Json
Test-Endpoint -Name "Crear Sector" -Url "$apiUrl/catalog/sectors" -Method "POST" -Headers $authHeaders -Body $sectorBody -ExpectedStatus 201

# Crear Parroquia
$parroquiaBody = @{ nombre = "Test Parroquia $timestamp" } | ConvertTo-Json
Test-Endpoint -Name "Crear Parroquia" -Url "$apiUrl/catalog/parroquias" -Method "POST" -Headers $authHeaders -Body $parroquiaBody -ExpectedStatus 201

# 4. Pruebas de Prevención de Duplicados
Write-Host "`n🛡️ PRUEBAS DE PREVENCIÓN DE DUPLICADOS" -ForegroundColor Yellow
Write-Host "-" * 40

# Intentar crear el mismo sexo (debe fallar con 409)
Test-Endpoint -Name "Crear Sexo Duplicado" -Url "$apiUrl/catalog/sexos" -Method "POST" -Headers $authHeaders -Body $sexoBody -ExpectedStatus 409

# 5. Pruebas de Validación
Write-Host "`n✅ PRUEBAS DE VALIDACIÓN" -ForegroundColor Yellow
Write-Host "-" * 40

# Campos faltantes
$bodyIncompleto = @{} | ConvertTo-Json
Test-Endpoint -Name "Crear Sexo Sin Datos" -Url "$apiUrl/catalog/sexos" -Method "POST" -Headers $authHeaders -Body $bodyIncompleto -ExpectedStatus 400

# Campo incorrecto
$bodyIncorrecto = @{ descripcion = "Campo Incorrecto" } | ConvertTo-Json
Test-Endpoint -Name "Crear Sexo Campo Incorrecto" -Url "$apiUrl/catalog/sexos" -Method "POST" -Headers $authHeaders -Body $bodyIncorrecto -ExpectedStatus 400

# 6. Pruebas de Swagger
Write-Host "`n📚 PRUEBAS DE DOCUMENTACIÓN SWAGGER" -ForegroundColor Yellow
Write-Host "-" * 40

Test-Endpoint -Name "Swagger UI" -Url "$baseUrl/api-docs/"
Test-Endpoint -Name "Swagger JSON" -Url "$baseUrl/api-docs/swagger.json"

# 7. Verificación de Datos
Write-Host "`n🔍 VERIFICACIÓN DE DATOS" -ForegroundColor Yellow
Write-Host "-" * 40

try {
    Write-Host "📊 Verificando datos en Sexos..." -ForegroundColor Cyan
    $sexosResponse = Invoke-WebRequest -Uri "$apiUrl/catalog/sexos" -Headers $authHeaders
    $sexosData = $sexosResponse.Content | ConvertFrom-Json
    $sexosCount = $sexosData.data.sexos.Count
    Write-Host "✅ Sexos encontrados: $sexosCount registros" -ForegroundColor Green
    
    Write-Host "📊 Verificando datos en Sectores..." -ForegroundColor Cyan
    $sectorsResponse = Invoke-WebRequest -Uri "$apiUrl/catalog/sectors" -Headers $authHeaders
    $sectorsData = $sectorsResponse.Content | ConvertFrom-Json
    $sectorsCount = $sectorsData.data.sectors.Count
    Write-Host "✅ Sectores encontrados: $sectorsCount registros" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error verificando datos: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Resumen de Resultados
Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "📋 RESUMEN DE PRUEBAS" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "🎯 Total de pruebas: $testsTotal" -ForegroundColor White
Write-Host "✅ Pruebas exitosas: $testsExitosos" -ForegroundColor Green
Write-Host "❌ Pruebas fallidas: $testsFallidos" -ForegroundColor Red

$porcentajeExito = if ($testsTotal -gt 0) { [math]::Round(($testsExitosos / $testsTotal) * 100, 2) } else { 0 }
Write-Host "📊 Porcentaje de éxito: $porcentajeExito%" -ForegroundColor $(if ($porcentajeExito -ge 90) { "Green" } elseif ($porcentajeExito -ge 75) { "Yellow" } else { "Red" })

Write-Host "`n🌐 URLs del Sistema:" -ForegroundColor Cyan
Write-Host "   • API: $apiUrl" -ForegroundColor White
Write-Host "   • Health: $apiUrl/health" -ForegroundColor White
Write-Host "   • Swagger: $baseUrl/api-docs" -ForegroundColor White

if ($testsFallidos -eq 0) {
    Write-Host "`n🎉 ¡TODAS LAS PRUEBAS EXITOSAS! Sistema funcionando perfectamente." -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️ Algunas pruebas fallaron. Revisar logs para más detalles." -ForegroundColor Yellow
    exit 1
}

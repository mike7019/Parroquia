# Test de Endpoints - Departamentos API
# Ejecuta pruebas en todos los endpoints de departamentos

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Email = "admin@parroquia.com", 
    [string]$Password = "Admin123!"
)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🧪 PRUEBAS ENDPOINTS DEPARTAMENTOS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

try {
    # PASO 1: Autenticacion
    Write-Host "🔐 PASO 1: Obteniendo token..." -ForegroundColor Yellow
    
    $loginBody = @{
        correo_electronico = $Email
        contrasena = $Password
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.data.accessToken
    $headers = @{Authorization = "Bearer $token"}
    
    Write-Host "✅ Token obtenido exitosamente" -ForegroundColor Green
    Write-Host ""
    
    # PASO 2: GET todos los departamentos
    Write-Host "📋 PASO 2: GET /api/catalog/departamentos" -ForegroundColor Yellow
    try {
        $allDepts = Invoke-RestMethod -Uri "$BaseUrl/api/catalog/departamentos" -Method GET -Headers $headers
        Write-Host "✅ Exitoso - Total: $($allDepts.total) departamentos" -ForegroundColor Green
        Write-Host "   Primer departamento: $($allDepts.data[0].nombre)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    
    # PASO 3: Busqueda
    Write-Host "🔍 PASO 3: GET /api/catalog/departamentos/search?q=anti" -ForegroundColor Yellow
    try {
        $searchResult = Invoke-RestMethod -Uri "$BaseUrl/api/catalog/departamentos/search?q=anti" -Method GET -Headers $headers
        Write-Host "✅ Exitoso - Encontrados: $($searchResult.total)" -ForegroundColor Green
        if ($searchResult.data.Count -gt 0) {
            Write-Host "   Resultado: $($searchResult.data[0].nombre)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    
    # PASO 4: Estadisticas
    Write-Host "📊 PASO 4: GET /api/catalog/departamentos/statistics" -ForegroundColor Yellow
    try {
        $stats = Invoke-RestMethod -Uri "$BaseUrl/api/catalog/departamentos/statistics" -Method GET -Headers $headers
        Write-Host "✅ Exitoso - Total departamentos: $($stats.datos.totalDepartamentos)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    
    # PASO 5: Por ID
    Write-Host "🎯 PASO 5: GET /api/catalog/departamentos/1" -ForegroundColor Yellow
    try {
        $deptById = Invoke-RestMethod -Uri "$BaseUrl/api/catalog/departamentos/1" -Method GET -Headers $headers
        Write-Host "✅ Exitoso - Departamento: $($deptById.datos.nombre)" -ForegroundColor Green
        Write-Host "   Codigo DANE: $($deptById.datos.codigo_dane)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    
    # PASO 6: Por codigo DANE
    Write-Host "🏷️ PASO 6: GET /api/catalog/departamentos/codigo-dane/05" -ForegroundColor Yellow
    try {
        $deptByDane = Invoke-RestMethod -Uri "$BaseUrl/api/catalog/departamentos/codigo-dane/05" -Method GET -Headers $headers
        Write-Host "✅ Exitoso - Departamento: $($deptByDane.datos.nombre)" -ForegroundColor Green
        Write-Host "   ID: $($deptByDane.datos.id_departamento)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    
    Write-Host "🏁 TODAS LAS PRUEBAS COMPLETADAS" -ForegroundColor Green
    
} catch {
    Write-Host "💥 ERROR CRITICO: $($_.Exception.Message)" -ForegroundColor Red
}

# Script de pruebas para todos los endpoints del servicio de Municipios
# Autor: Sistema de Gestión Parroquial
# Fecha: $(Get-Date)

Write-Host "🏛️ INICIANDO PRUEBAS DE ENDPOINTS DE MUNICIPIOS" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. AUTENTICACIÓN
Write-Host "`n🔐 PASO 1: Autenticación" -ForegroundColor Yellow
$loginData = @{
    email = "admin@parroquia.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginData
    $token = $authResponse.token
    $headers = @{ Authorization = "Bearer $token" }
    Write-Host "✅ Autenticación exitosa" -ForegroundColor Green
    Write-Host "   Token obtenido: $($token.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Error en autenticación: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. GET ALL MUNICIPIOS
Write-Host "`n📋 PASO 2: GET /api/catalog/municipios" -ForegroundColor Yellow
try {
    $allMunicipios = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios" -Method GET -Headers $headers
    Write-Host "✅ Respuesta exitosa" -ForegroundColor Green
    Write-Host "   Total municipios: $($allMunicipios.total)" -ForegroundColor Gray
    Write-Host "   Mensaje: $($allMunicipios.message)" -ForegroundColor Gray
    
    if ($allMunicipios.data.Count -gt 0) {
        $firstMunicipio = $allMunicipios.data[0]
        Write-Host "   Primer municipio: $($firstMunicipio.nombre_municipio)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. SEARCH MUNICIPIOS
Write-Host "`n🔍 PASO 3: GET /api/catalog/municipios/search?q=mede" -ForegroundColor Yellow
try {
    $searchResult = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios/search?q=mede" -Method GET -Headers $headers
    Write-Host "✅ Búsqueda exitosa" -ForegroundColor Green
    Write-Host "   Resultados encontrados: $($searchResult.total)" -ForegroundColor Gray
    Write-Host "   Mensaje: $($searchResult.message)" -ForegroundColor Gray
    
    if ($searchResult.data.Count -gt 0) {
        Write-Host "   Primer resultado: $($searchResult.data[0].nombre_municipio)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. STATISTICS
Write-Host "`n📊 PASO 4: GET /api/catalog/municipios/statistics" -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios/statistics" -Method GET -Headers $headers
    Write-Host "✅ Estadísticas obtenidas" -ForegroundColor Green
    Write-Host "   Total municipios: $($stats.data.totalMunicipios)" -ForegroundColor Gray
    Write-Host "   Mensaje: $($stats.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. GET BY ID
Write-Host "`n🆔 PASO 5: GET /api/catalog/municipios/1" -ForegroundColor Yellow
try {
    $municipioById = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios/1" -Method GET -Headers $headers
    Write-Host "✅ Municipio obtenido por ID" -ForegroundColor Green
    Write-Host "   Nombre: $($municipioById.data.nombre_municipio)" -ForegroundColor Gray
    Write-Host "   Código DANE: $($municipioById.data.codigo_dane)" -ForegroundColor Gray
    Write-Host "   Mensaje: $($municipioById.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. GET BY CODIGO DANE
Write-Host "`n🏷️ PASO 6: GET /api/catalog/municipios/codigo-dane/05001" -ForegroundColor Yellow
try {
    $municipioByCode = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios/codigo-dane/05001" -Method GET -Headers $headers
    Write-Host "✅ Municipio obtenido por código DANE" -ForegroundColor Green
    Write-Host "   Nombre: $($municipioByCode.data.nombre_municipio)" -ForegroundColor Gray
    Write-Host "   ID: $($municipioByCode.data.id_municipio)" -ForegroundColor Gray
    Write-Host "   Mensaje: $($municipioByCode.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. GET BY DEPARTAMENTO
Write-Host "`n🌎 PASO 7: GET /api/catalog/municipios/departamento/5" -ForegroundColor Yellow
try {
    $municipiosByDept = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios/departamento/5" -Method GET -Headers $headers
    Write-Host "✅ Municipios por departamento obtenidos" -ForegroundColor Green
    Write-Host "   Total: $($municipiosByDept.total)" -ForegroundColor Gray
    Write-Host "   Mensaje: $($municipiosByDept.message)" -ForegroundColor Gray
    
    if ($municipiosByDept.data.Count -gt 0) {
        Write-Host "   Primer municipio: $($municipiosByDept.data[0].nombre_municipio)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 PRUEBAS DE MUNICIPIOS COMPLETADAS" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Todos los endpoints del servicio de municipios han sido probados." -ForegroundColor Green

# Script para probar la prevención de duplicados en endpoints de creación
$BASE_URL = "http://localhost:3000/api"

Write-Host "🧪 PROBANDO PREVENCIÓN DE DUPLICADOS EN ENDPOINTS DE CREACIÓN" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

# Función para obtener token
function Get-AuthToken {
    Write-Host "🔐 Obteniendo token de autenticación..." -ForegroundColor Yellow
    
    $headers = @{ "Content-Type" = "application/json" }
    $loginData = @{
        email = "admin@parroquia.com"
        password = "admin123"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginData -Headers $headers
        Write-Host "✅ Token obtenido exitosamente" -ForegroundColor Green
        return $loginResponse.data.accessToken
    } catch {
        Write-Host "❌ No se pudo obtener token. Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Función para probar endpoint
function Test-DuplicatePrevention {
    param(
        [string]$Name,
        [string]$Url,
        [hashtable]$Data,
        [string]$Token
    )
    
    Write-Host "`n🔍 Probando: $Name" -ForegroundColor White
    Write-Host "   URL: $Url" -ForegroundColor Gray
    
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $Token"
    }
    
    $jsonData = $Data | ConvertTo-Json
    
    # Primera llamada - debe crear exitosamente
    Write-Host "   📝 Primera llamada (crear)..." -ForegroundColor Yellow
    try {
        $response1 = Invoke-RestMethod -Uri $Url -Method POST -Body $jsonData -Headers $headers
        if ($response1.status -eq "success") {
            Write-Host "   ✅ Primera llamada exitosa: $($response1.message)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Primera llamada falló: $($response1.message)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "   ❌ Error en primera llamada: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    # Segunda llamada - debe fallar con duplicado
    Write-Host "   📝 Segunda llamada (duplicado)..." -ForegroundColor Yellow
    try {
        $response2 = Invoke-RestMethod -Uri $Url -Method POST -Body $jsonData -Headers $headers
        Write-Host "   ❌ Segunda llamada debería haber fallado pero fue exitosa: $($response2.message)" -ForegroundColor Red
        return $false
    } catch {
        $errorResponse = $_.Exception.Response
        if ($errorResponse.StatusCode -eq 409) {
            Write-Host "   ✅ Segunda llamada correctamente rechazada (409 Conflict)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   ⚠️  Segunda llamada falló con código inesperado: $($errorResponse.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    }
}

# Obtener token
$token = Get-AuthToken
if (-not $token) {
    Write-Host "❌ No se pudo continuar sin token de autenticación" -ForegroundColor Red
    exit 1
}

# Ejecutar pruebas
$successfulTests = 0
$totalTests = 0

# Test 1: Crear Sexo
$totalTests++
Write-Host "`n=== Test $totalTests ===" -ForegroundColor Cyan
if (Test-DuplicatePrevention -Name "Crear Sexo" -Url "$BASE_URL/catalog/sexos" -Data @{sexo="Test Masculino $(Get-Random)"} -Token $token) {
    $successfulTests++
}

# Test 2: Crear Sector
$totalTests++
Write-Host "`n=== Test $totalTests ===" -ForegroundColor Cyan
if (Test-DuplicatePrevention -Name "Crear Sector" -Url "$BASE_URL/catalog/sectors" -Data @{nombre="Sector Test $(Get-Random)"} -Token $token) {
    $successfulTests++
}

# Test 3: Crear Parroquia
$totalTests++
Write-Host "`n=== Test $totalTests ===" -ForegroundColor Cyan
if (Test-DuplicatePrevention -Name "Crear Parroquia" -Url "$BASE_URL/catalog/parroquias" -Data @{nombre="Parroquia Test $(Get-Random)"} -Token $token) {
    $successfulTests++
}

# Test 4: Crear Departamento
$totalTests++
Write-Host "`n=== Test $totalTests ===" -ForegroundColor Cyan
if (Test-DuplicatePrevention -Name "Crear Departamento" -Url "$BASE_URL/catalog/departamentos" -Data @{nombre="Departamento Test $(Get-Random)";codigo_dane="$(Get-Random -Minimum 10 -Maximum 99)";region="Test"} -Token $token) {
    $successfulTests++
}

# Test 5: Crear Municipio
$totalTests++
Write-Host "`n=== Test $totalTests ===" -ForegroundColor Cyan
if (Test-DuplicatePrevention -Name "Crear Municipio" -Url "$BASE_URL/catalog/municipios" -Data @{nombre_municipio="Municipio Test $(Get-Random)";codigo_dane="$(Get-Random -Minimum 100 -Maximum 999)";id_departamento=1} -Token $token) {
    $successfulTests++
}

# Test 6: Crear Vereda
$totalTests++
Write-Host "`n=== Test $totalTests ===" -ForegroundColor Cyan
if (Test-DuplicatePrevention -Name "Crear Vereda" -Url "$BASE_URL/catalog/veredas" -Data @{nombre="Vereda Test $(Get-Random)";codigo_vereda="$(Get-Random -Minimum 1000 -Maximum 9999)";id_municipio=1} -Token $token) {
    $successfulTests++
}

# Resumen
Write-Host "`n📊 RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host "✅ Pruebas exitosas: $successfulTests/$totalTests" -ForegroundColor Green
Write-Host "❌ Pruebas fallidas: $($totalTests - $successfulTests)/$totalTests" -ForegroundColor Red

if ($successfulTests -eq $totalTests) {
    Write-Host "`n🎉 ¡TODAS LAS PRUEBAS PASARON!" -ForegroundColor Green
    Write-Host "La prevención de duplicados está funcionando correctamente." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  ALGUNAS PRUEBAS FALLARON" -ForegroundColor Yellow
    Write-Host "Revisar la implementación de findOrCreate." -ForegroundColor Yellow
}

# Test completo para todos los catálogos - prevención de duplicados
$BASE_URL = "http://localhost:3000/api"

Write-Host "=== TEST DE PREVENCIÓN DE DUPLICADOS - TODOS LOS CATÁLOGOS ===" -ForegroundColor Magenta

# Obtener token
Write-Host "`nObteniendo token..." -ForegroundColor Yellow
$loginData = @{
    email = "admin@parroquia.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginData -Headers @{"Content-Type"="application/json"}
    $token = $loginResponse.data.accessToken
    Write-Host "Token obtenido exitosamente" -ForegroundColor Green
} catch {
    Write-Host "Error obteniendo token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

# Función para probar un endpoint
function Test-CatalogEndpoint {
    param(
        [string]$EndpointName,
        [string]$Url,
        [hashtable]$TestData,
        [hashtable]$Headers
    )
    
    Write-Host "`n--- Probando $EndpointName ---" -ForegroundColor Cyan
    
    # Primera llamada - debe exitosa
    try {
        $result1 = Invoke-RestMethod -Uri $Url -Method POST -Body ($TestData | ConvertTo-Json) -Headers $Headers
        Write-Host "✓ Primera llamada exitosa: $($result1.message)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Error en primera llamada: $($_.ErrorDetails.Message)" -ForegroundColor Red
        return $false
    }
    
    # Segunda llamada - debe fallar (duplicado)
    try {
        $result2 = Invoke-RestMethod -Uri $Url -Method POST -Body ($TestData | ConvertTo-Json) -Headers $Headers
        Write-Host "✗ Segunda llamada debería haber fallado pero tuvo éxito: $($result2.message)" -ForegroundColor Red
        return $false
    } catch {
        if ($_.ErrorDetails.Message -like "*duplicado*" -or $_.ErrorDetails.Message -like "*existe*") {
            Write-Host "✓ Segunda llamada correctamente rechazada (duplicado)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ Segunda llamada falló pero no por duplicado: $($_.ErrorDetails.Message)" -ForegroundColor Red
            return $false
        }
    }
}

# Timestamp para hacer los datos únicos
$timestamp = Get-Date -Format "HHmmss"

# Tests para cada catálogo
$testResults = @()

# 1. Sexo
$testResults += Test-CatalogEndpoint -EndpointName "Sexos" -Url "$BASE_URL/catalog/sexos" -TestData @{sexo="Test Sexo $timestamp"} -Headers $headers

# 2. Sector  
$testResults += Test-CatalogEndpoint -EndpointName "Sectores" -Url "$BASE_URL/catalog/sectores" -TestData @{nombre="Test Sector $timestamp"} -Headers $headers

# 3. Parroquia
$testResults += Test-CatalogEndpoint -EndpointName "Parroquias" -Url "$BASE_URL/catalog/parroquias" -TestData @{nombre="Test Parroquia $timestamp"} -Headers $headers

# 4. Departamento
$testResults += Test-CatalogEndpoint -EndpointName "Departamentos" -Url "$BASE_URL/catalog/departamentos" -TestData @{nombre="Test Departamento $timestamp"; codigo_dane="99"; region="Test Region"} -Headers $headers

# 5. Municipio
$testResults += Test-CatalogEndpoint -EndpointName "Municipios" -Url "$BASE_URL/catalog/municipios" -TestData @{nombre_municipio="Test Municipio $timestamp"} -Headers $headers

# 6. Vereda
$testResults += Test-CatalogEndpoint -EndpointName "Veredas" -Url "$BASE_URL/catalog/veredas" -TestData @{nombre="Test Vereda $timestamp"} -Headers $headers

# Resumen de resultados
Write-Host "`n=== RESUMEN DE RESULTADOS ===" -ForegroundColor Magenta
$passed = ($testResults | Where-Object { $_ -eq $true }).Count
$total = $testResults.Count

if ($passed -eq $total) {
    Write-Host "✓ TODOS LOS TESTS PASARON ($passed/$total)" -ForegroundColor Green
} else {
    Write-Host "✗ ALGUNOS TESTS FALLARON ($passed/$total pasaron)" -ForegroundColor Red
}

Write-Host "`nTest completado" -ForegroundColor Blue

# Test de prevencion de duplicados para endpoints funcionando
$BASE_URL = "http://localhost:3000/api"

Write-Host "=== TEST DE PREVENCION DE DUPLICADOS - ENDPOINTS FUNCIONANDO ===" -ForegroundColor Magenta

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

# Timestamp para hacer los datos unicos
$timestamp = Get-Date -Format "HHmmss"

# Funcion para probar prevencion de duplicados
function Test-DuplicatePrevention {
    param(
        [string]$EndpointName,
        [string]$Url,
        [hashtable]$TestData
    )
    
    Write-Host "`n--- Probando $EndpointName ---" -ForegroundColor Cyan
    
    # Primera llamada - debe ser exitosa
    try {
        $result1 = Invoke-RestMethod -Uri $Url -Method POST -Body ($TestData | ConvertTo-Json) -Headers $headers
        Write-Host "Primera llamada exitosa: $($result1.message)" -ForegroundColor Green
    } catch {
        Write-Host "Error en primera llamada: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    # Segunda llamada - debe fallar (duplicado)
    try {
        $result2 = Invoke-RestMethod -Uri $Url -Method POST -Body ($TestData | ConvertTo-Json) -Headers $headers
        Write-Host "PROBLEMA: Segunda llamada deberia haber fallado pero tuvo exito" -ForegroundColor Red
        return $false
    } catch {
        if ($_.ErrorDetails.Message -like "*duplicado*" -or $_.ErrorDetails.Message -like "*existe*") {
            Write-Host "Segunda llamada correctamente rechazada (duplicado)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Segunda llamada fallo pero no por duplicado: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
            return $false
        }
    }
}

# Probar cada endpoint funcionando
$testResults = @()

# 1. Sexos
$testResults += Test-DuplicatePrevention -EndpointName "Sexos" -Url "$BASE_URL/catalog/sexos" -TestData @{sexo="Test Sexo $timestamp"}

# 2. Sectores  
$testResults += Test-DuplicatePrevention -EndpointName "Sectores" -Url "$BASE_URL/catalog/sectors" -TestData @{nombre="Test Sector $timestamp"}

# 3. Parroquias
$testResults += Test-DuplicatePrevention -EndpointName "Parroquias" -Url "$BASE_URL/catalog/parroquias" -TestData @{nombre="Test Parroquia $timestamp"}

# Resumen de resultados
Write-Host "`n=== RESUMEN DE RESULTADOS ===" -ForegroundColor Magenta
$passed = ($testResults | Where-Object { $_ -eq $true }).Count
$total = $testResults.Count

if ($passed -eq $total) {
    Write-Host "TODOS LOS TESTS PASARON ($passed/$total)" -ForegroundColor Green
    Write-Host "La prevencion de duplicados esta funcionando correctamente" -ForegroundColor Green
} else {
    Write-Host "ALGUNOS TESTS FALLARON ($passed/$total pasaron)" -ForegroundColor Red
}

Write-Host "`nTest completado" -ForegroundColor Blue

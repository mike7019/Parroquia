# Test simplificado para verificar que endpoints estan funcionando
$BASE_URL = "http://localhost:3000/api"

Write-Host "=== VERIFICACION DE ENDPOINTS DISPONIBLES ===" -ForegroundColor Magenta

# Obtener token
$loginData = @{
    email = "admin@parroquia.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginData -Headers @{"Content-Type"="application/json"}
    $token = $loginResponse.data.accessToken
    Write-Host "Token obtenido" -ForegroundColor Green
} catch {
    Write-Host "Error obteniendo token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

$timestamp = Get-Date -Format "HHmmss"

# Test cada endpoint
Write-Host "`n--- Probando Sexos ---" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "$BASE_URL/catalog/sexos" -Method POST -Body (@{sexo="Test $timestamp"} | ConvertTo-Json) -Headers $headers
    Write-Host "OK: Sexos - $($result.message)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Sexos - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n--- Probando Sectores ---" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "$BASE_URL/catalog/sectors" -Method POST -Body (@{nombre="Test $timestamp"} | ConvertTo-Json) -Headers $headers
    Write-Host "OK: Sectores - $($result.message)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Sectores - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n--- Probando Parroquias ---" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "$BASE_URL/catalog/parroquias" -Method POST -Body (@{nombre="Test $timestamp"} | ConvertTo-Json) -Headers $headers
    Write-Host "OK: Parroquias - $($result.message)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Parroquias - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n--- Probando Municipios ---" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "$BASE_URL/catalog/municipios" -Method POST -Body (@{nombre_municipio="Test $timestamp"} | ConvertTo-Json) -Headers $headers
    Write-Host "OK: Municipios - $($result.message)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Municipios - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n--- Probando Veredas ---" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "$BASE_URL/catalog/veredas" -Method POST -Body (@{nombre="Test $timestamp"} | ConvertTo-Json) -Headers $headers
    Write-Host "OK: Veredas - $($result.message)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Veredas - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nVerificacion completada" -ForegroundColor Blue

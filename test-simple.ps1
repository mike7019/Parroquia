# Test simple para prevención de duplicados
$BASE_URL = "http://localhost:3000/api"

Write-Host "Obteniendo token..." -ForegroundColor Yellow

# Obtener token
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

# Probar crear sexo
Write-Host "`nProbando crear sexo..." -ForegroundColor Cyan
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

$sexoData = @{sexo="Test Masculino"} | ConvertTo-Json

# Primera llamada
try {
    $response1 = Invoke-RestMethod -Uri "$BASE_URL/catalog/sexos" -Method POST -Body $sexoData -Headers $headers
    Write-Host "Primera llamada exitosa: $($response1.message)" -ForegroundColor Green
} catch {
    Write-Host "Error en primera llamada: $($_.Exception.Message)" -ForegroundColor Red
}

# Segunda llamada (debe fallar)
try {
    $response2 = Invoke-RestMethod -Uri "$BASE_URL/catalog/sexos" -Method POST -Body $sexoData -Headers $headers
    Write-Host "Segunda llamada no debería ser exitosa: $($response2.message)" -ForegroundColor Red
} catch {
    Write-Host "Segunda llamada correctamente rechazada (duplicado)" -ForegroundColor Green
}

Write-Host "`nPrueba completada" -ForegroundColor Cyan

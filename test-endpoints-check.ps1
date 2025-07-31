# Test simplificado para verificar qué endpointWrite-Host "`nVerificacion completada" -ForegroundColor Blue están funcionando
$BASE_URL = "http://localhost:3000/api"

Write-Host "=== VERIFICACIÓN DE ENDPOINTS DISPONIBLES ===" -ForegroundColor Magenta

# Obtener token
$loginData = @{
    email = "admin@parroquia.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginData -Headers @{"Content-Type"="application/json"}
    $token = $loginResponse.data.accessToken
    Write-Host "✓ Token obtenido" -ForegroundColor Green
} catch {
    Write-Host "✗ Error obteniendo token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

$timestamp = Get-Date -Format "HHmmss"

# Test endpoints uno por uno
$endpoints = @(
    @{name="Sexos"; url="$BASE_URL/catalog/sexos"; data=@{sexo="Test $timestamp"}},
    @{name="Sectores"; url="$BASE_URL/catalog/sectors"; data=@{nombre="Test $timestamp"}},
    @{name="Parroquias"; url="$BASE_URL/catalog/parroquias"; data=@{nombre="Test $timestamp"}},
    @{name="Municipios"; url="$BASE_URL/catalog/municipios"; data=@{nombre_municipio="Test $timestamp"}},
    @{name="Veredas"; url="$BASE_URL/catalog/veredas"; data=@{nombre="Test $timestamp"}}
)

foreach ($endpoint in $endpoints) {
    Write-Host "`n--- Probando $($endpoint.name) ---" -ForegroundColor Cyan
    try {
        $result = Invoke-RestMethod -Uri $endpoint.url -Method POST -Body ($endpoint.data | ConvertTo-Json) -Headers $headers
        Write-Host "✓ $($endpoint.name): $($result.message)" -ForegroundColor Green
    } catch {
        $errorMsg = if ($_.ErrorDetails.Message) { $_.ErrorDetails.Message } else { $_.Exception.Message }
        Write-Host "✗ $($endpoint.name): $errorMsg" -ForegroundColor Red
    }
}

Write-Host "`nVerificación completada" -ForegroundColor Blue

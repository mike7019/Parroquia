# Script simple para probar autenticación JWT
Write-Host "=== PRUEBA DE AUTENTICACIÓN ===" -ForegroundColor Green

# 1. Login
Write-Host "`n1. Realizando login..." -ForegroundColor Yellow
$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json -Depth 5

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.datos.token
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "Token recibido: $($token.Substring(0,30))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Error en login: $_" -ForegroundColor Red
    exit 1
}

# 2. Probar endpoint con autenticación
Write-Host "`n2. Probando endpoint autenticado..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    Write-Host "Probando endpoint /api/catalog/municipios..." -ForegroundColor Gray
    $municipiosResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios" -Method GET -Headers $headers
    Write-Host "✅ Endpoint municipios funcionando" -ForegroundColor Green
    Write-Host "Total municipios: $($municipiosResponse.total)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error en municipios: $_" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "StatusDescription: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
}

try {
    Write-Host "Probando endpoint /api/catalog/sexos..." -ForegroundColor Gray
    $sexosResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sexos" -Method GET -Headers $headers
    Write-Host "✅ Endpoint sexos funcionando" -ForegroundColor Green
    Write-Host "Total sexos: $($sexosResponse.total)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error en sexos: $_" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

try {
    Write-Host "Probando endpoint /api/catalog/sectores..." -ForegroundColor Gray
    $sectoresResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectores" -Method GET -Headers $headers
    Write-Host "✅ Endpoint sectores funcionando" -ForegroundColor Green
    Write-Host "Total sectores: $($sectoresResponse.total)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error en sectores: $_" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

Write-Host "`n=== FIN PRUEBA AUTENTICACIÓN ===" -ForegroundColor Green

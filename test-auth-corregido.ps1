# Script corregido para prueba de autenticación JWT
Write-Host "=== PRUEBA DE AUTENTICACIÓN CORREGIDA ===" -ForegroundColor Green

# 1. Login
Write-Host "`n1. Realizando login..." -ForegroundColor Yellow
$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "Token recibido: $($token.Substring(0,30))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Error en login: $_" -ForegroundColor Red
    exit 1
}

# 2. Probar endpoint con autenticación
Write-Host "`n2. Probando endpoints autenticados..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Municipios
try {
    Write-Host "Probando /api/catalog/municipios..." -ForegroundColor Gray
    $municipiosResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios" -Method GET -Headers $headers
    Write-Host "✅ Endpoint municipios funcionando - Total: $($municipiosResponse.total)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en municipios: $_" -ForegroundColor Red
}

# Sexos
try {
    Write-Host "Probando /api/catalog/sexos..." -ForegroundColor Gray
    $sexosResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sexos" -Method GET -Headers $headers
    Write-Host "✅ Endpoint sexos funcionando - Total: $($sexosResponse.total)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en sexos: $_" -ForegroundColor Red
}

# Sectores
try {
    Write-Host "Probando /api/catalog/sectores..." -ForegroundColor Gray
    $sectoresResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectores" -Method GET -Headers $headers
    Write-Host "✅ Endpoint sectores funcionando - Total: $($sectoresResponse.total)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en sectores: $_" -ForegroundColor Red
}

# Tipos de identificación (público - no requiere auth)
try {
    Write-Host "Probando /api/catalog/tipos-identificacion (público)..." -ForegroundColor Gray
    $tiposIdResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/tipos-identificacion" -Method GET
    Write-Host "✅ Endpoint tipos identificación funcionando - Total: $($tiposIdResponse.total)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en tipos identificación: $_" -ForegroundColor Red
}

Write-Host "`n=== AUTENTICACIÓN VERIFICADA ===" -ForegroundColor Green

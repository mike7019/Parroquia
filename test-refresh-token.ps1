# Script para probar el endpoint de refresh token
$baseUrl = "http://localhost:3000/api"

Write-Host "🔄 Probando sistema de refresh token..." -ForegroundColor Cyan

# Primero hacer login para obtener tokens
Write-Host "`n1. Realizando login..." -ForegroundColor Yellow
$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "Access Token: $($loginResponse.data.accessToken.Substring(0,20))..." -ForegroundColor Gray
    Write-Host "Refresh Token: $($loginResponse.data.refreshToken.Substring(0,20))..." -ForegroundColor Gray
    
    $refreshToken = $loginResponse.data.refreshToken
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Esperar un momento
Start-Sleep -Seconds 2

# Ahora probar el refresh token
Write-Host "`n2. Probando refresh token..." -ForegroundColor Yellow
$refreshData = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

try {
    $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/auth/refresh-token" -Method POST -Body $refreshData -ContentType "application/json"
    Write-Host "✅ Refresh token exitoso" -ForegroundColor Green
    Write-Host "Nuevo Access Token: $($refreshResponse.data.accessToken.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Error en refresh token:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    # Intentar obtener más detalles del error
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n🏁 Prueba completada" -ForegroundColor Cyan
# Test Comunidades Culturales API
$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api/catalog"

# Credenciales de usuario
$loginData = @{
    email = "diego.garciasdsd5105@yopmail.com"
    password = "Fuerte789&"
} | ConvertTo-Json

Write-Host "🔐 Iniciando sesión..." -ForegroundColor Blue

try {
    # Hacer login
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($loginResponse.success) {
        $token = $loginResponse.data.access_token
        Write-Host "✅ Login exitoso" -ForegroundColor Green
        
        # Headers con autenticación
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        Write-Host "📋 Probando GET /comunidades-culturales..." -ForegroundColor Blue
        
        # Test GET - Obtener todas las comunidades culturales
        $getAllResponse = Invoke-RestMethod -Uri "$apiUrl/comunidades-culturales" -Method GET -Headers $headers
        
        Write-Host "✅ GET exitoso - Total: $($getAllResponse.data.total)" -ForegroundColor Green
        Write-Host "🎉 API DE COMUNIDADES CULTURALES FUNCIONANDO CORRECTAMENTE!" -ForegroundColor Green
        
    } else {
        Write-Host "❌ Error en login: $($loginResponse.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test simple para sectores - solo GET
$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api"

# Login
$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    
    $token = $loginResponse.data.accessToken
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    # Solo probar GET sectores para ver el error exacto
    Write-Host "`n🔍 Probando GET /api/catalog/sectores..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$apiUrl/catalog/sectores" -Method GET -Headers $headers
        Write-Host "✅ Respuesta exitosa:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 5
    }
    catch {
        Write-Host "❌ Error en GET sectores:" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Yellow
        
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body:" -ForegroundColor Yellow
            Write-Host $responseBody -ForegroundColor White
        }
    }
}
catch {
    Write-Host "❌ Error en login:" -ForegroundColor Red
    $_.Exception.Message
}

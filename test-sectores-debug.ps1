# Test simple para sectores
$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api"

# Login
$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
}

Write-Host "Iniciando test de sectores..." -ForegroundColor Cyan

$loginResponse = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
Write-Host "Login exitoso" -ForegroundColor Green

$token = $loginResponse.data.accessToken
$headers = @{
    "Authorization" = "Bearer $token"
}

# Probar GET sectores
Write-Host "Probando GET sectores..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/catalog/sectores" -Method GET -Headers $headers
    Write-Host "Respuesta exitosa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
}
catch {
    Write-Host "Error en GET sectores:" -ForegroundColor Red
    $_.Exception.Message
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor White
    }
}

# Test simple de login para verificar token
Write-Host "Probando login..." -ForegroundColor Blue

$BaseUrl = "http://localhost:3000"
$LoginUrl = "$BaseUrl/api/auth/login"

$LoginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json -Compress

try {
    $LoginResponse = Invoke-RestMethod -Uri $LoginUrl -Method POST -Body $LoginData -ContentType "application/json"
    
    Write-Host "Login exitoso!" -ForegroundColor Green
    Write-Host "Token: $($LoginResponse.token)" -ForegroundColor Yellow
    Write-Host "Status: $($LoginResponse.status)" -ForegroundColor Yellow
    Write-Host "Message: $($LoginResponse.message)" -ForegroundColor Yellow
    
    # Probar una peticion simple con el token
    $Headers = @{
        "Authorization" = "Bearer $($LoginResponse.token)"
        "Content-Type" = "application/json"
    }
    
    Write-Host "`nProbando endpoint protegido..." -ForegroundColor Blue
    
    try {
        $TestResponse = Invoke-RestMethod -Uri "$BaseUrl/api/encuesta" -Method GET -Headers $Headers
        Write-Host "Endpoint protegido funciona!" -ForegroundColor Green
    } catch {
        Write-Host "Error en endpoint protegido:" -ForegroundColor Red
        Write-Host "Codigo: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "Mensaje: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Error en login:" -ForegroundColor Red
    Write-Host "Codigo: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Mensaje: $($_.Exception.Message)" -ForegroundColor Red
}

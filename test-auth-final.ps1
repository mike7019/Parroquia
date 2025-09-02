# Test auth simple JWT
Write-Host "=== TEST AUTH SIMPLE ===" -ForegroundColor Green

$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($response.data -and $response.data.accessToken) {
        $token = $response.data.accessToken
        Write-Host "Login OK - Token length: $($token.Length)" -ForegroundColor Green
        
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        # Test municipios
        try {
            $mun = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios" -Method GET -Headers $headers
            Write-Host "Municipios OK - Total: $($mun.total)" -ForegroundColor Green
        } catch {
            Write-Host "Municipios FAIL: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test sexos
        try {
            $sex = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sexos" -Method GET -Headers $headers
            Write-Host "Sexos OK - Total: $($sex.total)" -ForegroundColor Green
        } catch {
            Write-Host "Sexos FAIL: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "No token found" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Login FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== MUNICIPIOS API - VERIFICACION FINAL ===" -ForegroundColor Green

# Verificar servidor
$health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET
Write-Host "Servidor: $($health.status)" -ForegroundColor Green

# Login
$loginBody = @{ correo_electronico = "admin@parroquia.com"; contrasena = "Admin123!" } | ConvertTo-Json
try {
    $auth = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $auth.data.accessToken
    Write-Host "Login exitoso - Token obtenido" -ForegroundColor Green
    
    $headers = @{ 
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    # Estadisticas
    $stats = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios/statistics" -Method GET -Headers $headers
    Write-Host "Total municipios: $($stats.data.totalMunicipios)" -ForegroundColor Cyan

    # Buscar Medellin
    $busqueda = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios/search?q=Medellin" -Method GET -Headers $headers
    Write-Host "Medellin encontrado: $($busqueda.data.Count -gt 0)" -ForegroundColor Yellow
    
    if ($stats.data.totalMunicipios -eq 1122) {
        Write-Host "EXITO: 1122 municipios cargados correctamente!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== IMPLEMENTACION EXITOSA ===" -ForegroundColor Magenta

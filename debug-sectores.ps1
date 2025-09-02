# Debug sectores para ver cuales existen
$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $loginResponse.data.accessToken

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $sectores = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectores" -Headers $headers -Method GET
    Write-Host "Sectores disponibles:" -ForegroundColor Yellow
    Write-Host ($sectores | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Error obteniendo sectores: $_" -ForegroundColor Red
}

try {
    $parroquias = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET
    Write-Host "`nParroquias disponibles:" -ForegroundColor Yellow
    Write-Host ($parroquias | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Error obteniendo parroquias: $_" -ForegroundColor Red
}

try {
    $veredas = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/veredas" -Headers $headers -Method GET
    Write-Host "`nVeredas disponibles:" -ForegroundColor Yellow
    Write-Host ($veredas | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Error obteniendo veredas: $_" -ForegroundColor Red
}

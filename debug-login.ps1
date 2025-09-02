# Script debug para ver respuesta de login
Write-Host "=== DEBUG LOGIN RESPONSE ===" -ForegroundColor Green

$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

Write-Host "Datos de login enviados:" -ForegroundColor Yellow
Write-Host $loginData

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    Write-Host "`nRespuesta completa del login:" -ForegroundColor Yellow
    Write-Host ($loginResponse | ConvertTo-Json -Depth 5)
    
    Write-Host "`nPropiedades de la respuesta:" -ForegroundColor Yellow
    $loginResponse | Get-Member
    
    if ($loginResponse.datos) {
        Write-Host "`nContenido de 'datos':" -ForegroundColor Cyan
        Write-Host ($loginResponse.datos | ConvertTo-Json -Depth 3)
    }
    
    if ($loginResponse.data) {
        Write-Host "`nContenido de 'data':" -ForegroundColor Cyan
        Write-Host ($loginResponse.data | ConvertTo-Json -Depth 3)
    }
    
} catch {
    Write-Host "❌ Error en login: $_" -ForegroundColor Red
    Write-Host "Detalles del error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

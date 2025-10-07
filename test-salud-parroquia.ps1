# Test script para el endpoint de salud por parroquia
# Ejecutar en PowerShell

Write-Host "[TEST] Probando endpoint de salud por parroquia..." -ForegroundColor Cyan

# Primero necesitamos un token de autenticación
Write-Host "`n[PASO 1] Obteniendo token de autenticacion..." -ForegroundColor Yellow

$loginBody = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    Write-Host "[DEBUG] Respuesta de login:" -ForegroundColor Magenta
    $loginResponse | ConvertTo-Json -Depth 3
    
    # Obtener el accessToken del login
    $token = $loginResponse.data.accessToken
    
    if ($token) {
        Write-Host "[OK] Token obtenido exitosamente" -ForegroundColor Green
    } else {
        throw "No se pudo obtener el token de autenticacion"
    }
    
    # Probar el endpoint de salud por parroquia
    Write-Host "`n[PASO 2] Probando GET /api/personas/salud/parroquia/1..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $saludResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/personas/salud/parroquia/1" `
        -Method GET `
        -Headers $headers
    
    Write-Host "[OK] Respuesta del endpoint:" -ForegroundColor Green
    $saludResponse | ConvertTo-Json -Depth 5
    
    # Verificar estructura de respuesta
    if ($saludResponse.exito -eq $true) {
        Write-Host "`n[EXITO] TEST PASADO: El endpoint funciona correctamente" -ForegroundColor Green
        Write-Host "   - Campo 'exito': $($saludResponse.exito)" -ForegroundColor White
        Write-Host "   - Campo 'mensaje': $($saludResponse.mensaje)" -ForegroundColor White
        Write-Host "   - Campo 'datos' presente: $($null -ne $saludResponse.datos)" -ForegroundColor White
    } else {
        Write-Host "`n[ERROR] TEST FALLIDO: Respuesta inesperada" -ForegroundColor Red
    }
    
} catch {
    Write-Host "`n[ERROR] Error en la prueba:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "`nCuerpo de la respuesta:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor White
    }
}

Write-Host "`n[TEST] Prueba completada" -ForegroundColor Cyan
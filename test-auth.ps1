# Script simple para probar autenticación
Write-Host "Probando autenticación con diferentes credenciales..." -ForegroundColor Yellow

$headers = @{'Content-Type' = 'application/json'}

# Credenciales a probar
$credentials = @(
    @{email="admin@parroquia.com"; password="admin123"},
    @{email="diego.garcsdsd5@yopmail.com"; password="Fuerte789&"},
    @{email="test@test.com"; password="password123"}
)

foreach ($cred in $credentials) {
    Write-Host "`nProbando: $($cred.email)" -ForegroundColor Cyan
    
    $loginBody = @{
        email = $cred.email
        password = $cred.password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers $headers -Body $loginBody
        $data = $response.Content | ConvertFrom-Json
        Write-Host "✅ ÉXITO - Token obtenido" -ForegroundColor Green
        Write-Host "Usuario: $($data.user.email)" -ForegroundColor Green
        break
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorBody = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorBody)
            $errorText = $reader.ReadToEnd()
            Write-Host "Detalles: $errorText" -ForegroundColor Red
        }
    }
}

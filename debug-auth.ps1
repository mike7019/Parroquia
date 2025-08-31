Write-Host "=== DEBUG AUTENTICACION MUNICIPIOS ===" -ForegroundColor Green

$baseUrl = "http://localhost:3000/api"

# Test de login detallado
Write-Host "`n1. Probando login..." -ForegroundColor Yellow
$loginBody = @{ correo_electronico = "admin@parroquia.com"; contrasena = "Admin123!" } | ConvertTo-Json

try {
    $authData = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    
    if ($authData.data -and $authData.data.accessToken) {
        $token = $authData.data.accessToken
        Write-Host "Token obtenido: $($token.Substring(0,30))..." -ForegroundColor Cyan
        
        # Verificar headers de autorización
        $headers = @{ 
            "Authorization" = "Bearer $token"
        }
        
        Write-Host "`n2. Probando endpoint municipios..." -ForegroundColor Yellow
        
        # Intentar acceso a estadísticas
        try {
            $statsData = Invoke-RestMethod -Uri "$baseUrl/catalog/municipios/statistics" -Method GET -Headers $headers
            Write-Host "✅ Estadísticas OK" -ForegroundColor Green
            Write-Host "Response completo:" -ForegroundColor Gray
            Write-Host ($statsData | ConvertTo-Json -Depth 3) -ForegroundColor Gray
            
        } catch {
            Write-Host "❌ Error en estadísticas: $($_.Exception.Message)" -ForegroundColor Red
            
            # Probar endpoint simple de municipios
            try {
                Write-Host "`n3. Probando endpoint simple..." -ForegroundColor Yellow
                $simpleData = Invoke-RestMethod -Uri "$baseUrl/catalog/municipios?page=1&limit=1" -Method GET -Headers $headers
                Write-Host "✅ Endpoint simple OK - Total: $($simpleData.total)" -ForegroundColor Green
            } catch {
                Write-Host "❌ Error en endpoint simple: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "❌ No se pudo obtener el token del response" -ForegroundColor Red
        Write-Host "Response completo: $($authData | ConvertTo-Json)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== FIN DEBUG ===" -ForegroundColor Green

# Script Final - Configuracion Completa Parroquias y Sectores
Write-Host "=== CONFIGURACION FINAL - PARROQUIAS Y SECTORES ===" -ForegroundColor Cyan

# Login
$loginBody = @{correo_electronico="admin@parroquia.com";contrasena="Admin123!"} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$headers = @{"Authorization"="Bearer $($loginResponse.data.accessToken)"}
Write-Host "✓ Login exitoso" -ForegroundColor Green

# Municipio Medellín
$municipioId = "753"
Write-Host "✓ Usando Municipio: Medellín (ID: $municipioId)" -ForegroundColor Green

# Crear 4 parroquias
Write-Host "`n--- CREANDO PARROQUIAS ---" -ForegroundColor Yellow
$nombresParroquias = @("San José", "La Candelaria", "Cristo Rey", "San Antonio")
$parroquiasCreadas = @()

foreach ($nombre in $nombresParroquias) {
    try {
        $body = @{nombre=$nombre;id_municipio=$municipioId} | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Method Post -Body $body -ContentType "application/json" -Headers $headers
        Write-Host "✓ Parroquia: $nombre (ID: $($response.data.id_parroquia))" -ForegroundColor Green
        $parroquiasCreadas += $response.data
    } catch {
        Write-Host "✗ Error: $nombre - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Crear 5 sectores por parroquia
Write-Host "`n--- CREANDO SECTORES ---" -ForegroundColor Yellow
$nombresSectores = @("Centro", "Norte", "Sur", "Oriente", "Occidente")
$sectoresCreados = 0

foreach ($parroquia in $parroquiasCreadas) {
    Write-Host "`nSectores para $($parroquia.nombre):" -ForegroundColor White
    foreach ($sectorNombre in $nombresSectores) {
        try {
            $body = @{
                nombre = $sectorNombre
                parroquia_id = $parroquia.id_parroquia
                municipio_id = $municipioId
            } | ConvertTo-Json
            
            $response = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Method Post -Body $body -ContentType "application/json" -Headers $headers
            Write-Host "  ✓ $sectorNombre (ID: $($response.data.id_sector))" -ForegroundColor Green
            $sectoresCreados++
        } catch {
            Write-Host "  ✗ $sectorNombre - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Verificación final
Write-Host "`n--- RESUMEN FINAL ---" -ForegroundColor Cyan
try {
    $totalParroquias = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers
    $totalSectores = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Headers $headers
    
    Write-Host "Parroquias en BD: $($totalParroquias.total)" -ForegroundColor Green
    Write-Host "Sectores en BD: $($totalSectores.total)" -ForegroundColor Green
    Write-Host "Sectores creados en esta sesión: $sectoresCreados" -ForegroundColor Green
    
    Write-Host "`n🎉 CONFIGURACION COMPLETADA!" -ForegroundColor Green
    Write-Host "✅ Jerarquía: Municipio → Parroquia → Sector" -ForegroundColor Green
    Write-Host "✅ Listo para crear encuestas" -ForegroundColor Green
} catch {
    Write-Host "Error en verificación: $($_.Exception.Message)" -ForegroundColor Red
}

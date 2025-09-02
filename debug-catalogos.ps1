# Debug catalogos para ver estructura real
Write-Host "=== DEBUG CATALOGOS ===" -ForegroundColor Green

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

Write-Host "`nMunicipios response structure:" -ForegroundColor Yellow
try {
    $municipios = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios" -Headers $headers -Method GET
    Write-Host "Keys: $($municipios.PSObject.Properties.Name -join ', ')" -ForegroundColor Cyan
    if ($municipios.datos) {
        Write-Host "datos count: $($municipios.datos.Count)" -ForegroundColor Cyan
        if ($municipios.datos.Count -gt 0) {
            Write-Host "First municipio: $($municipios.datos[0] | ConvertTo-Json)" -ForegroundColor Gray
        }
    }
    if ($municipios.data) {
        Write-Host "data count: $($municipios.data.Count)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`nSexos response structure:" -ForegroundColor Yellow
try {
    $sexos = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sexos" -Headers $headers -Method GET
    Write-Host "Keys: $($sexos.PSObject.Properties.Name -join ', ')" -ForegroundColor Cyan
    if ($sexos.datos) {
        Write-Host "datos count: $($sexos.datos.Count)" -ForegroundColor Cyan
        if ($sexos.datos.Count -gt 0) {
            Write-Host "First sexo: $($sexos.datos[0] | ConvertTo-Json)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`nTipos ID response structure:" -ForegroundColor Yellow
try {
    $tiposId = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/tipos-identificacion" -Method GET
    Write-Host "Keys: $($tiposId.PSObject.Properties.Name -join ', ')" -ForegroundColor Cyan
    if ($tiposId.datos) {
        Write-Host "datos count: $($tiposId.datos.Count)" -ForegroundColor Cyan
        if ($tiposId.datos.Count -gt 0) {
            Write-Host "First tipo: $($tiposId.datos[0] | ConvertTo-Json)" -ForegroundColor Gray
        }
    }
    if ($tiposId.data) {
        Write-Host "data count: $($tiposId.data.Count)" -ForegroundColor Cyan
        if ($tiposId.data.Count -gt 0) {
            Write-Host "First tipo: $($tiposId.data[0] | ConvertTo-Json)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

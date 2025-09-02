# Verificar datos despues del seeder
Write-Host "=== VERIFICANDO DATOS POST-SEEDER ===" -ForegroundColor Green

$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "Login OK" -ForegroundColor Green
} catch {
    Write-Host "Login FAIL: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`nVerificando municipios..." -ForegroundColor Yellow
try {
    $municipios = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios?limit=3" -Headers $headers -Method GET
    Write-Host "Response completo municipios:"
    Write-Host ($municipios | ConvertTo-Json -Depth 3)
    Write-Host "Total municipios: $($municipios.total)" -ForegroundColor Green
    
    if ($municipios.data -and $municipios.data.Count -gt 0) {
        Write-Host "Primeros municipios:"
        $municipios.data | Select-Object -First 3 | ForEach-Object {
            Write-Host "  - $($_.nombre) (ID: $($_.id), Dept: $($_.departamento_id))" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "Error municipios: $_" -ForegroundColor Red
}

Write-Host "`nVerificando departamentos..." -ForegroundColor Yellow
try {
    $departamentos = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/departamentos?limit=3" -Headers $headers -Method GET
    Write-Host "Total departamentos: $($departamentos.total)" -ForegroundColor Green
    
    if ($departamentos.data -and $departamentos.data.Count -gt 0) {
        Write-Host "Primeros departamentos:"
        $departamentos.data | Select-Object -First 3 | ForEach-Object {
            Write-Host "  - $($_.nombre) (ID: $($_.id), Codigo: $($_.codigo))" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "Error departamentos: $_" -ForegroundColor Red
}

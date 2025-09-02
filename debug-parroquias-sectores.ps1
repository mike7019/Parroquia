# Debug parroquias y sectores
Write-Host "=== REVISANDO PARROQUIAS Y SECTORES ===" -ForegroundColor Green

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

# Verificar parroquias
Write-Host "`nVerificando parroquias..." -ForegroundColor Yellow
try {
    $parroquias = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET
    Write-Host "Parroquias encontradas: $($parroquias.total)" -ForegroundColor Green
    if ($parroquias.data) {
        $parroquias.data | ForEach-Object { 
            Write-Host "  - $($_.nombre) (ID: $($_.id), Municipio: $($_.municipio_id))" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "Error parroquias: $_" -ForegroundColor Red
}

# Verificar sectores
Write-Host "`nVerificando sectores..." -ForegroundColor Yellow
try {
    $sectores = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectores" -Headers $headers -Method GET
    Write-Host "Sectores encontrados: $($sectores.total)" -ForegroundColor Green
    if ($sectores.data) {
        $sectores.data | ForEach-Object { 
            Write-Host "  - $($_.nombre) (ID: $($_.id), Parroquia: $($_.parroquia_id))" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "Error sectores: $_" -ForegroundColor Red
}

# Verificar municipios (para crear parroquias)
Write-Host "`nVerificando municipios..." -ForegroundColor Yellow
try {
    $municipios = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios?limit=5" -Headers $headers -Method GET
    Write-Host "Municipios disponibles: $($municipios.total)" -ForegroundColor Green
    if ($municipios.data) {
        $municipios.data | ForEach-Object { 
            Write-Host "  - $($_.nombre) (ID: $($_.id), Depto: $($_.departamento_id))" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "Error municipios: $_" -ForegroundColor Red
}

# Prueba configuracion parroquias corregida
Write-Host "=== PRUEBA PARROQUIAS CORREGIDA ===" -ForegroundColor Green

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

Write-Host "`n1. Verificando parroquias existentes..." -ForegroundColor Yellow
try {
    $parroquias = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET
    Write-Host "Total parroquias: $($parroquias.total)" -ForegroundColor Green
    
    if ($parroquias.data) {
        $parroquias.data | ForEach-Object {
            Write-Host "  - $($_.nombre) (ID: $($_.id_parroquia))" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "Error obteniendo parroquias: $_" -ForegroundColor Red
}

Write-Host "`n2. Obteniendo municipio..." -ForegroundColor Yellow
try {
    $municipios = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios?limit=1" -Headers $headers -Method GET
    $municipio = $municipios.data[0]
    $municipioId = $municipio.id_municipio
    Write-Host "Municipio: $($municipio.nombre_municipio) (ID: $municipioId)" -ForegroundColor Green
} catch {
    Write-Host "Error municipios: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n3. Creando parroquia de prueba..." -ForegroundColor Yellow
try {
    $parroquiaData = @{
        nombre = "San Jose Principal"
        id_municipio = $municipioId
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Method POST -Body $parroquiaData -Headers $headers
    Write-Host "Parroquia creada: $($response.data.nombre) (ID: $($response.data.id_parroquia))" -ForegroundColor Green
    $parroquiaId = $response.data.id_parroquia
} catch {
    Write-Host "Error/Ya existe: $_" -ForegroundColor Yellow
    
    # Usar parroquia existente
    try {
        $existentes = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET
        if ($existentes.data -and $existentes.data.Count -gt 0) {
            $parroquiaId = $existentes.data[0].id_parroquia
            Write-Host "Usando existente: $($existentes.data[0].nombre) (ID: $parroquiaId)" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "No se pudo obtener parroquia existente" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n4. Verificando sectores..." -ForegroundColor Yellow
try {
    $sectores = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Headers $headers -Method GET
    Write-Host "Total sectores: $($sectores.total)" -ForegroundColor Green
    
    if ($sectores.data) {
        $sectores.data | Select-Object -First 5 | ForEach-Object {
            Write-Host "  - $($_.nombre) (ID: $($_.id), Parroquia: $($_.parroquia_id))" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "Error sectores: $_" -ForegroundColor Red
}

Write-Host "`n5. Creando sector de prueba..." -ForegroundColor Yellow
if ($parroquiaId) {
    try {
        $sectorData = @{
            nombre = "Centro"
            parroquia_id = $parroquiaId
        } | ConvertTo-Json
        
        $sectorResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Method POST -Body $sectorData -Headers $headers
        Write-Host "Sector creado: $($sectorResponse.data.nombre) (ID: $($sectorResponse.data.id))" -ForegroundColor Green
    } catch {
        Write-Host "Error/Ya existe sector: $_" -ForegroundColor Yellow
    }
}

Write-Host "`n=== CONFIGURACION LISTA ===" -ForegroundColor Green

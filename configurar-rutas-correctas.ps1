# Configuracion corregida con rutas exactas
Write-Host "=== CONFIGURACION CON RUTAS CORRECTAS ===" -ForegroundColor Green

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

Write-Host "`n1. Verificando rutas disponibles..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/health" -Headers $headers -Method GET
    Write-Host "Catalog health: $($health.message)" -ForegroundColor Green
} catch {
    Write-Host "Error catalog health: $_" -ForegroundColor Red
}

Write-Host "`n2. Obteniendo municipio..." -ForegroundColor Yellow
try {
    $municipiosResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios?limit=1" -Headers $headers -Method GET
    $municipio = $municipiosResponse.data[0]
    $municipioId = $municipio.id_municipio
    Write-Host "Municipio: $($municipio.nombre_municipio) (ID: $municipioId)" -ForegroundColor Green
} catch {
    Write-Host "Error municipios: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n3. Creando una parroquia de prueba..." -ForegroundColor Yellow
try {
    $parroquiaData = @{
        nombre = "San Jose Centro"
        codigo = "SJC01"
        municipio_id = $municipioId
    } | ConvertTo-Json
    
    $parResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Method POST -Body $parroquiaData -Headers $headers
    $parroquiaId = $parResponse.data.id
    Write-Host "Parroquia creada: San Jose Centro (ID: $parroquiaId)" -ForegroundColor Green
} catch {
    Write-Host "Error/Ya existe parroquia: $_" -ForegroundColor Yellow
    
    # Intentar obtener parroquias existentes
    try {
        $parroquiasExistentes = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET
        if ($parroquiasExistentes.data -and $parroquiasExistentes.data.Count -gt 0) {
            $parroquiaId = $parroquiasExistentes.data[0].id
            Write-Host "Usando parroquia existente: $($parroquiasExistentes.data[0].nombre) (ID: $parroquiaId)" -ForegroundColor Cyan
        } else {
            Write-Host "No hay parroquias disponibles" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "No se pudieron obtener parroquias existentes: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n4. Creando sectores..." -ForegroundColor Yellow
$sectores = @("Centro", "Norte", "Sur", "Oriente", "Occidente")

foreach ($sectorNombre in $sectores) {
    try {
        $sectorData = @{
            nombre = $sectorNombre
            codigo = $sectorNombre.Substring(0,3).ToUpper()
            parroquia_id = $parroquiaId
        } | ConvertTo-Json
        
        # Nota: usar /sectors no /sectores segun el index.js
        $sectResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Method POST -Body $sectorData -Headers $headers
        Write-Host "Sector creado: $sectorNombre (ID: $($sectResponse.data.id))" -ForegroundColor Green
    } catch {
        Write-Host "Error/Ya existe sector $sectorNombre : $_" -ForegroundColor Yellow
    }
}

Write-Host "`n5. Verificando configuracion final..." -ForegroundColor Yellow
try {
    $parroquias = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET
    $sectores = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Headers $headers -Method GET
    
    Write-Host "Total parroquias: $($parroquias.total)" -ForegroundColor Cyan
    Write-Host "Total sectores: $($sectores.total)" -ForegroundColor Cyan
    
    if ($parroquias.data) {
        Write-Host "`nParroquias disponibles:"
        $parroquias.data | ForEach-Object {
            Write-Host "  - $($_.nombre) (ID: $($_.id))" -ForegroundColor Cyan
        }
    }
    
    if ($sectores.data) {
        Write-Host "`nSectores disponibles:"
        $sectores.data | ForEach-Object {
            Write-Host "  - $($_.nombre) (ID: $($_.id), Parroquia: $($_.parroquia_id))" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "Error verificando configuracion: $_" -ForegroundColor Red
}

Write-Host "`n=== CONFIGURACION COMPLETADA ===" -ForegroundColor Green
Write-Host "Ahora puedes usar estas parroquias y sectores en las encuestas!" -ForegroundColor Green

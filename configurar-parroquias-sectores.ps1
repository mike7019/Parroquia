# Script para cargar datos basicos y crear parroquias/sectores
Write-Host "=== CONFIGURACION PARROQUIAS Y SECTORES ===" -ForegroundColor Green

# Login
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

Write-Host "`n1. Verificando municipios existentes..." -ForegroundColor Yellow
try {
    $municipiosResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios?limit=1" -Headers $headers -Method GET
    if ($municipiosResponse.data -and $municipiosResponse.data.length -gt 0) {
        $municipio = $municipiosResponse.data[0]
        Write-Host "Municipio encontrado: $($municipio.nombre) (ID: $($municipio.id))" -ForegroundColor Green
    } else {
        Write-Host "No hay municipios - Creando uno de prueba..." -ForegroundColor Yellow
        
        # Primero crear departamento
        $departamento = @{
            nombre = "Antioquia"
            codigo = "05"
        } | ConvertTo-Json
        
        $deptResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/departamentos" -Method POST -Body $departamento -Headers $headers
        $deptId = $deptResponse.data.id
        Write-Host "Departamento creado: ID $deptId" -ForegroundColor Green
        
        # Crear municipio
        $municipioData = @{
            nombre = "Medellin"
            codigo = "001"
            departamento_id = $deptId
        } | ConvertTo-Json
        
        $munResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios" -Method POST -Body $municipioData -Headers $headers
        $municipio = $munResponse.data
        Write-Host "Municipio creado: $($municipio.nombre) (ID: $($municipio.id))" -ForegroundColor Green
    }
} catch {
    Write-Host "Error verificando municipios: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Creando parroquias..." -ForegroundColor Yellow
$parroquias = @(
    @{ nombre = "San Jose"; codigo = "01" },
    @{ nombre = "La Candelaria"; codigo = "02" },
    @{ nombre = "Cristo Rey"; codigo = "03" },
    @{ nombre = "Sagrado Corazon"; codigo = "04" }
)

$parroquiasCreadas = @()
foreach ($parroquia in $parroquias) {
    try {
        $parroquiaData = @{
            nombre = $parroquia.nombre
            codigo = $parroquia.codigo
            municipio_id = $municipio.id
        } | ConvertTo-Json
        
        $parResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Method POST -Body $parroquiaData -Headers $headers
        $parroquiasCreadas += $parResponse.data
        Write-Host "Parroquia creada: $($parroquia.nombre) (ID: $($parResponse.data.id))" -ForegroundColor Green
    } catch {
        Write-Host "Error creando parroquia $($parroquia.nombre): $_" -ForegroundColor Yellow
    }
}

Write-Host "`n3. Creando sectores..." -ForegroundColor Yellow
$sectores = @(
    @{ nombre = "Centro"; codigo = "01" },
    @{ nombre = "Norte"; codigo = "02" },
    @{ nombre = "Sur"; codigo = "03" },
    @{ nombre = "Oriente"; codigo = "04" },
    @{ nombre = "Occidente"; codigo = "05" }
)

$sectoresCreados = @()
foreach ($parroquiaCreada in $parroquiasCreadas) {
    foreach ($sector in $sectores) {
        try {
            $sectorData = @{
                nombre = $sector.nombre
                codigo = $sector.codigo
                parroquia_id = $parroquiaCreada.id
            } | ConvertTo-Json
            
            $sectResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectores" -Method POST -Body $sectorData -Headers $headers
            $sectoresCreados += $sectResponse.data
            Write-Host "Sector creado: $($sector.nombre) para $($parroquiaCreada.nombre) (ID: $($sectResponse.data.id))" -ForegroundColor Green
        } catch {
            Write-Host "Error creando sector $($sector.nombre): $_" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n4. Resumen final..." -ForegroundColor Yellow
Write-Host "Municipios: 1" -ForegroundColor Cyan
Write-Host "Parroquias creadas: $($parroquiasCreadas.Count)" -ForegroundColor Cyan
Write-Host "Sectores creados: $($sectoresCreados.Count)" -ForegroundColor Cyan

Write-Host "`n=== CONFIGURACION COMPLETADA ===" -ForegroundColor Green

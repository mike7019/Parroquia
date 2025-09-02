# Configuracion de parroquias y sectores con estructura correcta
Write-Host "=== CONFIGURACION PARROQUIAS Y SECTORES (ESTRUCTURA CORRECTA) ===" -ForegroundColor Green

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

Write-Host "`n1. Obteniendo municipio de Medellin..." -ForegroundColor Yellow
try {
    $municipiosResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios?search=Medell" -Headers $headers -Method GET
    
    $medellin = $municipiosResponse.data | Where-Object { $_.nombre_municipio -like "*Medell*" } | Select-Object -First 1
    
    if ($medellin) {
        Write-Host "Medellin encontrado: $($medellin.nombre_municipio) (ID: $($medellin.id_municipio))" -ForegroundColor Green
        $municipioId = $medellin.id_municipio
    } else {
        Write-Host "No se encontro Medellin, usando primer municipio..." -ForegroundColor Yellow
        $primer = $municipiosResponse.data[0]
        $municipioId = $primer.id_municipio
        Write-Host "Usando: $($primer.nombre_municipio) (ID: $municipioId)" -ForegroundColor Green
    }
} catch {
    Write-Host "Error obteniendo municipios: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Creando parroquias..." -ForegroundColor Yellow
$parroquias = @(
    @{ nombre = "San Jose"; codigo = "01" },
    @{ nombre = "La Candelaria"; codigo = "02" },
    @{ nombre = "Cristo Rey"; codigo = "03" },
    @{ nombre = "Sagrado Corazon"; codigo = "04" },
    @{ nombre = "San Antonio"; codigo = "05" }
)

$parroquiasCreadas = @()
foreach ($parroquia in $parroquias) {
    try {
        $parroquiaData = @{
            nombre = $parroquia.nombre
            codigo = $parroquia.codigo
            municipio_id = $municipioId
        } | ConvertTo-Json
        
        $parResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Method POST -Body $parroquiaData -Headers $headers
        $parroquiasCreadas += $parResponse.data
        Write-Host "Parroquia creada: $($parroquia.nombre) (ID: $($parResponse.data.id))" -ForegroundColor Green
    } catch {
        Write-Host "Error/Ya existe parroquia $($parroquia.nombre): $_" -ForegroundColor Yellow
        # Intentar obtener la parroquia existente
        try {
            $existentes = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias?search=$($parroquia.nombre)" -Headers $headers -Method GET
            $existente = $existentes.data | Where-Object { $_.nombre -eq $parroquia.nombre } | Select-Object -First 1
            if ($existente) {
                $parroquiasCreadas += $existente
                Write-Host "Parroquia existente encontrada: $($parroquia.nombre) (ID: $($existente.id))" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "No se pudo obtener parroquia existente" -ForegroundColor Red
        }
    }
}

Write-Host "`n3. Creando sectores..." -ForegroundColor Yellow
$sectores = @(
    @{ nombre = "Centro"; codigo = "01" },
    @{ nombre = "Norte"; codigo = "02" },
    @{ nombre = "Sur"; codigo = "03" },
    @{ nombre = "Oriente"; codigo = "04" },
    @{ nombre = "Occidente"; codigo = "05" },
    @{ nombre = "Noroccidente"; codigo = "06" },
    @{ nombre = "Nororiental"; codigo = "07" },
    @{ nombre = "Suroccidente"; codigo = "08" }
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
            Write-Host "Error/Ya existe sector $($sector.nombre) en $($parroquiaCreada.nombre): $_" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n4. Verificando resultado final..." -ForegroundColor Yellow
try {
    $totalParroquias = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET
    $totalSectores = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectores" -Headers $headers -Method GET
    
    Write-Host "Total parroquias en sistema: $($totalParroquias.total)" -ForegroundColor Cyan
    Write-Host "Total sectores en sistema: $($totalSectores.total)" -ForegroundColor Cyan
    
    if ($totalParroquias.data) {
        Write-Host "`nParroquias disponibles:"
        $totalParroquias.data | Select-Object -First 5 | ForEach-Object {
            Write-Host "  - $($_.nombre) (ID: $($_.id))" -ForegroundColor Cyan
        }
    }
    
    if ($totalSectores.data) {
        Write-Host "`nPrimeros sectores disponibles:"
        $totalSectores.data | Select-Object -First 8 | ForEach-Object {
            Write-Host "  - $($_.nombre) (ID: $($_.id), Parroquia: $($_.parroquia_id))" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "Error verificando totales: $_" -ForegroundColor Red
}

Write-Host "`n=== CONFIGURACION COMPLETADA ===" -ForegroundColor Green
Write-Host "Ya tienes parroquias y sectores configurados para usar en las encuestas!" -ForegroundColor Green

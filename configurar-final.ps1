# Configuracion final corregida
Write-Host "=== CONFIGURACION FINAL CORREGIDA ===" -ForegroundColor Green

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

Write-Host "`n1. Obteniendo municipio..." -ForegroundColor Yellow
try {
    $municipiosResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios?limit=1" -Headers $headers -Method GET
    $municipio = $municipiosResponse.data[0]
    $municipioId = $municipio.id_municipio
    Write-Host "Municipio: $($municipio.nombre_municipio) (ID: $municipioId)" -ForegroundColor Green
} catch {
    Write-Host "Error municipios: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Creando parroquias..." -ForegroundColor Yellow
$parroquiasData = @(
    @{ nombre = "San Jose"; codigo = "SJ01" },
    @{ nombre = "La Candelaria"; codigo = "LC02" },
    @{ nombre = "Cristo Rey"; codigo = "CR03" },
    @{ nombre = "San Antonio"; codigo = "SA04" }
)

$parroquiasCreadas = @()
foreach ($parroquiaInfo in $parroquiasData) {
    try {
        # Usar id_municipio no municipio_id
        $parroquiaData = @{
            nombre = $parroquiaInfo.nombre
            codigo = $parroquiaInfo.codigo
            id_municipio = $municipioId
            activo = $true
        } | ConvertTo-Json
        
        $parResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Method POST -Body $parroquiaData -Headers $headers
        $parroquiasCreadas += $parResponse.data
        Write-Host "Parroquia creada: $($parroquiaInfo.nombre) (ID: $($parResponse.data.id))" -ForegroundColor Green
    } catch {
        Write-Host "Error/Ya existe $($parroquiaInfo.nombre): $_" -ForegroundColor Yellow
    }
}

# Si no se crearon parroquias, intentar obtener las existentes
if ($parroquiasCreadas.Count -eq 0) {
    Write-Host "`nIntentando obtener parroquias existentes..." -ForegroundColor Yellow
    try {
        $parroquiasExistentes = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET
        $parroquiasCreadas = $parroquiasExistentes.data
        Write-Host "Parroquias existentes encontradas: $($parroquiasCreadas.Count)" -ForegroundColor Cyan
    } catch {
        Write-Host "No se pudieron obtener parroquias: $_" -ForegroundColor Red
    }
}

Write-Host "`n3. Creando sectores..." -ForegroundColor Yellow
$sectores = @("Centro", "Norte", "Sur", "Oriente", "Occidente")

foreach ($parroquia in $parroquiasCreadas) {
    foreach ($sectorNombre in $sectores) {
        try {
            $sectorData = @{
                nombre = $sectorNombre
                codigo = $sectorNombre.Substring(0,3).ToUpper()
                parroquia_id = $parroquia.id
                activo = $true
            } | ConvertTo-Json
            
            $sectResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Method POST -Body $sectorData -Headers $headers
            Write-Host "Sector creado: $sectorNombre en $($parroquia.nombre) (ID: $($sectResponse.data.id))" -ForegroundColor Green
        } catch {
            Write-Host "Error/Ya existe: $sectorNombre en $($parroquia.nombre)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n4. Resumen final..." -ForegroundColor Yellow
try {
    $totalParroquias = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET
    $totalSectores = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Headers $headers -Method GET
    
    Write-Host "RESUMEN:" -ForegroundColor Green
    Write-Host "- Total parroquias: $($totalParroquias.total)" -ForegroundColor Cyan
    Write-Host "- Total sectores: $($totalSectores.total)" -ForegroundColor Cyan
    
    if ($totalParroquias.data -and $totalParroquias.data.Count -gt 0) {
        Write-Host "`nParroquias configuradas:"
        $totalParroquias.data | ForEach-Object {
            Write-Host "  * $($_.nombre) (ID: $($_.id))" -ForegroundColor White
        }
    }
    
    if ($totalSectores.data -and $totalSectores.data.Count -gt 0) {
        Write-Host "`nPrimeros sectores configurados:"
        $totalSectores.data | Select-Object -First 10 | ForEach-Object {
            Write-Host "  * $($_.nombre) (ID: $($_.id))" -ForegroundColor White
        }
    }
} catch {
    Write-Host "Error en resumen: $_" -ForegroundColor Red
}

Write-Host "`n✅ CONFIGURACION COMPLETADA EXITOSAMENTE!" -ForegroundColor Green
Write-Host "Ya puedes usar estas parroquias y sectores para crear encuestas." -ForegroundColor Green

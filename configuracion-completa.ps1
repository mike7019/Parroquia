# Configuracion completa corregida
Write-Host "=== CONFIGURACION COMPLETA CORREGIDA ===" -ForegroundColor Green

$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "✅ Login exitoso" -ForegroundColor Green
} catch {
    Write-Host "❌ Login falló" -ForegroundColor Red
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
    Write-Host "Municipio: $($municipio.nombre_municipio) (ID: $municipioId)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error obteniendo municipios" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Creando parroquias..." -ForegroundColor Yellow
$parroquiasCreadas = @()

$parroquiasData = @(
    "San Jose",
    "La Candelaria", 
    "Cristo Rey",
    "San Antonio",
    "Santa Maria"
)

foreach ($nombreParroquia in $parroquiasData) {
    try {
        $parroquiaData = @{
            nombre = $nombreParroquia
            id_municipio = $municipioId
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Method POST -Body $parroquiaData -Headers $headers
        $parroquiasCreadas += $response.data
        Write-Host "✅ Parroquia creada: $nombreParroquia (ID: $($response.data.id))" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Error/Ya existe: $nombreParroquia" -ForegroundColor Yellow
    }
}

# Obtener parroquias existentes
Write-Host "`nObteniendo parroquias existentes..." -ForegroundColor Yellow
try {
    $parroquiasExistentes = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET
    $todasLasParroquias = $parroquiasExistentes.data
    Write-Host "Total parroquias: $($parroquiasExistentes.total)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error obteniendo parroquias existentes" -ForegroundColor Red
    $todasLasParroquias = $parroquiasCreadas
}

Write-Host "`n3. Creando sectores..." -ForegroundColor Yellow
$sectores = @("Centro", "Norte", "Sur", "Oriente", "Occidente")

$sectoresCreados = 0
foreach ($parroquia in $todasLasParroquias) {
    foreach ($sectorNombre in $sectores) {
        try {
            $sectorData = @{
                nombre = $sectorNombre
                parroquia_id = $parroquia.id
            } | ConvertTo-Json
            
            $response = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Method POST -Body $sectorData -Headers $headers
            $sectoresCreados++
            Write-Host "✅ Sector: $sectorNombre en $($parroquia.nombre) (ID: $($response.data.id))" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Error/Ya existe: $sectorNombre en $($parroquia.nombre)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n4. Resumen final..." -ForegroundColor Yellow
try {
    $totalParroquias = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET
    $totalSectores = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Headers $headers -Method GET
    
    Write-Host "`n🎉 CONFIGURACION COMPLETADA!" -ForegroundColor Green
    Write-Host "📍 Total parroquias: $($totalParroquias.total)" -ForegroundColor Cyan
    Write-Host "🏘️ Total sectores: $($totalSectores.total)" -ForegroundColor Cyan
    
    if ($totalParroquias.data) {
        Write-Host "`nParroquias configuradas:"
        $totalParroquias.data | ForEach-Object {
            Write-Host "  • $($_.nombre) (ID: $($_.id))" -ForegroundColor White
        }
    }
    
    if ($totalSectores.data) {
        Write-Host "`nPrimeros sectores:"
        $totalSectores.data | Select-Object -First 10 | ForEach-Object {
            Write-Host "  • $($_.nombre) (ID: $($_.id))" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Error en resumen final" -ForegroundColor Red
}

Write-Host "`n✅ LISTO PARA ENCUESTAS!" -ForegroundColor Green

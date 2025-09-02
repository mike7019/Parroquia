# Configuracion simplificada sin campo activo
Write-Host "=== CONFIGURACION SIMPLIFICADA ===" -ForegroundColor Green

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
    # Buscar Medellin especificamente
    $municipiosResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios" -Headers $headers -Method GET
    $medellin = $municipiosResponse.data | Where-Object { $_.nombre_municipio -like "*Medell*n" } | Select-Object -First 1
    
    if ($medellin) {
        $municipioId = $medellin.id_municipio
        Write-Host "Medellin encontrado: $($medellin.nombre_municipio) (ID: $municipioId)" -ForegroundColor Green
    } else {
        # Usar primer municipio disponible
        $municipioId = $municipiosResponse.data[0].id_municipio
        Write-Host "Usando municipio: $($municipiosResponse.data[0].nombre_municipio) (ID: $municipioId)" -ForegroundColor Green
    }
} catch {
    Write-Host "Error obteniendo municipios: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Creando parroquia principal..." -ForegroundColor Yellow
try {
    $parroquiaData = @{
        nombre = "Parroquia San Jose"
        id_municipio = $municipioId
        descripcion = "Parroquia principal para encuestas"
    } | ConvertTo-Json
    
    $parResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Method POST -Body $parroquiaData -Headers $headers
    $parroquiaId = $parResponse.data.id
    Write-Host "Parroquia creada: Parroquia San Jose (ID: $parroquiaId)" -ForegroundColor Green
} catch {
    Write-Host "Error/Ya existe parroquia: $_" -ForegroundColor Yellow
    
    # Obtener parroquias existentes
    try {
        $parroquiasExistentes = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET
        if ($parroquiasExistentes.data -and $parroquiasExistentes.data.Count -gt 0) {
            $parroquiaId = $parroquiasExistentes.data[0].id
            Write-Host "Usando parroquia existente: $($parroquiasExistentes.data[0].nombre) (ID: $parroquiaId)" -ForegroundColor Cyan
        } else {
            Write-Host "No hay parroquias - creando una..." -ForegroundColor Yellow
            # Intentar crear sin descripcion
            $parroquiaSimple = @{
                nombre = "San Jose Principal"
                id_municipio = $municipioId
            } | ConvertTo-Json
            
            $parResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Method POST -Body $parroquiaSimple -Headers $headers
            $parroquiaId = $parResponse.data.id
            Write-Host "Parroquia simple creada: (ID: $parroquiaId)" -ForegroundColor Green
        }
    } catch {
        Write-Host "No se pudo crear/obtener parroquia: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n3. Creando sectores basicos..." -ForegroundColor Yellow
$sectoresBasicos = @("Centro", "Norte", "Sur", "Oriente")

foreach ($sectorNombre in $sectoresBasicos) {
    try {
        $sectorData = @{
            nombre = $sectorNombre
            parroquia_id = $parroquiaId
        } | ConvertTo-Json
        
        $sectResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Method POST -Body $sectorData -Headers $headers
        Write-Host "Sector creado: $sectorNombre (ID: $($sectResponse.data.id))" -ForegroundColor Green
    } catch {
        Write-Host "Error/Ya existe sector $sectorNombre : $_" -ForegroundColor Yellow
    }
}

Write-Host "`n4. Verificacion final..." -ForegroundColor Yellow
try {
    $parroquias = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET
    $sectores = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Headers $headers -Method GET
    
    Write-Host "`n✅ CONFIGURACION EXITOSA:" -ForegroundColor Green
    Write-Host "📍 Parroquias configuradas: $($parroquias.total)" -ForegroundColor Cyan
    Write-Host "🏘️  Sectores configurados: $($sectores.total)" -ForegroundColor Cyan
    
    if ($parroquias.data -and $parroquias.data.Count -gt 0) {
        Write-Host "`nParroquias disponibles para encuestas:"
        $parroquias.data | ForEach-Object {
            Write-Host "  • $($_.nombre) (ID: $($_.id))" -ForegroundColor White
        }
    }
    
    if ($sectores.data -and $sectores.data.Count -gt 0) {
        Write-Host "`nSectores disponibles para encuestas:"
        $sectores.data | Select-Object -First 8 | ForEach-Object {
            Write-Host "  • $($_.nombre) (ID: $($_.id))" -ForegroundColor White
        }
    }
} catch {
    Write-Host "Error en verificacion: $_" -ForegroundColor Red
}

Write-Host "`n🎉 LISTO PARA CREAR ENCUESTAS!" -ForegroundColor Green

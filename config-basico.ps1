# Configuracion basica sin emojis
Write-Host "=== CONFIGURACION BASICA ===" -ForegroundColor Green

$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "Login OK" -ForegroundColor Green
} catch {
    Write-Host "Login FAIL" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`nObteniendo municipio..." -ForegroundColor Yellow
try {
    $municipiosResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios" -Headers $headers -Method GET
    $municipio = $municipiosResponse.data[0]
    $municipioId = $municipio.id_municipio
    Write-Host "Municipio: $($municipio.nombre_municipio) (ID: $municipioId)" -ForegroundColor Green
} catch {
    Write-Host "Error municipios" -ForegroundColor Red
    exit 1
}

Write-Host "`nCreando parroquia..." -ForegroundColor Yellow
try {
    $parroquiaData = @{
        nombre = "San Jose Principal"
        id_municipio = $municipioId
    } | ConvertTo-Json
    
    $parResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Method POST -Body $parroquiaData -Headers $headers
    $parroquiaId = $parResponse.data.id
    Write-Host "Parroquia creada: ID $parroquiaId" -ForegroundColor Green
} catch {
    Write-Host "Error parroquia, buscando existentes..." -ForegroundColor Yellow
    try {
        $existentes = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET
        if ($existentes.data -and $existentes.data.Count -gt 0) {
            $parroquiaId = $existentes.data[0].id
            Write-Host "Usando existente: ID $parroquiaId" -ForegroundColor Cyan
        } else {
            Write-Host "No hay parroquias" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "Error obteniendo existentes" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nCreando sectores..." -ForegroundColor Yellow
$sectores = @("Centro", "Norte", "Sur", "Oriente")

foreach ($sector in $sectores) {
    try {
        $sectorData = @{
            nombre = $sector
            parroquia_id = $parroquiaId
        } | ConvertTo-Json
        
        $sectResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Method POST -Body $sectorData -Headers $headers
        Write-Host "Sector creado: $sector (ID: $($sectResponse.data.id))" -ForegroundColor Green
    } catch {
        Write-Host "Error sector $sector" -ForegroundColor Yellow
    }
}

Write-Host "`nVerificacion..." -ForegroundColor Yellow
try {
    $parroquias = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET
    $sectores = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Headers $headers -Method GET
    
    Write-Host "RESULTADO:" -ForegroundColor Green
    Write-Host "Parroquias: $($parroquias.total)" -ForegroundColor Cyan
    Write-Host "Sectores: $($sectores.total)" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error verificacion" -ForegroundColor Red
}

Write-Host "`nCONFIGURACION COMPLETADA" -ForegroundColor Green

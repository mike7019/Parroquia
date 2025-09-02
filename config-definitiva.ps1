# Configuracion de Parroquias y Sectores - Version Definitiva
Write-Host "=== CONFIGURACION COMPLETA ===" -ForegroundColor Cyan

# 1. Login con credenciales correctas
Write-Host "`n1. Realizando login..." -ForegroundColor Yellow
$loginBody = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $jwt = $loginResponse.data.accessToken
    $headers = @{"Authorization" = "Bearer $jwt"}
    Write-Host "Login exitoso - Token obtenido" -ForegroundColor Green
} catch {
    Write-Host "Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Usar municipio Medellín (ID conocido de la respuesta anterior)
Write-Host "`n2. Usando municipio Medellín..." -ForegroundColor Yellow
$municipioId = "753"  # ID de Medellín de la lista de municipios
Write-Host "Municipio: Medellín (ID: $municipioId)" -ForegroundColor Green

# 3. Crear parroquias
Write-Host "`n3. Creando parroquias..." -ForegroundColor Yellow
$parroquias = @(
    @{nombre = "San Jose"; id_municipio = $municipioId},
    @{nombre = "La Candelaria"; id_municipio = $municipioId},
    @{nombre = "Cristo Rey"; id_municipio = $municipioId},
    @{nombre = "San Antonio"; id_municipio = $municipioId}
)

$parroquiasCreadas = @()
foreach ($parroquia in $parroquias) {
    try {
        $body = $parroquia | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Method Post -Body $body -ContentType "application/json" -Headers $headers
        Write-Host "Parroquia creada: $($parroquia.nombre) (ID: $($response.datos.id_parroquia))" -ForegroundColor Green
        $parroquiasCreadas += $response.datos
    } catch {
        Write-Host "Error creando parroquia $($parroquia.nombre): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 4. Verificar parroquias creadas
Write-Host "`n4. Obteniendo parroquias..." -ForegroundColor Yellow
try {
    $todasParroquias = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers
    Write-Host "Total parroquias: $($todasParroquias.total)" -ForegroundColor Green
} catch {
    Write-Host "Error obteniendo parroquias: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Crear sectores para cada parroquia
Write-Host "`n5. Creando sectores..." -ForegroundColor Yellow
$sectoresNombres = @("Centro", "Norte", "Sur", "Oriente", "Occidente")

foreach ($parroquia in $parroquiasCreadas) {
    foreach ($sectorNombre in $sectoresNombres) {
        try {
            $sectorBody = @{
                nombre = $sectorNombre
                parroquia_id = $parroquia.id_parroquia
            } | ConvertTo-Json
            
            $sectorResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectores" -Method Post -Body $sectorBody -ContentType "application/json" -Headers $headers
            Write-Host "Sector creado: $sectorNombre en $($parroquia.nombre) (ID: $($sectorResponse.datos.id_sector))" -ForegroundColor Green
        } catch {
            Write-Host "Error sector: $sectorNombre en $($parroquia.nombre) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# 6. Verificacion final
Write-Host "`n6. Verificacion final..." -ForegroundColor Yellow
try {
    $finalParroquias = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers
    $finalSectores = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectores" -Headers $headers
    
    Write-Host "`nCONFIGURACION COMPLETADA!" -ForegroundColor Cyan
    Write-Host "Total parroquias: $($finalParroquias.total)" -ForegroundColor Green
    Write-Host "Total sectores: $($finalSectores.total)" -ForegroundColor Green
    
    Write-Host "`nParroquias:" -ForegroundColor White
    foreach ($p in $finalParroquias.datos) {
        Write-Host "  - $($p.nombre) (ID: $($p.id_parroquia))" -ForegroundColor Gray
    }
    
    Write-Host "`nPrimeros sectores:" -ForegroundColor White
    $primerosSectores = $finalSectores.datos | Select-Object -First 8
    foreach ($s in $primerosSectores) {
        Write-Host "  - $($s.nombre) (ID: $($s.id_sector))" -ForegroundColor Gray
    }
    
    Write-Host "`nLISTO PARA ENCUESTAS!" -ForegroundColor Green
} catch {
    Write-Host "Error en verificacion final: $($_.Exception.Message)" -ForegroundColor Red
}

# Configuracion de Parroquias y Sectores - VERSION FINAL CORRECTA
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

# 2. Usar municipio Medellín
Write-Host "`n2. Usando municipio Medellin..." -ForegroundColor Yellow
$municipioId = "753"
Write-Host "Municipio: Medellin (ID: $municipioId)" -ForegroundColor Green

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
        Write-Host "Parroquia creada: $($parroquia.nombre) (ID: $($response.data.id_parroquia))" -ForegroundColor Green
        $parroquiasCreadas += $response.data
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

# 5. Crear sectores para cada parroquia (Campo correcto: parroquia_id)
Write-Host "`n5. Creando sectores..." -ForegroundColor Yellow
$sectoresNombres = @("Centro", "Norte", "Sur", "Oriente", "Occidente")

foreach ($parroquia in $parroquiasCreadas) {
    foreach ($sectorNombre in $sectoresNombres) {
        try {
            $sectorBody = @{
                nombre = $sectorNombre
                parroquia_id = $parroquia.id_parroquia  # Campo correcto!
            } | ConvertTo-Json
            
            $sectorResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Method Post -Body $sectorBody -ContentType "application/json" -Headers $headers
            Write-Host "Sector creado: $sectorNombre en $($parroquia.nombre) (ID: $($sectorResponse.data.id_sector))" -ForegroundColor Green
        } catch {
            Write-Host "Error sector: $sectorNombre en $($parroquia.nombre) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# 6. Verificacion final
Write-Host "`n6. Verificacion final..." -ForegroundColor Yellow
try {
    $finalParroquias = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers
    $finalSectores = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Headers $headers
    
    Write-Host "`nCONFIGURACION COMPLETADA!" -ForegroundColor Cyan
    Write-Host "Total parroquias: $($finalParroquias.total)" -ForegroundColor Green
    Write-Host "Total sectores: $($finalSectores.total)" -ForegroundColor Green
    
    Write-Host "`nParroquias creadas:" -ForegroundColor White
    foreach ($p in $finalParroquias.data) {
        Write-Host "  - $($p.nombre) (ID: $($p.id_parroquia))" -ForegroundColor Gray
    }
    
    Write-Host "`nSectores creados:" -ForegroundColor White
    foreach ($s in $finalSectores.data) {
        Write-Host "  - $($s.nombre) (ID: $($s.id_sector))" -ForegroundColor Gray
    }
    
    Write-Host "`nESTRUCTURA JERARQUICA:" -ForegroundColor Cyan
    Write-Host "Municipio: Medellin (ID: $municipioId)" -ForegroundColor Yellow
    foreach ($p in $finalParroquias.data) {
        Write-Host "  └── Parroquia: $($p.nombre) (ID: $($p.id_parroquia))" -ForegroundColor White
        $sectoresParroquia = $finalSectores.data | Where-Object { $_.id_parroquia -eq $p.id_parroquia }
        foreach ($s in $sectoresParroquia) {
            Write-Host "      └── Sector: $($s.nombre) (ID: $($s.id_sector))" -ForegroundColor Gray
        }
    }
    
    Write-Host "`nLISTO PARA ENCUESTAS!" -ForegroundColor Green
} catch {
    Write-Host "Error en verificacion final: $($_.Exception.Message)" -ForegroundColor Red
}

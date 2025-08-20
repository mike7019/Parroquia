# Script para probar todos los endpoints CRUD de los servicios del catálogo
# Fecha: 2025-08-19

Write-Host "🚀 INICIANDO PRUEBAS COMPLETAS DE TODOS LOS ENDPOINTS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Yellow

# 1. Obtener token de autenticación
Write-Host "`n🔐 1. AUTENTICACIÓN" -ForegroundColor Magenta
$loginBody = @{
    correo_electronico = "admin@test.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $accessToken = $loginResponse.data.accessToken
    $headers = @{
        "Authorization" = "Bearer $accessToken"
        "Content-Type" = "application/json"
    }
    Write-Host "✅ Token obtenido exitosamente" -ForegroundColor Green
    Write-Host "🔑 Token: $($accessToken.Substring(0,20))..." -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error obteniendo token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Función para probar endpoints CRUD
function Test-CRUDEndpoints {
    param(
        [string]$ServiceName,
        [string]$EndpointBase,
        [hashtable]$CreateData,
        [hashtable]$UpdateData,
        [hashtable]$Headers
    )
    
    Write-Host "`n📋 PROBANDO SERVICIO: $ServiceName" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Yellow
    
    $results = @{
        Service = $ServiceName
        Create = $false
        ReadAll = $false
        ReadById = $false
        Update = $false
        Delete = $false
        CreatedId = $null
    }
    
    try {
        # CREATE (POST)
        Write-Host "`n1️⃣ CREATE - POST $EndpointBase" -ForegroundColor Green
        $createBody = $CreateData | ConvertTo-Json
        $createResponse = Invoke-RestMethod -Uri "http://localhost:3000$EndpointBase" -Method POST -Headers $Headers -Body $createBody
        $createdId = $createResponse.data.id
        $results.CreatedId = $createdId
        $results.Create = $true
        Write-Host "   ✅ CREATE exitoso - ID: $createdId" -ForegroundColor Green
        
        Start-Sleep -Milliseconds 500
        
        # READ ALL (GET)
        Write-Host "`n2️⃣ READ ALL - GET $EndpointBase" -ForegroundColor Blue
        $readAllResponse = Invoke-RestMethod -Uri "http://localhost:3000$EndpointBase" -Method GET -Headers $Headers
        $totalRecords = $readAllResponse.data.Count
        $results.ReadAll = $true
        Write-Host "   ✅ READ ALL exitoso - Total registros: $totalRecords" -ForegroundColor Green
        
        Start-Sleep -Milliseconds 500
        
        # READ BY ID (GET)
        Write-Host "`n3️⃣ READ BY ID - GET $EndpointBase/$createdId" -ForegroundColor Blue
        $readByIdResponse = Invoke-RestMethod -Uri "http://localhost:3000$EndpointBase/$createdId" -Method GET -Headers $Headers
        $retrievedName = $readByIdResponse.data.nombre
        $results.ReadById = $true
        Write-Host "   ✅ READ BY ID exitoso - Nombre: $retrievedName" -ForegroundColor Green
        
        Start-Sleep -Milliseconds 500
        
        # UPDATE (PUT)
        Write-Host "`n4️⃣ UPDATE - PUT $EndpointBase/$createdId" -ForegroundColor Orange
        $updateBody = $UpdateData | ConvertTo-Json
        $updateResponse = Invoke-RestMethod -Uri "http://localhost:3000$EndpointBase/$createdId" -Method PUT -Headers $Headers -Body $updateBody
        $updatedName = $updateResponse.data.nombre
        $results.Update = $true
        Write-Host "   ✅ UPDATE exitoso - Nuevo nombre: $updatedName" -ForegroundColor Green
        
        Start-Sleep -Milliseconds 500
        
        # DELETE (DELETE)
        Write-Host "`n5️⃣ DELETE - DELETE $EndpointBase/$createdId" -ForegroundColor Red
        $deleteResponse = Invoke-RestMethod -Uri "http://localhost:3000$EndpointBase/$createdId" -Method DELETE -Headers $Headers
        $results.Delete = $true
        Write-Host "   ✅ DELETE exitoso" -ForegroundColor Green
        
    } catch {
        Write-Host "   ❌ Error en $ServiceName : $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   📄 Respuesta: $($_.Exception.Response)" -ForegroundColor Yellow
    }
    
    return $results
}

# 3. Lista de servicios a probar
$servicesToTest = @(
    @{
        Name = "DEPARTAMENTOS"
        Endpoint = "/api/catalog/departamentos"
        CreateData = @{ nombre = "Departamento Test"; descripcion = "Departamento de prueba" }
        UpdateData = @{ nombre = "Departamento Test ACTUALIZADO"; descripcion = "Departamento de prueba actualizado" }
    },
    @{
        Name = "MUNICIPIOS"
        Endpoint = "/api/catalog/municipios"
        CreateData = @{ nombre = "Municipio Test"; id_departamento = 1 }
        UpdateData = @{ nombre = "Municipio Test ACTUALIZADO"; id_departamento = 1 }
    },
    @{
        Name = "PARROQUIAS"
        Endpoint = "/api/catalog/parroquias"
        CreateData = @{ nombre = "Parroquia Test"; direccion = "Dirección test" }
        UpdateData = @{ nombre = "Parroquia Test ACTUALIZADA"; direccion = "Dirección actualizada" }
    },
    @{
        Name = "SECTORES"
        Endpoint = "/api/catalog/sectores"
        CreateData = @{ nombre = "Sector Test"; descripcion = "Sector de prueba" }
        UpdateData = @{ nombre = "Sector Test ACTUALIZADO"; descripcion = "Sector actualizado" }
    },
    @{
        Name = "VEREDAS"
        Endpoint = "/api/catalog/veredas"
        CreateData = @{ nombre = "Vereda Test"; id_sector = 1 }
        UpdateData = @{ nombre = "Vereda Test ACTUALIZADA"; id_sector = 1 }
    },
    @{
        Name = "SEXOS"
        Endpoint = "/api/catalog/sexos"
        CreateData = @{ nombre = "Sexo Test"; descripcion = "Sexo de prueba" }
        UpdateData = @{ nombre = "Sexo Test ACTUALIZADO"; descripcion = "Sexo actualizado" }
    },
    @{
        Name = "ENFERMEDADES"
        Endpoint = "/api/catalog/enfermedades"
        CreateData = @{ nombre = "Enfermedad Test"; descripcion = "Enfermedad de prueba" }
        UpdateData = @{ nombre = "Enfermedad Test ACTUALIZADA"; descripcion = "Enfermedad actualizada" }
    },
    @{
        Name = "AGUAS RESIDUALES"
        Endpoint = "/api/catalog/aguas-residuales"
        CreateData = @{ nombre = "Agua Test"; descripcion = "Sistema de aguas de prueba" }
        UpdateData = @{ nombre = "Agua Test ACTUALIZADA"; descripcion = "Sistema actualizado" }
    },
    @{
        Name = "PARENTESCOS"
        Endpoint = "/api/catalog/parentescos"
        CreateData = @{ nombre = "Parentesco Test"; descripcion = "Parentesco de prueba" }
        UpdateData = @{ nombre = "Parentesco Test ACTUALIZADO"; descripcion = "Parentesco actualizado" }
    },
    @{
        Name = "COMUNIDADES CULTURALES"
        Endpoint = "/api/catalog/comunidades-culturales"
        CreateData = @{ nombre = "Comunidad Test"; descripcion = "Comunidad de prueba" }
        UpdateData = @{ nombre = "Comunidad Test ACTUALIZADA"; descripcion = "Comunidad actualizada" }
    }
)

# 4. Ejecutar pruebas
$allResults = @()
$totalServices = $servicesToTest.Count
$currentService = 0

foreach ($service in $servicesToTest) {
    $currentService++
    Write-Host "`n`n🔄 PROGRESO: $currentService/$totalServices" -ForegroundColor Magenta
    
    $result = Test-CRUDEndpoints -ServiceName $service.Name -EndpointBase $service.Endpoint -CreateData $service.CreateData -UpdateData $service.UpdateData -Headers $headers
    $allResults += $result
    
    Start-Sleep -Seconds 1
}

# 5. Resumen final
Write-Host "`n`n📊 RESUMEN FINAL DE PRUEBAS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Yellow

$successfulServices = 0
$totalOperations = 0
$successfulOperations = 0

foreach ($result in $allResults) {
    $serviceSuccess = $result.Create -and $result.ReadAll -and $result.ReadById -and $result.Update -and $result.Delete
    if ($serviceSuccess) { $successfulServices++ }
    
    $operationsCount = 5
    $operationsSuccess = ($result.Create ? 1 : 0) + ($result.ReadAll ? 1 : 0) + ($result.ReadById ? 1 : 0) + ($result.Update ? 1 : 0) + ($result.Delete ? 1 : 0)
    
    $totalOperations += $operationsCount
    $successfulOperations += $operationsSuccess
    
    $status = $serviceSuccess ? "✅" : "❌"
    Write-Host "$status $($result.Service): $operationsSuccess/$operationsCount operaciones exitosas" -ForegroundColor ($serviceSuccess ? "Green" : "Red")
}

Write-Host "`n📈 ESTADÍSTICAS GENERALES:" -ForegroundColor Cyan
Write-Host "• Servicios probados: $totalServices" -ForegroundColor White
Write-Host "• Servicios exitosos: $successfulServices" -ForegroundColor Green
Write-Host "• Operaciones totales: $totalOperations" -ForegroundColor White
Write-Host "• Operaciones exitosas: $successfulOperations" -ForegroundColor Green
Write-Host "• Tasa de éxito servicios: $([math]::Round(($successfulServices/$totalServices)*100, 2))%" -ForegroundColor Yellow
Write-Host "• Tasa de éxito operaciones: $([math]::Round(($successfulOperations/$totalOperations)*100, 2))%" -ForegroundColor Yellow

if ($successfulServices -eq $totalServices) {
    Write-Host "`n🎉 ¡TODAS LAS PRUEBAS FUERON EXITOSAS!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Algunas pruebas fallaron. Revisar logs anteriores." -ForegroundColor Yellow
}

Write-Host "`n✅ PRUEBAS COMPLETADAS" -ForegroundColor Cyan

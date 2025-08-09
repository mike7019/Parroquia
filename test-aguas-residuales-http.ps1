# Script de pruebas HTTP para el servicio de Aguas Residuales
# Ejecutar con: powershell -ExecutionPolicy Bypass -File test-aguas-residuales-http.ps1

Write-Host "=== PRUEBAS DEL SERVICIO AGUAS RESIDUALES ===" -ForegroundColor Green
Write-Host ""

# 1. Verificar que el servidor esté corriendo
Write-Host "1. Verificando servidor..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET
    Write-Host "✅ Servidor corriendo correctamente" -ForegroundColor Green
    Write-Host "Status: $($healthResponse.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: Servidor no disponible" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# 2. Autenticación
Write-Host "`n2. Autenticándose..." -ForegroundColor Yellow
$headers = @{'Content-Type' = 'application/json'}
$loginBody = @{
    correo_electronico = "test@aguasresiduales.com"
    contrasena = "Test123456!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers $headers -Body $loginBody
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.token
    Write-Host "✅ Autenticación exitosa" -ForegroundColor Green
    Write-Host "Token obtenido: $($token.Substring(0,30))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error en autenticación" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Headers con autorización
$authHeaders = @{
    'Content-Type' = 'application/json'
    'Authorization' = "Bearer $token"
}

# 3. Obtener todos los tipos de aguas residuales
Write-Host "`n3. Obteniendo todos los tipos de aguas residuales..." -ForegroundColor Yellow
try {
    $getAllResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/aguas-residuales" -Method GET -Headers $authHeaders
    $allTypes = $getAllResponse.Content | ConvertFrom-Json
    Write-Host "✅ Tipos obtenidos exitosamente" -ForegroundColor Green
    Write-Host "Total encontrados: $($allTypes.data.count)" -ForegroundColor Cyan
    if ($allTypes.data.tipos.Count -gt 0) {
        Write-Host "Primer tipo: $($allTypes.data.tipos[0].nombre)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Error obteniendo tipos" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# 4. Crear un nuevo tipo de aguas residuales
Write-Host "`n4. Creando nuevo tipo de aguas residuales..." -ForegroundColor Yellow
$newType = @{
    nombre = "Aguas Grises Domesticas - Test"
    descripcion = "Aguas procedentes de lavabos, duchas y lavadoras - Creado por prueba automatizada"
} | ConvertTo-Json

try {
    $createResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/aguas-residuales" -Method POST -Headers $authHeaders -Body $newType
    $createdType = $createResponse.Content | ConvertFrom-Json
    $createdId = $createdType.data.id_tipo_aguas_residuales
    Write-Host "✅ Tipo creado exitosamente" -ForegroundColor Green
    Write-Host "ID creado: $createdId" -ForegroundColor Cyan
    Write-Host "Nombre: $($createdType.data.nombre)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error creando tipo" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# 5. Obtener el tipo creado por ID
if ($createdId) {
    Write-Host "`n5. Obteniendo tipo por ID ($createdId)..." -ForegroundColor Yellow
    try {
        $getByIdResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/aguas-residuales/$createdId" -Method GET -Headers $authHeaders
        $typeById = $getByIdResponse.Content | ConvertFrom-Json
        Write-Host "✅ Tipo obtenido por ID exitosamente" -ForegroundColor Green
        Write-Host "Nombre: $($typeById.data.nombre)" -ForegroundColor Cyan
        Write-Host "Descripción: $($typeById.data.descripcion)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Error obteniendo tipo por ID" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# 6. Actualizar el tipo creado
if ($createdId) {
    Write-Host "`n6. Actualizando tipo ($createdId)..." -ForegroundColor Yellow
    $updateType = @{
        nombre = "Aguas Grises Domesticas - Test Actualizado"
        descripcion = "Aguas procedentes de lavabos, duchas y lavadoras - ACTUALIZADO por prueba automatizada"
    } | ConvertTo-Json

    try {
        $updateResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/aguas-residuales/$createdId" -Method PUT -Headers $authHeaders -Body $updateType
        $updatedType = $updateResponse.Content | ConvertFrom-Json
        Write-Host "✅ Tipo actualizado exitosamente" -ForegroundColor Green
        Write-Host "Nuevo nombre: $($updatedType.data.nombre)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Error actualizando tipo" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# 7. Buscar tipos
Write-Host "`n7. Buscando tipos (término: 'Test')..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/aguas-residuales/search?q=Test" -Method GET -Headers $authHeaders
    $searchResults = $searchResponse.Content | ConvertFrom-Json
    Write-Host "✅ Búsqueda exitosa" -ForegroundColor Green
    Write-Host "Resultados encontrados: $($searchResults.data.count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error en búsqueda" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# 8. Obtener estadísticas
Write-Host "`n8. Obteniendo estadísticas..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/aguas-residuales/stats" -Method GET -Headers $authHeaders
    $stats = $statsResponse.Content | ConvertFrom-Json
    Write-Host "✅ Estadísticas obtenidas exitosamente" -ForegroundColor Green
    Write-Host "Total de tipos: $($stats.data.total)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error obteniendo estadísticas" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# 9. Eliminar el tipo creado
if ($createdId) {
    Write-Host "`n9. Eliminando tipo creado ($createdId)..." -ForegroundColor Yellow
    try {
        $deleteResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/aguas-residuales/$createdId" -Method DELETE -Headers $authHeaders
        Write-Host "✅ Tipo eliminado exitosamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error eliminando tipo" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`n=== PRUEBAS COMPLETADAS ===" -ForegroundColor Green
Write-Host "Todas las operaciones CRUD han sido probadas exitosamente!" -ForegroundColor Green

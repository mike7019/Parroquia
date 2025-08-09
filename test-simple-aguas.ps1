# Prueba simple del servicio de Aguas Residuales
Write-Host "=== PRUEBA SIMPLE AGUAS RESIDUALES ===" -ForegroundColor Green

# 1. Verificar servidor
$healthCheck = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET
Write-Host "✅ Servidor activo - Status: $($healthCheck.StatusCode)" -ForegroundColor Green

# 2. Login
$headers = @{'Content-Type' = 'application/json'}
$loginData = '{"correo_electronico":"test@aguasresiduales.com","contrasena":"Test123456!"}'

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers $headers -Body $loginData
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    $token = $loginResult.token
    
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0,30))..." -ForegroundColor Cyan
    
    # Headers con token
    $authHeaders = @{
        'Content-Type' = 'application/json'
        'Authorization' = "Bearer $token"
    }
    
    # 3. Obtener tipos existentes
    Write-Host "`n3. Obteniendo tipos existentes..." -ForegroundColor Yellow
    $getResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/aguas-residuales" -Method GET -Headers $authHeaders
    $tipos = $getResponse.Content | ConvertFrom-Json
    Write-Host "✅ Tipos obtenidos: $($tipos.data.count)" -ForegroundColor Green
    
    # 4. Crear nuevo tipo
    Write-Host "`n4. Creando nuevo tipo..." -ForegroundColor Yellow
    $newTypeData = '{"nombre":"Aguas Negras Test","descripcion":"Tipo de prueba para testing automatizado"}'
    $createResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/aguas-residuales" -Method POST -Headers $authHeaders -Body $newTypeData
    $newType = $createResponse.Content | ConvertFrom-Json
    $newId = $newType.data.id_tipo_aguas_residuales
    Write-Host "✅ Tipo creado - ID: $newId" -ForegroundColor Green
    Write-Host "Nombre: $($newType.data.nombre)" -ForegroundColor Cyan
    
    # 5. Obtener por ID
    Write-Host "`n5. Obteniendo por ID ($newId)..." -ForegroundColor Yellow
    $getByIdResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/aguas-residuales/$newId" -Method GET -Headers $authHeaders
    $typeById = $getByIdResponse.Content | ConvertFrom-Json
    Write-Host "✅ Obtenido por ID: $($typeById.data.nombre)" -ForegroundColor Green
    
    # 6. Actualizar
    Write-Host "`n6. Actualizando tipo..." -ForegroundColor Yellow
    $updateData = '{"nombre":"Aguas Negras Test ACTUALIZADO","descripcion":"Tipo de prueba ACTUALIZADO para testing automatizado"}'
    $updateResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/aguas-residuales/$newId" -Method PUT -Headers $authHeaders -Body $updateData
    $updatedType = $updateResponse.Content | ConvertFrom-Json
    Write-Host "✅ Tipo actualizado: $($updatedType.data.nombre)" -ForegroundColor Green
    
    # 7. Buscar
    Write-Host "`n7. Buscando tipos..." -ForegroundColor Yellow
    $searchResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/aguas-residuales/search?q=Test" -Method GET -Headers $authHeaders
    $searchResults = $searchResponse.Content | ConvertFrom-Json
    Write-Host "✅ Búsqueda completada - Encontrados: $($searchResults.data.count)" -ForegroundColor Green
    
    # 8. Estadísticas
    Write-Host "`n8. Obteniendo estadísticas..." -ForegroundColor Yellow
    $statsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/aguas-residuales/stats" -Method GET -Headers $authHeaders
    $stats = $statsResponse.Content | ConvertFrom-Json
    Write-Host "✅ Estadísticas - Total: $($stats.data.total)" -ForegroundColor Green
    
    # 9. Eliminar
    Write-Host "`n9. Eliminando tipo creado..." -ForegroundColor Yellow
    $deleteResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/aguas-residuales/$newId" -Method DELETE -Headers $authHeaders
    Write-Host "✅ Tipo eliminado exitosamente" -ForegroundColor Green
    
    Write-Host "`n=== TODAS LAS PRUEBAS EXITOSAS ===" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorDetails = $reader.ReadToEnd()
        Write-Host "Detalles: $errorDetails" -ForegroundColor Red
    }
}

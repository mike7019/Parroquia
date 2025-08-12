# Test simplificado del CRUD de Estudios
# Este script prueba los endpoints básicos del sistema de estudios

$baseUrl = "http://localhost:3000/api"
$authUrl = "$baseUrl/auth/login"
$estudiosUrl = "$baseUrl/catalog/estudios"

Write-Host "🧪 Iniciando pruebas del CRUD de Estudios" -ForegroundColor Yellow

# Headers comunes
$headers = @{
    "Content-Type" = "application/json"
}

# 1. Login para obtener token
Write-Host "`n1. 🔐 Obteniendo token de autenticación..." -ForegroundColor Cyan
try {
    $loginBody = @{
        email = "admin@example.com"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri $authUrl -Method POST -Body $loginBody -Headers $headers
    $token = $loginResponse.data.token
    
    # Agregar token a headers
    $headers["Authorization"] = "Bearer $token"
    
    Write-Host "✅ Login exitoso" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Obtener estadísticas
Write-Host "`n2. 📊 Obteniendo estadísticas..." -ForegroundColor Cyan
try {
    $statsResponse = Invoke-RestMethod -Uri "$estudiosUrl/stats" -Method GET -Headers $headers
    Write-Host "✅ Estadísticas obtenidas:" -ForegroundColor Green
    Write-Host "   Total: $($statsResponse.data.total)" -ForegroundColor Gray
    Write-Host "   Activos: $($statsResponse.data.activos)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error obteniendo estadísticas: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Listar todos los estudios
Write-Host "`n3. 📋 Listando todos los estudios..." -ForegroundColor Cyan
try {
    $listResponse = Invoke-RestMethod -Uri $estudiosUrl -Method GET -Headers $headers
    Write-Host "✅ Lista obtenida: $($listResponse.data.estudios.Count) estudios encontrados" -ForegroundColor Green
    
    $listResponse.data.estudios | ForEach-Object {
        $status = if ($_.activo) { "✅" } else { "❌" }
        Write-Host "   $status ID: $($_.id) - $($_.nivel)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error listando estudios: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Crear un nuevo estudio
Write-Host "`n4. ➕ Creando nuevo estudio..." -ForegroundColor Cyan
$nuevoEstudio = @{
    nivel = "Curso de prueba"
    descripcion = "Estudio creado durante las pruebas automatizadas"
    ordenNivel = 99
    activo = $true
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri $estudiosUrl -Method POST -Body $nuevoEstudio -Headers $headers
    $estudioCreado = $createResponse.data
    Write-Host "✅ Estudio creado exitosamente:" -ForegroundColor Green
    Write-Host "   ID: $($estudioCreado.id)" -ForegroundColor Gray
    Write-Host "   Nivel: $($estudioCreado.nivel)" -ForegroundColor Gray
    
    $estudioId = $estudioCreado.id
} catch {
    Write-Host "❌ Error creando estudio: $($_.Exception.Message)" -ForegroundColor Red
    $estudioId = $null
}

# 5. Obtener estudio por ID
if ($estudioId) {
    Write-Host "`n5. 🔍 Obteniendo estudio por ID..." -ForegroundColor Cyan
    try {
        $getResponse = Invoke-RestMethod -Uri "$estudiosUrl/$estudioId" -Method GET -Headers $headers
        Write-Host "✅ Estudio obtenido:" -ForegroundColor Green
        Write-Host "   ID: $($getResponse.data.id)" -ForegroundColor Gray
        Write-Host "   Nivel: $($getResponse.data.nivel)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Error obteniendo estudio: $($_.Exception.Message)" -ForegroundColor Red
    }

    # 6. Actualizar estudio
    Write-Host "`n6. ✏️ Actualizando estudio..." -ForegroundColor Cyan
    $updateData = @{
        nivel = "Curso de prueba actualizado"
        descripcion = "Descripción actualizada durante las pruebas"
        ordenNivel = 100
        activo = $true
    } | ConvertTo-Json

    try {
        $updateResponse = Invoke-RestMethod -Uri "$estudiosUrl/$estudioId" -Method PUT -Body $updateData -Headers $headers
        Write-Host "✅ Estudio actualizado exitosamente:" -ForegroundColor Green
        Write-Host "   Nuevo nivel: $($updateResponse.data.nivel)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Error actualizando estudio: $($_.Exception.Message)" -ForegroundColor Red
    }

    # 7. Eliminar estudio
    Write-Host "`n7. 🗑️ Eliminando estudio..." -ForegroundColor Cyan
    try {
        $deleteResponse = Invoke-RestMethod -Uri "$estudiosUrl/$estudioId" -Method DELETE -Headers $headers
        Write-Host "✅ Estudio eliminado exitosamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error eliminando estudio: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 8. Buscar estudios
Write-Host "`n8. 🔎 Buscando estudios..." -ForegroundColor Cyan
try {
    $searchResponse = Invoke-RestMethod -Uri "$estudiosUrl/search?q=universi" -Method GET -Headers $headers
    Write-Host "✅ Búsqueda completada: $($searchResponse.data.estudios.Count) resultados" -ForegroundColor Green
    
    $searchResponse.data.estudios | ForEach-Object {
        Write-Host "   🔍 ID: $($_.id) - $($_.nivel)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error en búsqueda: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Pruebas del CRUD de Estudios completadas" -ForegroundColor Yellow
Write-Host "📚 Documentación Swagger: http://localhost:3000/api-docs" -ForegroundColor Cyan

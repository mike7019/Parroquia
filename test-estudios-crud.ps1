# Test completo del CRUD de Estudios
# Este script prueba todos los endpoints del sistema de estudios

$baseUrl = "http://localhost:3000/api"
$authUrl = "$baseUrl/auth/login"
$estudiosUrl = "$baseUrl/catalog/estudios"

Write-Host "🧪 Iniciando pruebas del CRUD de Estudios" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow

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
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
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
    Write-Host "   Inactivos: $($statsResponse.data.inactivos)" -ForegroundColor Gray
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
    $estudoCreado = $createResponse.data
    Write-Host "✅ Estudio creado exitosamente:" -ForegroundColor Green
    Write-Host "   ID: $($estudoCreado.id)" -ForegroundColor Gray
    Write-Host "   Nivel: $($estudoCreado.nivel)" -ForegroundColor Gray
    Write-Host "   Orden: $($estudoCreado.ordenNivel)" -ForegroundColor Gray
    
    $estudioId = $estudoCreado.id
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
        Write-Host "   Descripción: $($getResponse.data.descripcion)" -ForegroundColor Gray
        Write-Host "   Activo: $($getResponse.data.activo)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Error obteniendo estudio: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. Actualizar estudio
if ($estudioId) {
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
        Write-Host "   Nueva descripción: $($updateResponse.data.descripcion)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Error actualizando estudio: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 7. Buscar estudios
Write-Host "`n7. 🔎 Buscando estudios..." -ForegroundColor Cyan
try {
    $searchResponse = Invoke-RestMethod -Uri "$estudiosUrl/search?q=prueba" -Method GET -Headers $headers
    Write-Host "✅ Búsqueda completada: $($searchResponse.data.estudios.Count) resultados" -ForegroundColor Green
    
    $searchResponse.data.estudios | ForEach-Object {
        Write-Host "   🔍 ID: $($_.id) - $($_.nivel)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error en búsqueda: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Eliminar estudio (soft delete)
if ($estudioId) {
    Write-Host "`n8. 🗑️ Eliminando estudio (soft delete)..." -ForegroundColor Cyan
    try {
        $deleteResponse = Invoke-RestMethod -Uri "$estudiosUrl/$estudioId" -Method DELETE -Headers $headers
        Write-Host "✅ Estudio eliminado exitosamente" -ForegroundColor Green
        Write-Host "   Mensaje: $($deleteResponse.message)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Error eliminando estudio: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 9. Verificar que el estudio fue eliminado
if ($estudioId) {
    Write-Host "`n9. ✅ Verificando eliminación..." -ForegroundColor Cyan
    try {
        $getDeletedResponse = Invoke-RestMethod -Uri "$estudiosUrl/$estudioId" -Method GET -Headers $headers
        Write-Host "❌ ERROR: El estudio aún existe después de ser eliminado" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "✅ Confirmado: Estudio eliminado correctamente (404 Not Found)" -ForegroundColor Green
        } else {
            Write-Host "❌ Error inesperado: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# 10. Restaurar estudio
if ($estudioId) {
    Write-Host "`n10. ♻️ Restaurando estudio..." -ForegroundColor Cyan
    try {
        $restoreResponse = Invoke-RestMethod -Uri "$estudiosUrl/$estudioId/restore" -Method PUT -Headers $headers
        Write-Host "✅ Estudio restaurado exitosamente:" -ForegroundColor Green
        Write-Host "   Nivel: $($restoreResponse.data.nivel)" -ForegroundColor Gray
        Write-Host "   Activo: $($restoreResponse.data.activo)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Error restaurando estudio: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 11. Eliminar definitivamente el estudio de prueba
if ($estudioId) {
    Write-Host "`n11. 🧹 Limpieza: Eliminando estudio de prueba..." -ForegroundColor Cyan
    try {
        Invoke-RestMethod -Uri "$estudiosUrl/$estudioId" -Method DELETE -Headers $headers | Out-Null
        Write-Host "✅ Estudio de prueba eliminado para limpieza" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Advertencia: No se pudo limpiar el estudio de prueba" -ForegroundColor Yellow
    }
}

# 12. Estadísticas finales
Write-Host "`n12. 📊 Estadísticas finales..." -ForegroundColor Cyan
try {
    $finalStatsResponse = Invoke-RestMethod -Uri "$estudiosUrl/stats" -Method GET -Headers $headers
    Write-Host "✅ Estadísticas finales:" -ForegroundColor Green
    Write-Host "   Total: $($finalStatsResponse.data.total)" -ForegroundColor Gray
    Write-Host "   Activos: $($finalStatsResponse.data.activos)" -ForegroundColor Gray
    Write-Host "   Inactivos: $($finalStatsResponse.data.inactivos)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error obteniendo estadísticas finales: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Pruebas del CRUD de Estudios completadas" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow

# Test de documentación Swagger
Write-Host "`n📚 Para ver la documentación de Swagger:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000/api-docs" -ForegroundColor Blue
Write-Host "   Busca la sección 'Catalog - Estudios'" -ForegroundColor Gray

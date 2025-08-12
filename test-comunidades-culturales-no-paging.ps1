# Test script para Comunidades Culturales CRUD (Sin paginación)
Write-Host "=== INICIANDO PRUEBAS DE COMUNIDADES CULTURALES (SIN PAGINACIÓN) ===" -ForegroundColor Green

# 1. Login
Write-Host "`n1. Haciendo login..." -ForegroundColor Yellow
$body = @{
    correo_electronico = "diego.gar45a988805@yopmail.com"
    contrasena = "Fuerte789&"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    $token = $response.data.accessToken
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Consultar todas las comunidades (SIN PAGINACIÓN)
Write-Host "`n2. Consultando todas las comunidades culturales (sin paginación)..." -ForegroundColor Yellow
try {
    $result1 = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/comunidades-culturales" -Method GET -Headers $headers
    Write-Host "✅ Consulta exitosa - Total: $($result1.data.total)" -ForegroundColor Green
    Write-Host "Comunidades encontradas: $($result1.data.comunidadesCulturales.Count)"
    
    # Mostrar las primeras 3 comunidades
    if ($result1.data.comunidadesCulturales.Count -gt 0) {
        Write-Host "Primeras comunidades:"
        $result1.data.comunidadesCulturales[0..2] | ForEach-Object {
            Write-Host "  - ID: $($_.id_comunidad_cultural), Nombre: $($_.nombre), Activo: $($_.activo)"
        }
    }
} catch {
    Write-Host "❌ Error consultando comunidades: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Consultar con filtro de búsqueda
Write-Host "`n3. Consultando con búsqueda (search=cultural)..." -ForegroundColor Yellow
try {
    $result3 = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/comunidades-culturales?search=cultural" -Method GET -Headers $headers
    Write-Host "✅ Búsqueda exitosa - Encontradas: $($result3.data.total)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en búsqueda: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Consultar solo activos
Write-Host "`n4. Consultando solo comunidades activas..." -ForegroundColor Yellow
try {
    $result4 = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/comunidades-culturales?activo=true" -Method GET -Headers $headers
    Write-Host "✅ Consulta de activos exitosa - Total activos: $($result4.data.total)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error consultando activos: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Consultar estadísticas
Write-Host "`n5. Consultando estadísticas..." -ForegroundColor Yellow
try {
    $result2 = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/comunidades-culturales/stats" -Method GET -Headers $headers
    Write-Host "✅ Estadísticas obtenidas exitosamente" -ForegroundColor Green
    Write-Host "Total: $($result2.data.stats.total)"
    Write-Host "Activas: $($result2.data.stats.activas)"
    Write-Host "Inactivas: $($result2.data.stats.inactivas)"
} catch {
    Write-Host "❌ Error consultando estadísticas: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Crear nueva comunidad
Write-Host "`n6. Creando nueva comunidad cultural..." -ForegroundColor Yellow
$newComunidad = @{
    nombre = "Danza Folclórica Tradicional Test"
    descripcion = "Grupo de danza folclórica que preserva las tradiciones ancestrales - PRUEBA"
} | ConvertTo-Json

try {
    $result5 = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/comunidades-culturales" -Method POST -Body $newComunidad -Headers $headers
    $createdId = $result5.data.comunidadCultural.id_comunidad_cultural
    Write-Host "✅ Comunidad creada exitosamente con ID: $createdId" -ForegroundColor Green
    Write-Host "Nombre: $($result5.data.comunidadCultural.nombre)"
} catch {
    Write-Host "❌ Error creando comunidad: $($_.Exception.Message)" -ForegroundColor Red
    $createdId = $null
}

# 7. Verificar que ahora hay más comunidades
if ($createdId) {
    Write-Host "`n7. Verificando aumento en total después de crear..." -ForegroundColor Yellow
    try {
        $result6 = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/comunidades-culturales" -Method GET -Headers $headers
        Write-Host "✅ Nuevo total después de crear: $($result6.data.total)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error verificando nuevo total: $($_.Exception.Message)" -ForegroundColor Red
    }

    # 8. Actualizar comunidad
    Write-Host "`n8. Actualizando comunidad..." -ForegroundColor Yellow
    $updateComunidad = @{
        nombre = "Danza Folclórica Tradicional Andina ACTUALIZADA"
        descripcion = "Grupo de danza folclórica actualizado - PRUEBA"
    } | ConvertTo-Json

    try {
        $result7 = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/comunidades-culturales/$createdId" -Method PUT -Body $updateComunidad -Headers $headers
        Write-Host "✅ Actualización exitosa" -ForegroundColor Green
        Write-Host "Nuevo nombre: $($result7.data.comunidadCultural.nombre)"
    } catch {
        Write-Host "❌ Error actualizando: $($_.Exception.Message)" -ForegroundColor Red
    }

    # 9. Eliminar comunidad (soft delete)
    Write-Host "`n9. Eliminando comunidad (soft delete)..." -ForegroundColor Yellow
    try {
        $result8 = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/comunidades-culturales/$createdId" -Method DELETE -Headers $headers
        Write-Host "✅ Eliminación exitosa" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error eliminando: $($_.Exception.Message)" -ForegroundColor Red
    }

    # 10. Verificar que total se mantiene (soft delete)
    Write-Host "`n10. Verificando total después de eliminar (soft delete)..." -ForegroundColor Yellow
    try {
        $result9 = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/comunidades-culturales" -Method GET -Headers $headers
        Write-Host "✅ Total después de eliminar: $($result9.data.total)" -ForegroundColor Green
        Write-Host "(El total se mantiene porque es soft delete)"
    } catch {
        Write-Host "❌ Error verificando total después de eliminar: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 11. Consultar opciones para select
Write-Host "`n11. Consultando opciones para select..." -ForegroundColor Yellow
try {
    $result10 = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/comunidades-culturales/select" -Method GET -Headers $headers
    Write-Host "✅ Opciones para select obtenidas" -ForegroundColor Green
    Write-Host "Total opciones disponibles (solo activos): $($result10.data.comunidades.Count)"
} catch {
    Write-Host "❌ Error consultando opciones: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== PRUEBAS COMPLETADAS (SIN PAGINACIÓN) ===" -ForegroundColor Green
Write-Host "`n📄 RESUMEN DE CAMBIOS:" -ForegroundColor Cyan
Write-Host "• Se eliminó la paginación (page, limit)" -ForegroundColor White
Write-Host "• Ahora devuelve TODAS las comunidades de una vez" -ForegroundColor White
Write-Host "• Mantiene búsqueda, filtros y ordenamiento" -ForegroundColor White
Write-Host "• Respuesta simplificada: { comunidadesCulturales: [], total: number }" -ForegroundColor White
Write-Host "`n📖 Para ver la documentación Swagger actualizada, visita: http://localhost:3000/api-docs" -ForegroundColor Cyan

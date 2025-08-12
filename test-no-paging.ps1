# Test script para Comunidades Culturales CRUD (Sin paginacion)
Write-Host "=== INICIANDO PRUEBAS DE COMUNIDADES CULTURALES (SIN PAGINACION) ===" -ForegroundColor Green

# 1. Login
Write-Host "`n1. Haciendo login..." -ForegroundColor Yellow
$body = @{
    correo_electronico = "diego.gar45a988805@yopmail.com"
    contrasena = "Fuerte789&"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    $token = $response.data.accessToken
    Write-Host "Login exitoso" -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
} catch {
    Write-Host "Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Consultar todas las comunidades (SIN PAGINACION)
Write-Host "`n2. Consultando todas las comunidades culturales..." -ForegroundColor Yellow
try {
    $result1 = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/comunidades-culturales" -Method GET -Headers $headers
    Write-Host "Consulta exitosa - Total: $($result1.data.total)" -ForegroundColor Green
    Write-Host "Comunidades encontradas: $($result1.data.comunidadesCulturales.Count)"
} catch {
    Write-Host "Error consultando comunidades: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Consultar estadisticas
Write-Host "`n3. Consultando estadisticas..." -ForegroundColor Yellow
try {
    $result2 = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/comunidades-culturales/stats" -Method GET -Headers $headers
    Write-Host "Estadisticas obtenidas exitosamente" -ForegroundColor Green
    Write-Host "Total: $($result2.data.stats.total)"
    Write-Host "Activas: $($result2.data.stats.activas)"
    Write-Host "Inactivas: $($result2.data.stats.inactivas)"
} catch {
    Write-Host "Error consultando estadisticas: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Crear nueva comunidad
Write-Host "`n4. Creando nueva comunidad cultural..." -ForegroundColor Yellow
$newComunidad = @{
    nombre = "Test Sin Paginacion"
    descripcion = "Prueba del sistema sin paginacion"
} | ConvertTo-Json

try {
    $result3 = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/comunidades-culturales" -Method POST -Body $newComunidad -Headers $headers
    $createdId = $result3.data.comunidadCultural.id_comunidad_cultural
    Write-Host "Comunidad creada exitosamente con ID: $createdId" -ForegroundColor Green
    Write-Host "Nombre: $($result3.data.comunidadCultural.nombre)"
} catch {
    Write-Host "Error creando comunidad: $($_.Exception.Message)" -ForegroundColor Red
    $createdId = $null
}

# 5. Verificar el total actualizado
if ($createdId) {
    Write-Host "`n5. Verificando total actualizado..." -ForegroundColor Yellow
    try {
        $result4 = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/comunidades-culturales" -Method GET -Headers $headers
        Write-Host "Nuevo total: $($result4.data.total)" -ForegroundColor Green
    } catch {
        Write-Host "Error verificando total: $($_.Exception.Message)" -ForegroundColor Red
    }

    # 6. Limpiar - eliminar la comunidad de prueba
    Write-Host "`n6. Eliminando comunidad de prueba..." -ForegroundColor Yellow
    try {
        $result5 = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/comunidades-culturales/$createdId" -Method DELETE -Headers $headers
        Write-Host "Eliminacion exitosa (soft delete)" -ForegroundColor Green
    } catch {
        Write-Host "Error eliminando: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== PRUEBAS COMPLETADAS ===" -ForegroundColor Green
Write-Host "`nRESUMEN DE CAMBIOS:" -ForegroundColor Cyan
Write-Host "- Se elimino la paginacion (page, limit)" -ForegroundColor White
Write-Host "- Ahora devuelve TODAS las comunidades de una vez" -ForegroundColor White
Write-Host "- Mantiene busqueda, filtros y ordenamiento" -ForegroundColor White
Write-Host "- Respuesta: { comunidadesCulturales: [], total: number }" -ForegroundColor White

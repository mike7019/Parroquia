# Pruebas de API - Situaciones Civiles
# Test completo del CRUD de situaciones civiles

$baseUrl = "http://localhost:3000"

Write-Host "🧪 Iniciando pruebas de API - Situaciones Civiles" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Test 1: Obtener estadísticas
Write-Host "`n📊 Test 1: Estadísticas" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/catalog/situaciones-civiles/stats" -Method GET
    Write-Host "✅ Estadísticas obtenidas exitosamente" -ForegroundColor Green
    Write-Host "   Total: $($response.data.total)" -ForegroundColor White
    Write-Host "   Activos: $($response.data.activos)" -ForegroundColor White
    Write-Host "   Inactivos: $($response.data.inactivos)" -ForegroundColor White
} catch {
    Write-Host "❌ Error en estadísticas: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Listar todas las situaciones civiles
Write-Host "`n📋 Test 2: Listar todas" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/catalog/situaciones-civiles" -Method GET
    Write-Host "✅ Lista obtenida exitosamente" -ForegroundColor Green
    Write-Host "   Total registros: $($response.total)" -ForegroundColor White
    Write-Host "   Registros en página: $($response.data.Count)" -ForegroundColor White
    
    if ($response.data.Count -gt 0) {
        Write-Host "   Primeros registros:" -ForegroundColor White
        $response.data | Select-Object -First 3 | ForEach-Object {
            Write-Host "     - $($_.nombre) ($($_.codigo))" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "❌ Error al listar: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Obtener situación civil específica (ID 1)
Write-Host "`n🔍 Test 3: Obtener por ID (1)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/catalog/situaciones-civiles/1" -Method GET
    Write-Host "✅ Situación civil obtenida exitosamente" -ForegroundColor Green
    Write-Host "   ID: $($response.data.id_situacion_civil)" -ForegroundColor White
    Write-Host "   Nombre: $($response.data.nombre)" -ForegroundColor White
    Write-Host "   Código: $($response.data.codigo)" -ForegroundColor White
    Write-Host "   Descripción: $($response.data.descripcion)" -ForegroundColor White
} catch {
    Write-Host "❌ Error al obtener por ID: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Buscar situaciones civiles
Write-Host "`n🔎 Test 4: Búsqueda (casado)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/catalog/situaciones-civiles/search?q=casado" -Method GET
    Write-Host "✅ Búsqueda exitosa" -ForegroundColor Green
    Write-Host "   Resultados encontrados: $($response.total)" -ForegroundColor White
    
    if ($response.data.Count -gt 0) {
        $response.data | ForEach-Object {
            Write-Host "     - $($_.nombre) ($($_.codigo))" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "❌ Error en búsqueda: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Crear nueva situación civil
Write-Host "`n➕ Test 5: Crear nueva situación civil" -ForegroundColor Yellow
try {
    $newSituacion = @{
        nombre = "Compromiso"
        descripcion = "Persona comprometida para matrimonio"
        codigo = "COM"
        orden = 7
        activo = $true
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/catalog/situaciones-civiles" -Method POST -Body $newSituacion -ContentType "application/json"
    Write-Host "✅ Situación civil creada exitosamente" -ForegroundColor Green
    Write-Host "   ID: $($response.data.id_situacion_civil)" -ForegroundColor White
    Write-Host "   Nombre: $($response.data.nombre)" -ForegroundColor White
    Write-Host "   Código: $($response.data.codigo)" -ForegroundColor White
    
    $newId = $response.data.id_situacion_civil
} catch {
    Write-Host "❌ Error al crear: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Actualizar situación civil creada
if ($newId) {
    Write-Host "`n✏️ Test 6: Actualizar situación civil (ID: $newId)" -ForegroundColor Yellow
    try {
        $updateData = @{
            descripcion = "Persona en proceso de compromiso matrimonial"
            orden = 8
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$baseUrl/api/catalog/situaciones-civiles/$newId" -Method PUT -Body $updateData -ContentType "application/json"
        Write-Host "✅ Situación civil actualizada exitosamente" -ForegroundColor Green
        Write-Host "   Descripción actualizada: $($response.data.descripcion)" -ForegroundColor White
        Write-Host "   Orden actualizado: $($response.data.orden)" -ForegroundColor White
    } catch {
        Write-Host "❌ Error al actualizar: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 7: Eliminar (soft delete) situación civil creada
if ($newId) {
    Write-Host "`n🗑️ Test 7: Eliminar situación civil (ID: $newId)" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/catalog/situaciones-civiles/$newId" -Method DELETE
        Write-Host "✅ Situación civil eliminada exitosamente" -ForegroundColor Green
        Write-Host "   Mensaje: $($response.message)" -ForegroundColor White
    } catch {
        Write-Host "❌ Error al eliminar: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 8: Restaurar situación civil eliminada
if ($newId) {
    Write-Host "`n🔄 Test 8: Restaurar situación civil (ID: $newId)" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/catalog/situaciones-civiles/$newId/restore" -Method POST
        Write-Host "✅ Situación civil restaurada exitosamente" -ForegroundColor Green
        Write-Host "   Mensaje: $($response.message)" -ForegroundColor White
    } catch {
        Write-Host "❌ Error al restaurar: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Pruebas completadas" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan

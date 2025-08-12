# Test Script para Comunidades Culturales CRUD
# Este script prueba todos los endpoints del CRUD de Comunidades Culturales

Write-Host "🧪 Iniciando pruebas del CRUD Comunidades Culturales" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/catalog/comunidades-culturales"
$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

# Variables para los tests
$testComunidadId = $null
$testComunidadNombre = "Comunidad de Prueba"

Write-Host ""
Write-Host "1. 📊 Probando GET /stats - Obtener estadísticas" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/stats" -Method GET -Headers $headers
    Write-Host "✅ Stats obtenidas exitosamente" -ForegroundColor Green
    Write-Host "   Total: $($response.data.stats.total)" -ForegroundColor Gray
    Write-Host "   Activas: $($response.data.stats.activas)" -ForegroundColor Gray
    Write-Host "   Inactivas: $($response.data.stats.inactivas)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error obteniendo stats: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. 📋 Probando GET / - Listar todas las comunidades culturales" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl?page=1&limit=5" -Method GET -Headers $headers
    Write-Host "✅ Lista obtenida exitosamente" -ForegroundColor Green
    Write-Host "   Registros encontrados: $($response.data.comunidadesCulturales.Count)" -ForegroundColor Gray
    Write-Host "   Página actual: $($response.data.pagination.currentPage)" -ForegroundColor Gray
    Write-Host "   Total de páginas: $($response.data.pagination.totalPages)" -ForegroundColor Gray
    
    # Mostrar algunas comunidades
    $response.data.comunidadesCulturales | Select-Object -First 3 | ForEach-Object {
        Write-Host "   - $($_.nombre): $($_.descripcion)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error obteniendo lista: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. 🔍 Probando GET /select - Obtener para dropdown" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/select" -Method GET -Headers $headers
    Write-Host "✅ Select data obtenida exitosamente" -ForegroundColor Green
    Write-Host "   Opciones disponibles: $($response.data.comunidades.Count)" -ForegroundColor Gray
    
    # Mostrar primeras opciones
    $response.data.comunidades | Select-Object -First 3 | ForEach-Object {
        Write-Host "   - Value: $($_.value), Label: $($_.label)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error obteniendo select data: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. ➕ Probando POST / - Crear nueva comunidad cultural" -ForegroundColor Yellow
$newComunidad = @{
    nombre = $testComunidadNombre
    descripcion = "Esta es una comunidad cultural de prueba creada por el script de testing"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $baseUrl -Method POST -Headers $headers -Body $newComunidad
    $testComunidadId = $response.data.comunidadCultural.id_comunidad_cultural
    Write-Host "✅ Comunidad cultural creada exitosamente" -ForegroundColor Green
    Write-Host "   ID: $testComunidadId" -ForegroundColor Gray
    Write-Host "   Nombre: $($response.data.comunidadCultural.nombre)" -ForegroundColor Gray
    Write-Host "   Descripción: $($response.data.comunidadCultural.descripcion)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error creando comunidad cultural: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorDetails = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorDetails)
        $errorContent = $reader.ReadToEnd()
        Write-Host "   Detalles: $errorContent" -ForegroundColor Red
    }
}

if ($testComunidadId) {
    Write-Host ""
    Write-Host "5. 🔍 Probando GET /:id - Obtener comunidad por ID" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/$testComunidadId" -Method GET -Headers $headers
        Write-Host "✅ Comunidad cultural obtenida por ID exitosamente" -ForegroundColor Green
        Write-Host "   ID: $($response.data.comunidadCultural.id_comunidad_cultural)" -ForegroundColor Gray
        Write-Host "   Nombre: $($response.data.comunidadCultural.nombre)" -ForegroundColor Gray
        Write-Host "   Activo: $($response.data.comunidadCultural.activo)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Error obteniendo comunidad por ID: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "6. ✏️ Probando PUT /:id - Actualizar comunidad cultural" -ForegroundColor Yellow
    $updateData = @{
        nombre = "$testComunidadNombre Actualizada"
        descripcion = "Descripción actualizada de la comunidad cultural de prueba"
        activo = $true
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/$testComunidadId" -Method PUT -Headers $headers -Body $updateData
        Write-Host "✅ Comunidad cultural actualizada exitosamente" -ForegroundColor Green
        Write-Host "   Nuevo nombre: $($response.data.comunidadCultural.nombre)" -ForegroundColor Gray
        Write-Host "   Nueva descripción: $($response.data.comunidadCultural.descripcion)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Error actualizando comunidad cultural: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "7. 🗑️ Probando DELETE /:id - Eliminar comunidad cultural (soft delete)" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/$testComunidadId" -Method DELETE -Headers $headers
        Write-Host "✅ Comunidad cultural eliminada exitosamente (soft delete)" -ForegroundColor Green
        Write-Host "   Mensaje: $($response.message)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Error eliminando comunidad cultural: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "8. 🔍 Verificando soft delete - Intentando obtener comunidad eliminada" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/$testComunidadId" -Method GET -Headers $headers
        if ($response.data.comunidadCultural.activo -eq $false) {
            Write-Host "✅ Soft delete verificado - La comunidad está marcada como inactiva" -ForegroundColor Green
        } else {
            Write-Host "⚠️ La comunidad sigue activa después del delete" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "ℹ️ La comunidad eliminada ya no es accesible individualmente" -ForegroundColor Blue
    }
}

Write-Host ""
Write-Host "9. 🔍 Probando filtros de búsqueda" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl?search=Indígena&limit=3" -Method GET -Headers $headers
    Write-Host "✅ Búsqueda por término exitosa" -ForegroundColor Green
    Write-Host "   Resultados encontrados: $($response.data.comunidadesCulturales.Count)" -ForegroundColor Gray
    
    $response.data.comunidadesCulturales | ForEach-Object {
        Write-Host "   - $($_.nombre)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error en búsqueda: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "10. 📊 Probando filtro por estado activo" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl?activo=true&limit=3" -Method GET -Headers $headers
    Write-Host "✅ Filtro por estado activo exitoso" -ForegroundColor Green
    Write-Host "   Comunidades activas encontradas: $($response.data.comunidadesCulturales.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error filtrando por estado: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "11. 🔄 Probando ordenamiento" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl?sortBy=nombre&sortOrder=DESC&limit=3" -Method GET -Headers $headers
    Write-Host "✅ Ordenamiento exitoso" -ForegroundColor Green
    Write-Host "   Primeras 3 comunidades (orden descendente):" -ForegroundColor Gray
    
    $response.data.comunidadesCulturales | ForEach-Object {
        Write-Host "   - $($_.nombre)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error en ordenamiento: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Pruebas del CRUD Comunidades Culturales completadas" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan

# Mostrar resumen de endpoints disponibles
Write-Host ""
Write-Host "📚 Resumen de endpoints disponibles:" -ForegroundColor Cyan
Write-Host "   • GET    $baseUrl - Listar con paginación y filtros" -ForegroundColor White
Write-Host "   • GET    $baseUrl/select - Obtener para dropdown" -ForegroundColor White
Write-Host "   • GET    $baseUrl/stats - Obtener estadísticas" -ForegroundColor White
Write-Host "   • GET    $baseUrl/:id - Obtener por ID" -ForegroundColor White
Write-Host "   • POST   $baseUrl - Crear nueva comunidad" -ForegroundColor White
Write-Host "   • PUT    $baseUrl/:id - Actualizar comunidad" -ForegroundColor White
Write-Host "   • DELETE $baseUrl/:id - Eliminar comunidad (soft delete)" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentación Swagger disponible en: http://localhost:3000/api-docs" -ForegroundColor Blue

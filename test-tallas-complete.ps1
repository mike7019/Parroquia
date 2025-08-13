# Script de prueba completo para el servicio de Tallas
# Prueba todas las funcionalidades del CRUD de tallas

Write-Host "🏷️  INICIANDO PRUEBAS DEL SERVICIO DE TALLAS" -ForegroundColor Green
Write-Host "=" * 50

# Configuración
$baseUrl = "http://localhost:3000/api"
$loginUrl = "$baseUrl/auth/login"
$tallasUrl = "$baseUrl/catalog/tallas"

# Headers base
$headers = @{
    "Content-Type" = "application/json"
}

try {
    # 1. AUTENTICACIÓN
    Write-Host "`n🔑 1. AUTENTICACIÓN" -ForegroundColor Yellow
    $loginData = @{
        email = "admin@parroquia.com"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method POST -Body $loginData -Headers $headers
    
    if ($loginResponse.success) {
        Write-Host "✅ Login exitoso" -ForegroundColor Green
        $token = $loginResponse.data.token
        $headers["Authorization"] = "Bearer $token"
    } else {
        throw "Error en login: $($loginResponse.message)"
    }

    # 2. OBTENER TODAS LAS TALLAS
    Write-Host "`n📋 2. OBTENER TODAS LAS TALLAS" -ForegroundColor Yellow
    $tallasResponse = Invoke-RestMethod -Uri $tallasUrl -Method GET -Headers $headers
    
    if ($tallasResponse.success) {
        $totalTallas = $tallasResponse.data.tallas.Count
        Write-Host "✅ Total de tallas obtenidas: $totalTallas" -ForegroundColor Green
        
        # Mostrar algunas tallas de ejemplo
        Write-Host "`n📊 Ejemplos de tallas:" -ForegroundColor Cyan
        $tallasResponse.data.tallas | Select-Object -First 5 | ForEach-Object {
            Write-Host "   • $($_.tipo_prenda) - $($_.talla) ($($_.genero))" -ForegroundColor White
        }
    }

    # 3. FILTRAR TALLAS POR TIPO DE PRENDA
    Write-Host "`n👟 3. OBTENER TALLAS DE ZAPATOS" -ForegroundColor Yellow
    $zapatosResponse = Invoke-RestMethod -Uri "$tallasUrl/tipo/zapato" -Method GET -Headers $headers
    
    if ($zapatosResponse.success) {
        Write-Host "✅ Tallas de zapatos: $($zapatosResponse.data.total)" -ForegroundColor Green
    }

    # 4. FILTRAR TALLAS DE CAMISAS
    Write-Host "`n👕 4. OBTENER TALLAS DE CAMISAS" -ForegroundColor Yellow
    $camisasResponse = Invoke-RestMethod -Uri "$tallasUrl/tipo/camisa" -Method GET -Headers $headers
    
    if ($camisasResponse.success) {
        Write-Host "✅ Tallas de camisas: $($camisasResponse.data.total)" -ForegroundColor Green
    }

    # 5. FILTRAR TALLAS DE PANTALONES
    Write-Host "`n👖 5. OBTENER TALLAS DE PANTALONES" -ForegroundColor Yellow
    $pantalonesResponse = Invoke-RestMethod -Uri "$tallasUrl/tipo/pantalon" -Method GET -Headers $headers
    
    if ($pantalonesResponse.success) {
        Write-Host "✅ Tallas de pantalones: $($pantalonesResponse.data.total)" -ForegroundColor Green
    }

    # 6. CREAR UNA NUEVA TALLA
    Write-Host "`n➕ 6. CREAR NUEVA TALLA DE PRUEBA" -ForegroundColor Yellow
    $nuevaTalla = @{
        tipo_prenda = "zapato"
        talla = "47"
        genero = "masculino"
        descripcion = "Talla 47 europea para zapatos masculinos - PRUEBA"
        equivalencia_numerica = 47
        activo = $true
    } | ConvertTo-Json

    $createResponse = Invoke-RestMethod -Uri $tallasUrl -Method POST -Body $nuevaTalla -Headers $headers
    
    if ($createResponse.success) {
        $tallaCreada = $createResponse.data.talla
        Write-Host "✅ Talla creada exitosamente: ID $($tallaCreada.id_talla)" -ForegroundColor Green
        $tallaId = $tallaCreada.id_talla
    }

    # 7. OBTENER TALLA POR ID
    Write-Host "`n🔍 7. OBTENER TALLA POR ID" -ForegroundColor Yellow
    if ($tallaId) {
        $tallaResponse = Invoke-RestMethod -Uri "$tallasUrl/$tallaId" -Method GET -Headers $headers
        
        if ($tallaResponse.success) {
            Write-Host "✅ Talla obtenida: $($tallaResponse.data.talla.tipo_prenda) - $($tallaResponse.data.talla.talla)" -ForegroundColor Green
        }
    }

    # 8. ACTUALIZAR TALLA
    Write-Host "`n✏️  8. ACTUALIZAR TALLA" -ForegroundColor Yellow
    if ($tallaId) {
        $updateData = @{
            descripcion = "Talla 47 europea para zapatos masculinos - ACTUALIZADA"
            activo = $true
        } | ConvertTo-Json

        $updateResponse = Invoke-RestMethod -Uri "$tallasUrl/$tallaId" -Method PUT -Body $updateData -Headers $headers
        
        if ($updateResponse.success) {
            Write-Host "✅ Talla actualizada exitosamente" -ForegroundColor Green
        }
    }

    # 9. OBTENER ESTADÍSTICAS
    Write-Host "`n📊 9. OBTENER ESTADÍSTICAS DE TALLAS" -ForegroundColor Yellow
    $estadisticasResponse = Invoke-RestMethod -Uri "$tallasUrl/estadisticas/resumen" -Method GET -Headers $headers
    
    if ($estadisticasResponse.success) {
        $stats = $estadisticasResponse.data.estadisticas
        Write-Host "✅ Estadísticas obtenidas:" -ForegroundColor Green
        Write-Host "   • Total: $($stats.total)" -ForegroundColor White
        Write-Host "   • Activas: $($stats.activas)" -ForegroundColor White
        Write-Host "   • Zapatos: $($stats.por_tipo.zapato)" -ForegroundColor White
        Write-Host "   • Camisas: $($stats.por_tipo.camisa)" -ForegroundColor White
        Write-Host "   • Pantalones: $($stats.por_tipo.pantalon)" -ForegroundColor White
    }

    # 10. FILTROS AVANZADOS
    Write-Host "`n🔍 10. PRUEBAS DE FILTROS AVANZADOS" -ForegroundColor Yellow
    
    # Filtrar por género masculino
    $filtroMasculino = Invoke-RestMethod -Uri "$tallasUrl?genero=masculino&limit=3" -Method GET -Headers $headers
    if ($filtroMasculino.success) {
        Write-Host "✅ Filtro género masculino: $($filtroMasculino.data.tallas.Count) resultados" -ForegroundColor Green
    }
    
    # Buscar por texto
    $busqueda = Invoke-RestMethod -Uri "$tallasUrl?search=42&limit=3" -Method GET -Headers $headers
    if ($busqueda.success) {
        Write-Host "✅ Búsqueda '42': $($busqueda.data.tallas.Count) resultados" -ForegroundColor Green
    }

    # 11. ELIMINAR TALLA DE PRUEBA
    Write-Host "`n🗑️  11. ELIMINAR TALLA DE PRUEBA" -ForegroundColor Yellow
    if ($tallaId) {
        $deleteResponse = Invoke-RestMethod -Uri "$tallasUrl/$tallaId" -Method DELETE -Headers $headers
        
        if ($deleteResponse.success) {
            Write-Host "✅ Talla eliminada exitosamente" -ForegroundColor Green
        }
    }

    # 12. VERIFICAR ELIMINACIÓN
    Write-Host "`n🔍 12. VERIFICAR ELIMINACIÓN" -ForegroundColor Yellow
    if ($tallaId) {
        try {
            $verificacionResponse = Invoke-RestMethod -Uri "$tallasUrl/$tallaId" -Method GET -Headers $headers
            Write-Host "❌ ERROR: La talla aún existe" -ForegroundColor Red
        } catch {
            Write-Host "✅ Verificado: La talla fue eliminada correctamente" -ForegroundColor Green
        }
    }

    Write-Host "`n🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE" -ForegroundColor Green
    Write-Host "=" * 50

} catch {
    Write-Host "`n❌ ERROR EN LAS PRUEBAS:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Detalles del error: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n✨ PRUEBAS FINALIZADAS" -ForegroundColor Cyan

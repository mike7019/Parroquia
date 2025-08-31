# Test completo del endpoint de parroquias
Write-Host "🔧 Probando endpoint de parroquias implementado" -ForegroundColor Green

# Configurar autenticación
$loginBody = @{ 
    correo_electronico = 'admin@parroquia.com'
    contrasena = 'Admin123!' 
} | ConvertTo-Json

$headers = @{ 'Content-Type' = 'application/json' }

try {
    Write-Host "`n1. Autenticando..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method Post -Body $loginBody -Headers $headers
    $token = $response.data.accessToken
    $authHeaders = @{ 'Authorization' = "Bearer $token" }
    Write-Host "   ✅ Login exitoso: $($response.data.user.primer_nombre) $($response.data.user.primer_apellido)"

    Write-Host "`n2. Probando GET /api/parroquias" -ForegroundColor Yellow
    $result = Invoke-RestMethod -Uri 'http://localhost:3000/api/parroquias' -Method Get -Headers $authHeaders
    Write-Host "   ✅ Éxito: $($result.mensaje)"
    Write-Host "   📊 Total: $($result.total) parroquias"
    if ($result.datos.Count -gt 0) {
        $result.datos | Select-Object -First 2 | Format-Table nombre_parroquia, nombre_departamento, total_familias, total_personas -AutoSize
    }

    Write-Host "`n3. Probando GET /api/parroquias/estadisticas" -ForegroundColor Yellow
    $estadisticas = Invoke-RestMethod -Uri 'http://localhost:3000/api/parroquias/estadisticas' -Method Get -Headers $authHeaders
    Write-Host "   ✅ Éxito: estadísticas obtenidas"
    Write-Host "   📈 Resumen:"
    $resumen = $estadisticas.datos.resumen_general
    Write-Host "      - Parroquias: $($resumen.total_parroquias)"
    Write-Host "      - Familias: $($resumen.total_familias)"
    Write-Host "      - Personas: $($resumen.total_personas)"

    Write-Host "`n4. Probando GET /api/parroquias/filtros" -ForegroundColor Yellow
    try {
        $filtros = Invoke-RestMethod -Uri 'http://localhost:3000/api/parroquias/filtros' -Method Get -Headers $authHeaders
        Write-Host "   ✅ Éxito: filtros obtenidos"
    } catch {
        Write-Host "   ❌ Error en filtros: $($_.Exception.Message)" -ForegroundColor Red
    }

    if ($result.datos.Count -gt 0) {
        $primerParroquia = $result.datos[0]
        $id = $primerParroquia.id_parroquia
        Write-Host "`n5. Probando GET /api/parroquias/$id" -ForegroundColor Yellow
        try {
            $detalle = Invoke-RestMethod -Uri "http://localhost:3000/api/parroquias/$id" -Method Get -Headers $authHeaders
            Write-Host "   ✅ Éxito: detalle de parroquia obtenido"
            Write-Host "   🏛️ Parroquia: $($detalle.datos.nombre_parroquia)"
        } catch {
            Write-Host "   ❌ Error en detalle: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    Write-Host "`n🎉 Pruebas completadas!" -ForegroundColor Green

} catch {
    Write-Host "❌ Error en autenticación: $($_.Exception.Message)" -ForegroundColor Red
}

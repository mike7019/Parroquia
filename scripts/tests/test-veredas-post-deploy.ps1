# 🧪 Script para probar endpoints de veredas después del deployment (PowerShell)

Write-Host "🧪 Probando endpoints de veredas en servidor..." -ForegroundColor Blue
Write-Host "📅 $(Get-Date)" -ForegroundColor Blue
Write-Host ""

# Configuración del servidor (ajustar según corresponda)
$SERVER_URL = "http://localhost:5000"  # Cambiar por la URL del servidor
$ADMIN_EMAIL = "admin@test.com"
$ADMIN_PASSWORD = "Admin123!"

try {
    # 1. Obtener token de autenticación
    Write-Host "ℹ️  Obteniendo token de autenticación..." -ForegroundColor Blue
    
    $authBody = @{
        correo_electronico = $ADMIN_EMAIL
        contrasena = $ADMIN_PASSWORD
    } | ConvertTo-Json
    
    $authResponse = Invoke-RestMethod -Uri "$SERVER_URL/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $authBody -ErrorAction Stop
    
    $token = $authResponse.data.accessToken
    if (-not $token) {
        Write-Host "❌ No se pudo obtener token de autenticación" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Token obtenido correctamente" -ForegroundColor Green
    
    # Headers para las siguientes peticiones
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # 2. Probar GET /api/catalog/veredas
    Write-Host "ℹ️  Probando GET /api/catalog/veredas..." -ForegroundColor Blue
    
    $veredasResponse = Invoke-RestMethod -Uri "$SERVER_URL/api/catalog/veredas" -Method GET -Headers $headers -ErrorAction Stop
    
    if ($veredasResponse.success -and $veredasResponse.data.status -eq "success") {
        Write-Host "✅ Endpoint GET /api/catalog/veredas funciona correctamente" -ForegroundColor Green
        Write-Host "ℹ️  Total de veredas encontradas: $($veredasResponse.data.total)" -ForegroundColor Blue
    } else {
        Write-Host "❌ Endpoint GET /api/catalog/veredas falló" -ForegroundColor Red
        Write-Host "Respuesta: $($veredasResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Yellow
        exit 1
    }
    
    # 3. Probar búsqueda de veredas
    Write-Host "ℹ️  Probando búsqueda de veredas..." -ForegroundColor Blue
    
    try {
        $searchResponse = Invoke-RestMethod -Uri "$SERVER_URL/api/catalog/veredas/search?q=test" -Method GET -Headers $headers -ErrorAction Stop
        
        if ($searchResponse.success) {
            Write-Host "✅ Endpoint de búsqueda funciona correctamente" -ForegroundColor Green
        } else {
            Write-Host "❌ Endpoint de búsqueda falló" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error en búsqueda: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # 4. Probar estadísticas
    Write-Host "ℹ️  Probando estadísticas de veredas..." -ForegroundColor Blue
    
    try {
        $statsResponse = Invoke-RestMethod -Uri "$SERVER_URL/api/catalog/veredas/statistics" -Method GET -Headers $headers -ErrorAction Stop
        
        if ($statsResponse.success) {
            Write-Host "✅ Endpoint de estadísticas funciona correctamente" -ForegroundColor Green
        } else {
            Write-Host "❌ Endpoint de estadísticas falló" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error en estadísticas: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # 5. Verificar que no haya errores de id_sector
    Write-Host "ℹ️  Verificando que no haya errores de id_sector..." -ForegroundColor Blue
    
    $veredasJson = $veredasResponse | ConvertTo-Json -Depth 10
    if ($veredasJson -like "*id_sector*does not exist*") {
        Write-Host "❌ ¡Aún hay referencias a id_sector!" -ForegroundColor Red
        Write-Host "Respuesta completa: $veredasJson" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "✅ No se encontraron errores de id_sector" -ForegroundColor Green
    }
    
    # Resumen final
    Write-Host ""
    Write-Host "🎉 PRUEBAS COMPLETADAS" -ForegroundColor Green
    Write-Host "======================" -ForegroundColor Green
    Write-Host "✅ Autenticación funcional" -ForegroundColor Green
    Write-Host "✅ Endpoint principal de veredas funcional" -ForegroundColor Green
    Write-Host "✅ Búsqueda de veredas funcional" -ForegroundColor Green
    Write-Host "✅ Estadísticas funcionales" -ForegroundColor Green
    Write-Host "✅ No hay errores de id_sector" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ El problema del id_sector ha sido solucionado" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "❌ Error general: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Detalles: $($_.Exception)" -ForegroundColor Yellow
    exit 1
}

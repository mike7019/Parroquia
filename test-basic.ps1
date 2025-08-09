Write-Host "Prueba básica de endpoint público..." -ForegroundColor Green

# Probar endpoint público primero
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/tipos-identificacion" -Method GET
    Write-Host "✅ Endpoint público funciona - Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Datos obtenidos: $($data.data.count) tipos de identificación" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error en endpoint público: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPrueba de creación de tipo de aguas residuales SIN autenticación..." -ForegroundColor Yellow
try {
    $headers = @{'Content-Type' = 'application/json'}
    $newTypeData = '{"nombre":"Test Simple","descripcion":"Prueba básica"}'
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/catalog/aguas-residuales" -Method POST -Headers $headers -Body $newTypeData
    Write-Host "Respuesta inesperada (debería fallar): $($response.StatusCode)" -ForegroundColor Red
} catch {
    Write-Host "✅ Esperado: Endpoint requiere autenticación - $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n=== PRUEBA BÁSICA COMPLETADA ===" -ForegroundColor Green

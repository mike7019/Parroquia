# Test básico de situaciones civiles - Simple Test
$baseUrl = "http://localhost:3000"

Write-Host "🧪 Test básico: Situaciones Civiles API" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test de health check del catálogo (endpoint público)
Write-Host "`n📊 Test: Health check del catálogo" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/catalog/health" -Method GET
    Write-Host "✅ Health check exitoso" -ForegroundColor Green
    Write-Host "   Status: $($response.success)" -ForegroundColor White
    Write-Host "   Message: $($response.message)" -ForegroundColor White
    Write-Host "   Situaciones Civiles: $($response.services.situacionesCiviles)" -ForegroundColor White
} catch {
    Write-Host "❌ Error en health check: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de endpoint con auth - debe dar error 401
Write-Host "`n🔒 Test: Endpoint protegido (sin token)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/catalog/situaciones-civiles/stats" -Method GET
    Write-Host "⚠️  Inesperado: No se requirió autenticación" -ForegroundColor Orange
} catch {
    if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*token*") {
        Write-Host "✅ Correcto: Endpoint protegido requiere autenticación" -ForegroundColor Green
        Write-Host "   Error esperado: $($_.Exception.Message)" -ForegroundColor White
    } else {
        Write-Host "❌ Error inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test de documentación Swagger
Write-Host "`n📖 Test: Documentación Swagger" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api-docs" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Documentación Swagger accesible" -ForegroundColor Green
        Write-Host "   URL: $baseUrl/api-docs" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error accediendo a Swagger: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Test básico completado" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "`n💡 Para pruebas completas:" -ForegroundColor Yellow
Write-Host "   1. Crear usuario con /api/auth/register" -ForegroundColor White
Write-Host "   2. Hacer login con /api/auth/login" -ForegroundColor White  
Write-Host "   3. Usar token para endpoints protegidos" -ForegroundColor White
Write-Host "   4. Ver documentación en: $baseUrl/api-docs" -ForegroundColor White

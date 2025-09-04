Write-Host "🚀 SCRIPT DE CORRECCIÓN COMPLETA PARA PRODUCCIÓN" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host "`n1️⃣ Paso 1: Corrigiendo estructura de base de datos..." -ForegroundColor Yellow
npm run db:fix:structure

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Estructura de base de datos corregida" -ForegroundColor Green
} else {
    Write-Host "❌ Error en estructura de base de datos" -ForegroundColor Red
    exit 1
}

Write-Host "`n2️⃣ Paso 2: Cargando datos de configuración (departamentos/municipios)..." -ForegroundColor Yellow
npm run db:seed:config

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Datos de configuración cargados" -ForegroundColor Green
} else {
    Write-Host "❌ Error cargando datos de configuración" -ForegroundColor Red
    exit 1
}

Write-Host "`n3️⃣ Paso 3: Creando datos geográficos locales..." -ForegroundColor Yellow
node crear-sector-id-1.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Datos geográficos locales creados" -ForegroundColor Green
} else {
    Write-Host "❌ Error creando datos geográficos locales" -ForegroundColor Red
    exit 1
}

Write-Host "`n4️⃣ Paso 4: Verificación final..." -ForegroundColor Yellow
node mostrar-ids-disponibles.js

Write-Host "`n🎉 ¡CORRECCIÓN COMPLETA FINALIZADA!" -ForegroundColor Green
Write-Host "🎯 El sistema ya debería procesar encuestas correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Para verificar, intenta crear una encuesta usando:" -ForegroundColor Cyan
Write-Host "   - id_municipio: 1" -ForegroundColor Cyan
Write-Host "   - id_sector: 1" -ForegroundColor Cyan
Write-Host "   - id_vereda: 1" -ForegroundColor Cyan

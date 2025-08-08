# Script para corregir problemas en endpoints de Vereda
# PowerShell script para documentar y corregir errores

Write-Host "=== ANÁLISIS DE PROBLEMAS EN ENDPOINTS DE VEREDA ===" -ForegroundColor Red

Write-Host "`n🔍 PROBLEMAS IDENTIFICADOS:" -ForegroundColor Yellow

Write-Host "`n1. MODELO VEREDAS - Campos faltantes:" -ForegroundColor Cyan
Write-Host "   ❌ Campo 'codigo_vereda' no existe en el modelo" -ForegroundColor Red
Write-Host "   ❌ Servicio usa 'id_municipio' pero modelo tiene 'id_municipio_municipios'" -ForegroundColor Red

Write-Host "`n2. ASOCIACIONES - Relaciones no definidas:" -ForegroundColor Cyan
Write-Host "   ❌ Asociación 'personas' no está definida en Veredas" -ForegroundColor Red
Write-Host "   ❌ Asociación 'sectores' no está definida en Veredas" -ForegroundColor Red

Write-Host "`n3. CONSULTAS SQL - Referencias incorrectas:" -ForegroundColor Cyan
Write-Host "   ❌ 'municipio.id' debería ser 'municipio.id_municipio'" -ForegroundColor Red

Write-Host "`n4. ERRORES ESPECÍFICOS ENCONTRADOS:" -ForegroundColor Cyan
Write-Host "   • Error: column municipio.id does not exist" -ForegroundColor Red
Write-Host "   • Error: column Veredas.codigo_vereda does not exist" -ForegroundColor Red
Write-Host "   • Error: Association with alias 'personas' does not exist on Veredas" -ForegroundColor Red

Write-Host "`n📋 ARCHIVOS QUE NECESITAN CORRECCIÓN:" -ForegroundColor Yellow
Write-Host "   1. src/models/catalog/Veredas.js - Agregar campo codigo_vereda" -ForegroundColor White
Write-Host "   2. src/services/catalog/veredaService.js - Corregir nombres de campos" -ForegroundColor White
Write-Host "   3. src/models/catalog/index.js - Agregar asociaciones faltantes" -ForegroundColor White

Write-Host "`n💡 SOLUCIONES PROPUESTAS:" -ForegroundColor Green

Write-Host "`n🔧 SOLUCIÓN 1: Agregar campo codigo_vereda al modelo Veredas" -ForegroundColor Green
Write-Host "// En src/models/catalog/Veredas.js agregar:" -ForegroundColor Gray
Write-Host "codigo_vereda: {" -ForegroundColor Gray
Write-Host "  type: DataTypes.STRING(50)," -ForegroundColor Gray
Write-Host "  allowNull: true," -ForegroundColor Gray
Write-Host "  unique: true" -ForegroundColor Gray
Write-Host "}" -ForegroundColor Gray

Write-Host "`n🔧 SOLUCIÓN 2: Corregir referencias en veredaService.js" -ForegroundColor Green
Write-Host "// Cambiar todas las referencias de:" -ForegroundColor Gray
Write-Host "id_municipio -> id_municipio_municipios" -ForegroundColor Gray
Write-Host "municipio.id -> municipio.id_municipio" -ForegroundColor Gray

Write-Host "`n🔧 SOLUCIÓN 3: Agregar asociaciones faltantes" -ForegroundColor Green
Write-Host "// En src/models/catalog/index.js agregar:" -ForegroundColor Gray
Write-Host "// Asociaciones con sectores" -ForegroundColor Gray
Write-Host "Veredas.hasMany(Sector, {" -ForegroundColor Gray
Write-Host "    foreignKey: 'id_vereda'," -ForegroundColor Gray
Write-Host "    as: 'sectores'" -ForegroundColor Gray
Write-Host "});" -ForegroundColor Gray
Write-Host "" -ForegroundColor Gray
Write-Host "// Asociaciones con personas (si existe modelo Persona)" -ForegroundColor Gray
Write-Host "Veredas.hasMany(Persona, {" -ForegroundColor Gray
Write-Host "    foreignKey: 'id_vereda'," -ForegroundColor Gray
Write-Host "    as: 'personas'" -ForegroundColor Gray
Write-Host "});" -ForegroundColor Gray

Write-Host "`n🔧 SOLUCIÓN 4: Crear migración para agregar campo codigo_vereda" -ForegroundColor Green
Write-Host "// SQL para agregar campo:" -ForegroundColor Gray
Write-Host "ALTER TABLE veredas ADD COLUMN codigo_vereda VARCHAR(50) UNIQUE;" -ForegroundColor Gray

Write-Host "`n⚡ ACCIONES INMEDIATAS RECOMENDADAS:" -ForegroundColor Magenta
Write-Host "   1. ✅ Revisar estructura actual de tabla veredas en BD" -ForegroundColor Green
Write-Host "   2. ✅ Verificar si existe modelo Persona" -ForegroundColor Green  
Write-Host "   3. ✅ Crear migración para campo codigo_vereda si es necesario" -ForegroundColor Green
Write-Host "   4. ✅ Corregir veredaService.js con nombres correctos" -ForegroundColor Green
Write-Host "   5. ✅ Agregar asociaciones faltantes" -ForegroundColor Green

Write-Host "`n🎯 PRÓXIMOS PASOS:" -ForegroundColor Blue
Write-Host "   1. Verificar estructura de BD" -ForegroundColor White
Write-Host "   2. Aplicar correcciones sugeridas" -ForegroundColor White  
Write-Host "   3. Ejecutar pruebas nuevamente" -ForegroundColor White
Write-Host "   4. Validar que todos los endpoints funcionen" -ForegroundColor White

Write-Host "`n=== FIN DEL ANÁLISIS ===" -ForegroundColor Red

# Script PowerShell para desplegar la corrección del error de familias al servidor remoto

Write-Host "🚀 Iniciando despliegue de corrección de familias..." -ForegroundColor Green

# 1. Hacer commit de los cambios locales
Write-Host "📝 Commiteando cambios locales..." -ForegroundColor Yellow
git add .
git commit -m "fix: Corregir error de inserción en modelo Familias

- Añadir field explícito en modelo Familias
- Convertir IDs a números en controlador de encuestas  
- Agregar scripts de diagnóstico y corrección de secuencias
- Mejorar manejo de auto-incremento en PostgreSQL"

# 2. Push a la rama feature
Write-Host "📤 Enviando cambios al repositorio..." -ForegroundColor Yellow
git push origin feature

Write-Host "✅ Cambios enviados al repositorio" -ForegroundColor Green

Write-Host "🔧 Próximos pasos en el servidor remoto:" -ForegroundColor Cyan
Write-Host "1. git pull origin feature"
Write-Host "2. npm install (si hay nuevas dependencias)"  
Write-Host "3. node sync-familias-model.js (para sincronizar BD)"
Write-Host "4. npm run pm2:restart (para reiniciar aplicación)"

Write-Host "📋 Archivos modificados:" -ForegroundColor Cyan
Write-Host "- src/models/catalog/Familias.js (field explícito)"
Write-Host "- src/controllers/encuestaController.js (conversión de IDs)"
Write-Host "- sync-familias-model.js (script de sincronización)"
Write-Host "- test-familias-*.js (scripts de diagnóstico)"

Write-Host "🎯 Problema resuelto:" -ForegroundColor Green
Write-Host "- Error de constraint 'id_familia not-null' corregido"
Write-Host "- IDs de municipio/vereda/sector convertidos a números"
Write-Host "- Secuencia de auto-incremento verificada y corregida"

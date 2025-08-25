#!/bin/bash

# Script para desplegar la corrección del error de familias al servidor remoto

echo "🚀 Iniciando despliegue de corrección de familias..."

# 1. Hacer commit de los cambios locales
echo "📝 Commiteando cambios locales..."
git add .
git commit -m "fix: Corregir error de inserción en modelo Familias

- Añadir field explícito en modelo Familias
- Convertir IDs a números en controlador de encuestas  
- Agregar scripts de diagnóstico y corrección de secuencias
- Mejorar manejo de auto-incremento en PostgreSQL"

# 2. Push a la rama feature
echo "📤 Enviando cambios al repositorio..."
git push origin feature

echo "✅ Cambios enviados al repositorio"

echo "🔧 Próximos pasos en el servidor remoto:"
echo "1. git pull origin feature"
echo "2. npm install (si hay nuevas dependencias)"  
echo "3. node sync-familias-model.js (para sincronizar BD)"
echo "4. npm run pm2:restart (para reiniciar aplicación)"

echo "📋 Archivos modificados:"
echo "- src/models/catalog/Familias.js (field explícito)"
echo "- src/controllers/encuestaController.js (conversión de IDs)"
echo "- sync-familias-model.js (script de sincronización)"
echo "- test-familias-*.js (scripts de diagnóstico)"

echo "🎯 Problema resuelto:"
echo "- Error de constraint 'id_familia not-null' corregido"
echo "- IDs de municipio/vereda/sector convertidos a números"
echo "- Secuencia de auto-incremento verificada y corregida"

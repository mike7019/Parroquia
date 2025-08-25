#!/bin/bash

echo "🚀 DESPLEGANDO CORRECCIÓN DE FAMILIAS AL SERVIDOR REMOTO"
echo "======================================================="

# Verificar que estamos en la rama feature
current_branch=$(git branch --show-current)
if [ "$current_branch" != "feature" ]; then
    echo "❌ No estás en la rama feature. Cambiando..."
    git checkout feature
fi

echo "📋 Cambios incluidos en este despliegue:"
echo "- Corrección de conversión de IDs a enteros en encuestaController"
echo "- Modelo Familias mejorado con field mapping"
echo "- Scripts de diagnóstico y corrección de BD"
echo ""

echo "🔧 Comando para ejecutar en el servidor remoto:"
echo "----------------------------------------------"
echo "cd /home/l4bs/parroquia/backend/Parroquia"
echo "git pull origin feature"
echo "npm install"
echo "npm run pm2:restart"
echo ""

echo "📊 Si persiste el error, ejecutar también:"
echo "-----------------------------------------"
echo "node sync-familias-model.js"
echo "node test-familias-insertion.js"
echo ""

echo "✅ Los cambios ya están pusheados en la rama feature"
echo "⚠️  IMPORTANTE: Ejecutar los comandos en el servidor para aplicar cambios"

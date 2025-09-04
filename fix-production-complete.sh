#!/bin/bash

echo "🚀 SCRIPT DE CORRECCIÓN COMPLETA PARA PRODUCCIÓN"
echo "================================================"

echo "1️⃣ Paso 1: Corrigiendo estructura de base de datos..."
npm run db:fix:structure

if [ $? -eq 0 ]; then
    echo "✅ Estructura de base de datos corregida"
else
    echo "❌ Error en estructura de base de datos"
    exit 1
fi

echo ""
echo "2️⃣ Paso 2: Cargando datos de configuración (departamentos/municipios)..."
npm run db:seed:config

if [ $? -eq 0 ]; then
    echo "✅ Datos de configuración cargados"
else
    echo "❌ Error cargando datos de configuración"
    exit 1
fi

echo ""
echo "3️⃣ Paso 3: Creando datos geográficos locales..."
node crear-sector-id-1.js

if [ $? -eq 0 ]; then
    echo "✅ Datos geográficos locales creados"
else
    echo "❌ Error creando datos geográficos locales"
    exit 1
fi

echo ""
echo "4️⃣ Paso 4: Verificación final..."
node mostrar-ids-disponibles.js

echo ""
echo "🎉 ¡CORRECCIÓN COMPLETA FINALIZADA!"
echo "🎯 El sistema ya debería procesar encuestas correctamente"
echo ""
echo "📝 Para verificar, intenta crear una encuesta usando:"
echo "   - id_municipio: 1"
echo "   - id_sector: 1" 
echo "   - id_vereda: 1"

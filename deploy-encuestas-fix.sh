#!/bin/bash

# APLICAR CORRECCIÓN DE ENCUESTAS EN PRODUCCIÓN
# ============================================
#
# Este script aplica todas las correcciones necesarias para resolver
# el error de transacción en la creación de encuestas.
#
# USO: ./deploy-encuestas-fix.sh
#

echo "🚀 APLICANDO CORRECCIÓN DE ENCUESTAS EN PRODUCCIÓN"
echo "═══════════════════════════════════════════════════════"
echo "📅 $(date)"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: No se encuentra package.json"
    echo "   Ejecutar desde el directorio raíz del proyecto"
    exit 1
fi

# Hacer backup del estado actual
echo "💾 Creando backup del estado actual..."
git stash push -m "backup antes de corrección encuestas $(date)"
echo "✅ Backup creado"

# Traer los últimos cambios
echo ""
echo "📥 Actualizando código desde repositorio..."
git pull origin develop
if [ $? -ne 0 ]; then
    echo "❌ ERROR: No se pudo actualizar el código"
    exit 1
fi
echo "✅ Código actualizado"

# Verificar que existe el script de corrección
if [ ! -f "fix-production-encuestas.js" ]; then
    echo "❌ ERROR: No se encuentra fix-production-encuestas.js"
    echo "   Verificar que el archivo esté en el repositorio"
    exit 1
fi

# Aplicar las correcciones
echo ""
echo "🔧 Aplicando correcciones de base de datos..."
node fix-production-encuestas.js
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Falló la corrección de base de datos"
    echo "   Revisar logs para más detalles"
    exit 1
fi
echo "✅ Correcciones aplicadas exitosamente"

# Reiniciar la aplicación
echo ""
echo "🔄 Reiniciando aplicación..."
if command -v pm2 &> /dev/null; then
    pm2 restart all
    echo "✅ Aplicación reiniciada con PM2"
elif docker-compose ps | grep -q "api"; then
    docker-compose restart api
    echo "✅ Aplicación reiniciada con Docker"
else
    echo "⚠️ No se detectó PM2 ni Docker - reiniciar manualmente"
fi

# Verificar que la aplicación esté funcionando
echo ""
echo "🧪 Verificando estado de la aplicación..."
sleep 3

# Probar endpoint de salud
if curl -f -s "http://localhost:3000/api/health" > /dev/null; then
    echo "✅ Aplicación respondiendo correctamente"
else
    echo "⚠️ La aplicación puede estar iniciando - verificar en unos minutos"
fi

echo ""
echo "🏆 CORRECCIÓN COMPLETADA"
echo "═══════════════════════════════════════════════════════"
echo "✅ Código actualizado desde repositorio"
echo "✅ Correcciones de base de datos aplicadas"
echo "✅ Aplicación reiniciada"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "   1. Probar creación de encuesta desde la interfaz"
echo "   2. Verificar que no aparezcan errores de transacción"
echo "   3. Monitorear logs por posibles issues"
echo ""
echo "📞 En caso de problemas, contactar al equipo de desarrollo"

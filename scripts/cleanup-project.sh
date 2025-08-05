#!/bin/bash
# Script de limpieza completa del proyecto Parroquia
# Autor: GitHub Copilot
# Fecha: 2025-08-02

echo "🧹 INICIANDO LIMPIEZA COMPLETA DEL PROYECTO PARROQUIA"
echo "===================================================="

# Crear directorios de organización si no existen
echo "📁 Creando estructura de directorios..."
mkdir -p scripts/utilities
mkdir -p scripts/tests  
mkdir -p scripts/deployment
mkdir -p scripts/database
mkdir -p temp/old-files

# Mover archivos de utilidad a su carpeta correspondiente
echo "📦 Organizando archivos de utilidad..."

# Scripts de verificación de base de datos
if [ -f "check-migration-status.cjs" ]; then
    mv check-*.cjs scripts/database/
    echo "  ✅ Scripts de verificación movidos a scripts/database/"
fi

if [ -f "check-migration-status.js" ]; then
    mv check-*.js scripts/database/
fi

# Scripts de población y configuración
if [ -f "populate-roles.js" ]; then
    mv populate-roles.js scripts/database/
    echo "  ✅ Script de población de roles movido"
fi

if [ -f "createAdminUser.js" ]; then
    mv createAdminUser.js scripts/database/
    echo "  ✅ Script de creación de admin movido"
fi

if [ -f "updateAdminEmail.js" ]; then
    mv updateAdminEmail.js scripts/database/
    echo "  ✅ Script de actualización de admin movido"
fi

# Scripts de deployment
if [ -f "deploy.sh" ]; then
    mv deploy.sh scripts/deployment/
    mv deploy.ps1 scripts/deployment/
    mv pre-deploy.sh scripts/deployment/
    mv prepare-for-deploy.sh scripts/deployment/
    echo "  ✅ Scripts de deployment movidos"
fi

# Scripts de utilidad general
mv load-basic-data.js scripts/utilities/ 2>/dev/null || true
mv loadCatalogData.js scripts/utilities/ 2>/dev/null || true
mv list-tables.js scripts/utilities/ 2>/dev/null || true
mv run-migration.js scripts/utilities/ 2>/dev/null || true
mv validate-*.js scripts/utilities/ 2>/dev/null || true
mv validate-*.cjs scripts/utilities/ 2>/dev/null || true
mv generate-*.js scripts/utilities/ 2>/dev/null || true
mv sector-creation-guide.js scripts/utilities/ 2>/dev/null || true
mv setup-roles-admin.js scripts/utilities/ 2>/dev/null || true
mv show-all-personas-columns.cjs scripts/utilities/ 2>/dev/null || true

echo "  ✅ Scripts de utilidad organizados"

# Mover archivos de prueba temporales
echo "🗑️  Eliminando archivos de prueba temporales..."

# Eliminar archivos de prueba temporales
rm -f test-user-registration.js
rm -f test-registration-fix*.ps1
rm -f test-app.js
rm -f test-imports.js
rm -f test-relaciones-territoriales.js
rm -f ejemplo-parroquia-municipio.js
rm -f ejemplos-familias.js

echo "  ✅ Archivos de prueba temporales eliminados"

# Limpiar modelos duplicados y backup
echo "🧹 Limpiando modelos duplicados..."
rm -f src/models/User_backup.js
rm -f src/models/User_clean.js
rm -f src/config/swagger_clean.js

echo "  ✅ Archivos backup eliminados"

# Limpiar archivos temporales de SQL
echo "🗄️  Limpiando archivos SQL temporales..."
rm -f sql/test_clean.sql

echo "  ✅ Archivos SQL temporales eliminados"

# Limpiar logs antiguos si existen
echo "📋 Limpiando logs antiguos..."
if [ -d "logs" ]; then
    find logs/ -name "*.log" -size +10M -delete 2>/dev/null || true
    echo "  ✅ Logs grandes eliminados"
fi

# Limpiar node_modules cache si está muy grande
echo "📦 Verificando node_modules..."
if [ -d "node_modules" ]; then
    SIZE=$(du -sh node_modules | cut -f1)
    echo "  📊 Tamaño de node_modules: $SIZE"
fi

# Limpiar archivos temporales del sistema
echo "🧽 Limpieza final..."
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true

echo "  ✅ Archivos temporales del sistema eliminados"

echo ""
echo "🎉 LIMPIEZA COMPLETADA"
echo "====================="
echo ""
echo "📋 Resumen de cambios:"
echo "  • Scripts organizados en carpetas temáticas"
echo "  • Archivos de prueba temporales eliminados"
echo "  • Modelos backup eliminados"
echo "  • Archivos temporales del sistema limpiados"
echo ""
echo "📁 Nueva estructura de scripts:"
echo "  • scripts/database/     - Scripts de base de datos"
echo "  • scripts/deployment/   - Scripts de despliegue"
echo "  • scripts/utilities/    - Utilidades generales"
echo "  • scripts/tests/        - Scripts de prueba"
echo ""
echo "✅ El proyecto está ahora más organizado y limpio!"

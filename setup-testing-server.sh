#!/bin/bash

# SCRIPT DE CONFIGURACIÓN COMPLETA PARA SERVIDOR DE TESTING
# =========================================================
#
# Este script configura completamente un nuevo servidor de testing
# después de clonar el repositorio.
#
# USO: ./setup-testing-server.sh
#

echo "🚀 CONFIGURACIÓN COMPLETA DEL SERVIDOR DE TESTING"
echo "═════════════════════════════════════════════════════════"
echo "📅 $(date)"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: No se encuentra package.json"
    echo "   Ejecutar desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar que estamos en la rama testing
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "testing" ]; then
    echo "⚠️ ADVERTENCIA: No estás en la rama 'testing'"
    echo "   Rama actual: $CURRENT_BRANCH"
    echo "   Cambiando a rama testing..."
    git checkout testing
    if [ $? -ne 0 ]; then
        echo "❌ ERROR: No se pudo cambiar a la rama testing"
        exit 1
    fi
fi

echo "✅ Rama testing activa"

# Instalar dependencias
echo ""
echo "📦 INSTALANDO DEPENDENCIAS"
echo "─────────────────────────────────────────────────────────"
npm install
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Falló la instalación de dependencias"
    exit 1
fi
echo "✅ Dependencias instaladas"

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️ ARCHIVO .env NO ENCONTRADO"
    echo "─────────────────────────────────────────────────────────"
    echo "Creando archivo .env básico..."
    
    cat > .env << EOF
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parroquia_db
DB_USER=parroquia_user
DB_PASSWORD=ParroquiaSecure2025

# Configuración de Aplicación
PORT=3000
NODE_ENV=testing

# JWT Secrets
JWT_SECRET=testing_jwt_secret_key_2025_parroquia_system
JWT_REFRESH_SECRET=testing_refresh_secret_key_2025_parroquia

# SMTP Configuration (opcional para testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Logging
VERBOSE_LOGGING=true
EOF
    
    echo "✅ Archivo .env creado con configuración básica"
    echo "⚠️ IMPORTANTE: Revisar y ajustar las credenciales de base de datos"
else
    echo "✅ Archivo .env encontrado"
fi

# Ejecutar sincronización completa de base de datos
echo ""
echo "🗄️ SINCRONIZACIÓN COMPLETA DE BASE DE DATOS"
echo "─────────────────────────────────────────────────────────"
npm run sync:testing:robust
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Falló la sincronización de base de datos"
    echo "   Verificar:"
    echo "   - Que PostgreSQL esté ejecutándose"
    echo "   - Que las credenciales en .env sean correctas"
    echo "   - Que la base de datos exista"
    exit 1
fi

echo ""
echo "🎉 ¡CONFIGURACIÓN COMPLETA EXITOSA!"
echo "═════════════════════════════════════════════════════════"
echo "✅ Dependencias instaladas"
echo "✅ Base de datos sincronizada"
echo "✅ Catálogos básicos cargados"
echo "✅ Usuario administrador creado"
echo "✅ Sistema de encuestas verificado"
echo ""
echo "🚀 SERVIDOR DE TESTING LISTO"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "   1. Iniciar el servidor: npm run dev"
echo "   2. Acceder a: http://localhost:3000"
echo "   3. API Docs: http://localhost:3000/api-docs"
echo "   4. Login con: admin@testing.parroquia / Testing2025!"
echo ""
echo "🛠️ COMANDOS ÚTILES:"
echo "   npm run dev          - Iniciar en modo desarrollo"
echo "   npm run pm2:start    - Iniciar con PM2"
echo "   npm run docker:dev   - Iniciar con Docker"
echo ""
echo "🔧 MANTENIMIENTO:"
echo "   npm run fix:production:robust - Aplicar correcciones"
echo "   npm run sync:complete:testing - Re-sincronizar DB"

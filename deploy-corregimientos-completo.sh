#!/bin/bash
# Script COMPLETO de despliegue de Corregimientos
# Ejecutar en el servidor: bash deploy-corregimientos-completo.sh

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 DESPLIEGUE COMPLETO DE CORREGIMIENTOS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio de la aplicación
APP_DIR="/home/ubuntu/parroquia-api"

echo "📂 Verificando directorio de aplicación..."
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Directorio $APP_DIR no existe${NC}"
    exit 1
fi

cd "$APP_DIR" || exit 1
echo -e "${GREEN}✅ En directorio: $(pwd)${NC}"
echo ""

# 1. PULL DE CAMBIOS
echo "1️⃣  Haciendo pull de cambios desde develop..."
git fetch origin
git pull origin develop

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al hacer pull${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Pull completado${NC}"
echo ""

# 2. INSTALAR DEPENDENCIAS
echo "2️⃣  Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al instalar dependencias${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencias instaladas${NC}"
echo ""

# 3. VERIFICAR QUE LOS ARCHIVOS EXISTAN
echo "3️⃣  Verificando archivos necesarios..."

FILES=(
    "migracion-corregimientos.js"
    "src/controllers/catalog/corregimientosController.js"
    "src/routes/catalog/corregimientosRoutes.js"
    "src/services/catalog/corregimientosService.js"
    "src/models/catalog/Corregimientos.js"
)

ALL_OK=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file NO EXISTE${NC}"
        ALL_OK=false
    fi
done

if [ "$ALL_OK" = false ]; then
    echo -e "${RED}❌ Faltan archivos. Verifica el pull.${NC}"
    exit 1
fi
echo ""

# 4. VERIFICAR QUE LAS RUTAS ESTÉN REGISTRADAS
echo "4️⃣  Verificando registro de rutas en app.js..."

if grep -q "corregimientosRoutes" src/app.js; then
    echo -e "${GREEN}✅ Rutas registradas en app.js${NC}"
else
    echo -e "${RED}❌ Rutas NO registradas en app.js${NC}"
    exit 1
fi
echo ""

# 5. EJECUTAR MIGRACIÓN
echo "5️⃣  ¿Ejecutar migración de base de datos? (y/n)"
read -r EJECUTAR_MIGRACION

if [ "$EJECUTAR_MIGRACION" = "y" ] || [ "$EJECUTAR_MIGRACION" = "Y" ]; then
    echo ""
    echo "⚠️  Antes de ejecutar, verifica las credenciales en migracion-corregimientos.js"
    echo "   Presiona ENTER para continuar o Ctrl+C para cancelar..."
    read -r
    
    echo "Ejecutando migración..."
    node migracion-corregimientos.js
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error en migración${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Migración completada${NC}"
else
    echo -e "${YELLOW}⚠️  Migración omitida. Recuerda ejecutarla manualmente.${NC}"
fi
echo ""

# 6. REINICIAR APLICACIÓN
echo "6️⃣  Reiniciando aplicación..."
pm2 restart parroquia-api

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al reiniciar aplicación${NC}"
    echo "Intentando con: pm2 restart all"
    pm2 restart all
fi

sleep 3
echo -e "${GREEN}✅ Aplicación reiniciada${NC}"
echo ""

# 7. VERIFICAR ESTADO
echo "7️⃣  Verificando estado de la aplicación..."
pm2 status | grep parroquia-api
echo ""

# 8. PROBAR ENDPOINTS
echo "8️⃣  Probando endpoints de corregimientos..."
echo ""

echo "➤ GET /api/catalog/corregimientos"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/catalog/corregimientos)

if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ Endpoint responde (HTTP $RESPONSE)${NC}"
    
    # Mostrar respuesta
    echo "Respuesta:"
    curl -s http://localhost:3000/api/catalog/corregimientos | head -20
else
    echo -e "${RED}❌ Endpoint no responde (HTTP $RESPONSE)${NC}"
    echo "Verificando logs..."
    pm2 logs parroquia-api --lines 20 --nostream
fi
echo ""

# 9. RESUMEN
echo "═══════════════════════════════════════════════════════════════"
echo "📊 RESUMEN DEL DESPLIEGUE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "✅ Pasos completados:"
echo "   1. Pull de cambios desde develop"
echo "   2. Instalación de dependencias"
echo "   3. Verificación de archivos"
echo "   4. Verificación de rutas en app.js"
if [ "$EJECUTAR_MIGRACION" = "y" ] || [ "$EJECUTAR_MIGRACION" = "Y" ]; then
    echo "   5. Migración de base de datos"
fi
echo "   6. Reinicio de aplicación"
echo "   7. Verificación de estado"
echo "   8. Prueba de endpoints"
echo ""
echo "📝 Próximos pasos:"
echo "   • Ver logs: pm2 logs parroquia-api --lines 50"
echo "   • Ejecutar tests: node test-corregimientos-crud.js"
echo "   • Ver en Swagger: http://SERVIDOR_IP:3000/api-docs"
echo ""
echo "═══════════════════════════════════════════════════════════════"

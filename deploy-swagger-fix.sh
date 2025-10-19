#!/bin/bash

# ================================================================
# Script de Despliegue - Actualizar Swagger con campo corregimiento
# ================================================================

set -e  # Salir si hay errores

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVER_USER="l4bsb"
SERVER_HOST="206.62.139.100"
SERVER_PORT="2223"
SERVER_DIR="/home/l4bsb/Parroquia"

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}  🚀 Despliegue de Actualización de Swagger - Corregimientos${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""

# Función para ejecutar comandos remotos
run_remote() {
    ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} "$1"
}

echo -e "${YELLOW}📍 Paso 1: Verificando conexión al servidor...${NC}"
if run_remote "echo 'Conexión exitosa'"; then
    echo -e "${GREEN}✅ Conexión establecida${NC}"
else
    echo -e "${RED}❌ Error: No se pudo conectar al servidor${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📍 Paso 2: Navegando al directorio del proyecto...${NC}"
run_remote "cd ${SERVER_DIR} && pwd"
echo -e "${GREEN}✅ En directorio: ${SERVER_DIR}${NC}"

echo ""
echo -e "${YELLOW}📍 Paso 3: Verificando rama actual...${NC}"
CURRENT_BRANCH=$(run_remote "cd ${SERVER_DIR} && git branch --show-current")
echo -e "   Rama actual: ${CURRENT_BRANCH}"
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo -e "${YELLOW}⚠️  Cambiando a rama develop...${NC}"
    run_remote "cd ${SERVER_DIR} && git checkout develop"
fi
echo -e "${GREEN}✅ En rama develop${NC}"

echo ""
echo -e "${YELLOW}📍 Paso 4: Descartando cambios locales (si hay)...${NC}"
run_remote "cd ${SERVER_DIR} && git reset --hard HEAD"
echo -e "${GREEN}✅ Cambios locales descartados${NC}"

echo ""
echo -e "${YELLOW}📍 Paso 5: Haciendo pull de los últimos cambios...${NC}"
run_remote "cd ${SERVER_DIR} && git pull origin develop"
echo -e "${GREEN}✅ Pull completado${NC}"

echo ""
echo -e "${YELLOW}📍 Paso 6: Verificando commit actual...${NC}"
COMMIT=$(run_remote "cd ${SERVER_DIR} && git log --oneline -1")
echo -e "   ${COMMIT}"
if [[ $COMMIT == *"corregimiento"* ]]; then
    echo -e "${GREEN}✅ Commit correcto encontrado${NC}"
else
    echo -e "${RED}❌ Advertencia: El commit no menciona corregimiento${NC}"
fi

echo ""
echo -e "${YELLOW}📍 Paso 7: Verificando archivo swagger.js...${NC}"
CORREGIMIENTO_COUNT=$(run_remote "cd ${SERVER_DIR} && grep -c 'corregimiento:' src/config/swagger.js || echo 0")
echo -e "   Encontradas ${CORREGIMIENTO_COUNT} ocurrencias de 'corregimiento:'"
if [ "$CORREGIMIENTO_COUNT" -gt "0" ]; then
    echo -e "${GREEN}✅ Campo corregimiento presente en swagger.js${NC}"
else
    echo -e "${RED}❌ Error: Campo corregimiento NO encontrado en swagger.js${NC}"
    echo -e "${RED}   Verifica que el archivo tenga los cambios correctos${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📍 Paso 8: Instalando/actualizando dependencias...${NC}"
run_remote "cd ${SERVER_DIR} && npm install --production"
echo -e "${GREEN}✅ Dependencias actualizadas${NC}"

echo ""
echo -e "${YELLOW}📍 Paso 9: Limpiando caché de Node.js...${NC}"
run_remote "cd ${SERVER_DIR} && rm -rf node_modules/.cache 2>/dev/null || true"
echo -e "${GREEN}✅ Caché limpiado${NC}"

echo ""
echo -e "${YELLOW}📍 Paso 10: Deteniendo servidor actual...${NC}"
# Intentar detener con PM2 primero
run_remote "pm2 delete parroquia 2>/dev/null || true"
# Matar procesos node si existen
run_remote "pkill -9 -f 'node.*src/app.js' 2>/dev/null || true"
sleep 3
echo -e "${GREEN}✅ Servidor detenido${NC}"

echo ""
echo -e "${YELLOW}📍 Paso 11: Verificando que puerto 3001 esté libre...${NC}"
PORT_CHECK=$(run_remote "lsof -ti:3001 | wc -l")
if [ "$PORT_CHECK" -gt "0" ]; then
    echo -e "${YELLOW}⚠️  Puerto 3001 ocupado, liberando...${NC}"
    run_remote "lsof -ti:3001 | xargs kill -9 2>/dev/null || true"
    sleep 2
fi
echo -e "${GREEN}✅ Puerto 3001 libre${NC}"

echo ""
echo -e "${YELLOW}📍 Paso 12: Iniciando servidor con PM2...${NC}"
run_remote "cd ${SERVER_DIR} && pm2 start ecosystem.config.cjs"
sleep 5
echo -e "${GREEN}✅ Servidor iniciado${NC}"

echo ""
echo -e "${YELLOW}📍 Paso 13: Verificando estado del servidor...${NC}"
run_remote "pm2 list"
echo ""

echo ""
echo -e "${YELLOW}📍 Paso 14: Verificando que Swagger tenga el campo corregimiento...${NC}"
sleep 3  # Esperar a que el servidor esté completamente levantado
SWAGGER_CHECK=$(run_remote "curl -s http://localhost:3001/api-docs/swagger.json | grep -c 'corregimiento' || echo 0")
echo -e "   Encontradas ${SWAGGER_CHECK} ocurrencias en JSON de Swagger"
if [ "$SWAGGER_CHECK" -gt "0" ]; then
    echo -e "${GREEN}✅ Campo corregimiento presente en Swagger JSON${NC}"
else
    echo -e "${RED}❌ Advertencia: Campo corregimiento NO encontrado en Swagger JSON${NC}"
    echo -e "${RED}   El servidor puede necesitar más tiempo para iniciar${NC}"
fi

echo ""
echo -e "${YELLOW}📍 Paso 15: Mostrando logs recientes...${NC}"
run_remote "pm2 logs parroquia --lines 20 --nostream"

echo ""
echo -e "${BLUE}================================================================${NC}"
echo -e "${GREEN}✅ DESPLIEGUE COMPLETADO${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo -e "   1. Abre el navegador en modo incógnito (Ctrl+Shift+N)"
echo -e "   2. Ve a: http://206.62.139.100:3001/api-docs"
echo -e "   3. Busca: POST /api/encuesta"
echo -e "   4. Expande: Request body → informacionGeneral"
echo -e "   5. Verifica que aparezca el campo 'corregimiento' después de 'vereda'"
echo ""
echo -e "${YELLOW}🔍 Para verificar manualmente:${NC}"
echo -e "   curl http://206.62.139.100:3001/api-docs/swagger.json | grep corregimiento"
echo ""
echo -e "${YELLOW}📊 Ver logs en tiempo real:${NC}"
echo -e "   ssh -p 2223 l4bsb@206.62.139.100 'pm2 logs parroquia'"
echo ""

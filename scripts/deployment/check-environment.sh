#!/bin/bash

# Script para verificar variables de entorno
# Uso: ./check-environment.sh

echo "🔍 Verificando variables de entorno para Parroquia API..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables requeridas
required_vars=(
    "NODE_ENV"
    "PORT"
    "DB_HOST"
    "DB_PORT"
    "DB_NAME"
    "DB_USER"
    "DB_PASS"
    "JWT_SECRET"
    "JWT_REFRESH_SECRET"
    "JWT_EXPIRES_IN"
    "JWT_REFRESH_EXPIRES_IN"
    "BCRYPT_ROUNDS"
    "FRONTEND_URL"
    "SMTP_HOST"
    "SMTP_PORT"
    "SMTP_USER"
    "SMTP_PASS"
    "EMAIL_FROM"
    "SMTP_FROM_EMAIL"
    "SEND_REAL_EMAILS"
    "VERBOSE_LOGGING"
)

missing_vars=()
configured_vars=()

echo ""
echo "Variables de entorno requeridas:"
echo "================================"

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}✗ $var${NC} - NO CONFIGURADA"
        missing_vars+=("$var")
    else
        echo -e "${GREEN}✓ $var${NC} - ${!var}"
        configured_vars+=("$var")
    fi
done

echo ""
echo "Resumen:"
echo "========"
echo -e "${GREEN}Configuradas: ${#configured_vars[@]}${NC}"
echo -e "${RED}Faltantes: ${#missing_vars[@]}${NC}"

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}Variables faltantes:${NC}"
    printf '%s\n' "${missing_vars[@]}"
    echo ""
    echo -e "${YELLOW}Para configurarlas, agrega estas líneas a tu ~/.bashrc:${NC}"
    echo ""
    for var in "${missing_vars[@]}"; do
        echo "export $var=valor_apropiado"
    done
    echo ""
    echo -e "${YELLOW}Después ejecuta: source ~/.bashrc${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}✅ Todas las variables de entorno están configuradas correctamente!${NC}"
    echo ""
    echo -e "${GREEN}🚀 Puedes proceder con el despliegue.${NC}"
fi

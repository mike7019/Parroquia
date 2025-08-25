#!/bin/bash
# Pre-deployment verification script for Dokploy
# Usage: bash pre-deployment-check.sh

echo "🔍 Verificando configuración para deployment con Dokploy..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check function
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 existe${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 NO encontrado${NC}"
        return 1
    fi
}

check_env_var() {
    if grep -q "$1" "$2" 2>/dev/null; then
        echo -e "${GREEN}✅ Variable $1 configurada en $2${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Variable $1 no encontrada en $2${NC}"
        return 1
    fi
}

echo -e "${BLUE}📋 Verificando archivos requeridos...${NC}"

# Required files
FILES=(
    "Dockerfile"
    "docker-compose.yml"
    "docker-compose.dokploy.yml"
    ".env.dokploy"
    "ecosystem.config.cjs"
    "package.json"
    "src/app.js"
)

all_files_ok=true
for file in "${FILES[@]}"; do
    if ! check_file "$file"; then
        all_files_ok=false
    fi
done

echo -e "\n${BLUE}🔧 Verificando configuraciones críticas...${NC}"

# Check Docker Compose
if [ -f "docker-compose.dokploy.yml" ]; then
    if grep -q "5000:5000" "docker-compose.dokploy.yml"; then
        echo -e "${GREEN}✅ Puerto 5000 configurado correctamente${NC}"
    else
        echo -e "${RED}❌ Puerto 5000 no configurado en docker-compose.dokploy.yml${NC}"
        all_files_ok=false
    fi
    
    if grep -q "postgres:15-alpine" "docker-compose.dokploy.yml"; then
        echo -e "${GREEN}✅ PostgreSQL configurado${NC}"
    else
        echo -e "${RED}❌ PostgreSQL no configurado correctamente${NC}"
        all_files_ok=false
    fi
fi

# Check Dockerfile
if [ -f "Dockerfile" ]; then
    if grep -q "EXPOSE 5000" "Dockerfile"; then
        echo -e "${GREEN}✅ Puerto 5000 expuesto en Dockerfile${NC}"
    else
        echo -e "${RED}❌ Puerto 5000 no expuesto en Dockerfile${NC}"
        all_files_ok=false
    fi
    
    if grep -q "NODE_ENV=production" "Dockerfile"; then
        echo -e "${GREEN}✅ NODE_ENV=production configurado${NC}"
    else
        echo -e "${YELLOW}⚠️  NODE_ENV=production no encontrado${NC}"
    fi
fi

echo -e "\n${BLUE}🔒 Verificando variables de entorno críticas...${NC}"

# Check environment variables
ENV_FILE=".env.dokploy"
if [ -f "$ENV_FILE" ]; then
    CRITICAL_VARS=(
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "DB_PASSWORD"
        "PORT"
        "NODE_ENV"
    )
    
    for var in "${CRITICAL_VARS[@]}"; do
        check_env_var "$var" "$ENV_FILE"
    done
    
    # Check for default/weak values
    if grep -q "CHANGE_THIS" "$ENV_FILE"; then
        echo -e "${RED}❌ Valores por defecto encontrados en $ENV_FILE - CAMBIAR EN PRODUCCIÓN${NC}"
        all_files_ok=false
    else
        echo -e "${GREEN}✅ No se encontraron valores por defecto${NC}"
    fi
fi

echo -e "\n${BLUE}📦 Verificando dependencias...${NC}"

# Check package.json
if [ -f "package.json" ]; then
    if node -e "const pkg = require('./package.json'); console.log('Name:', pkg.name, '| Version:', pkg.version)"; then
        echo -e "${GREEN}✅ package.json válido${NC}"
    else
        echo -e "${RED}❌ package.json inválido${NC}"
        all_files_ok=false
    fi
fi

echo -e "\n${BLUE}🏗️  Verificando build de Docker...${NC}"

# Test Docker build (optional)
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}🔧 Probando build de Docker (esto puede tomar unos minutos)...${NC}"
    if docker build -t parroquia-api-test . --quiet; then
        echo -e "${GREEN}✅ Docker build exitoso${NC}"
        docker rmi parroquia-api-test &> /dev/null
    else
        echo -e "${RED}❌ Docker build falló${NC}"
        all_files_ok=false
    fi
else
    echo -e "${YELLOW}⚠️  Docker no disponible para testing${NC}"
fi

echo -e "\n${BLUE}📝 Generando resumen...${NC}"

if [ "$all_files_ok" = true ]; then
    echo -e "${GREEN}🎉 ¡Todo listo para deployment con Dokploy!${NC}"
    echo -e "\n${BLUE}📋 Próximos pasos:${NC}"
    echo "1. Commit y push todos los cambios"
    echo "2. Configura las variables de entorno en Dokploy"
    echo "3. Usa docker-compose.dokploy.yml como archivo de compose"
    echo "4. Configura el dominio personalizado"
    echo "5. ¡Deploy!"
    echo ""
    echo -e "${YELLOW}🔒 IMPORTANTE: Cambia las variables de seguridad en Dokploy:${NC}"
    echo "   - JWT_SECRET"
    echo "   - JWT_REFRESH_SECRET"
    echo "   - DB_PASSWORD"
    echo "   - FRONTEND_URL (tu dominio real)"
    exit 0
else
    echo -e "${RED}❌ Se encontraron problemas. Revisa los errores arriba.${NC}"
    exit 1
fi

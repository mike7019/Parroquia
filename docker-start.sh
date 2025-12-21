#!/bin/bash

# ==============================================
# PARROQUIA API - QUICK START SCRIPT
# ==============================================

set -e

echo "🚀 Iniciando despliegue de Parroquia API con Docker..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker no está instalado${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Error: Docker Compose no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker está instalado${NC}"

# Verificar si existe .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado. Creando desde .env.example...${NC}"
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Archivo .env creado${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones antes de continuar${NC}"
        echo ""
        echo "Presiona ENTER cuando hayas configurado el archivo .env..."
        read
    else
        echo -e "${RED}❌ Error: No se encontró .env.example${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
fi

# Detener contenedores existentes si los hay
echo ""
echo "🔄 Deteniendo contenedores existentes..."
docker-compose down 2>/dev/null || true

# Construir imágenes
echo ""
echo "🏗️  Construyendo imágenes Docker..."
docker-compose build

# Iniciar servicios
echo ""
echo "🚀 Iniciando servicios..."
docker-compose up -d

# Esperar a que PostgreSQL esté listo
echo ""
echo "⏳ Esperando a que PostgreSQL esté listo..."
until docker-compose exec -T postgres pg_isready -U parroquia_user -d parroquia_db &> /dev/null; do
    echo "   Esperando PostgreSQL..."
    sleep 2
done

echo -e "${GREEN}✅ PostgreSQL está listo${NC}"

# Esperar a que la API esté lista
echo ""
echo "⏳ Esperando a que la API esté lista..."
sleep 10

MAX_RETRIES=30
RETRY_COUNT=0

until curl -f http://localhost:3000/api/health &> /dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}❌ La API no respondió después de ${MAX_RETRIES} intentos${NC}"
        echo ""
        echo "Ver logs con: docker-compose logs api"
        exit 1
    fi
    echo "   Esperando API... (intento $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

echo -e "${GREEN}✅ API está lista${NC}"

# Mostrar estado de los contenedores
echo ""
echo "📊 Estado de los contenedores:"
docker-compose ps

# Mostrar información de acceso
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🎉 ¡Despliegue exitoso!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📍 Accesos:"
echo "   - API: http://localhost:3000/api"
echo "   - Swagger: http://localhost:3000/api-docs"
echo "   - Health: http://localhost:3000/api/health"
echo ""
echo "📋 Comandos útiles:"
echo "   - Ver logs: docker-compose logs -f"
echo "   - Reiniciar: docker-compose restart"
echo "   - Detener: docker-compose down"
echo ""
echo "📖 Para más información, consulta DOCKER_README.md"
echo ""

# Preguntar si desea ver los logs
echo -e "${YELLOW}¿Deseas ver los logs en tiempo real? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    docker-compose logs -f
fi

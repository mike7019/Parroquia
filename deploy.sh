#!/bin/bash

# Script de despliegue para Parroquia API
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando despliegue de Parroquia API..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    warn "El archivo .env no existe. Creando uno desde .env.production..."
    cp .env.production .env
    warn "Por favor edita el archivo .env con tus configuraciones antes de continuar."
    echo -e "${BLUE}Presiona Enter cuando hayas configurado el archivo .env...${NC}"
    read
fi

# Crear directorios necesarios
log "Creando directorios necesarios..."
mkdir -p logs temp

# Construir imágenes
log "Construyendo imagen Docker..."
docker-compose build --no-cache

# Detener servicios existentes
log "Deteniendo servicios existentes..."
docker-compose down

# Limpiar volúmenes huérfanos (opcional)
log "Limpiando recursos no utilizados..."
docker system prune -f

# Iniciar servicios
log "Iniciando servicios..."
docker-compose up -d

# Esperar a que los servicios estén listos
log "Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
log "Verificando estado de los servicios..."
docker-compose ps

# Verificar health checks
log "Verificando health checks..."
sleep 10

# Ejecutar migraciones de base de datos
log "Ejecutando migraciones de base de datos..."
docker-compose exec api npm run db:migrate

# Cargar datos de catálogo
log "Cargando datos de catálogo..."
docker-compose exec api npm run db:load-catalogs

# Crear usuario administrador
log "¿Deseas crear un usuario administrador? (y/N)"
read -r create_admin
if [[ $create_admin =~ ^[Yy]$ ]]; then
    docker-compose exec api npm run admin:create
fi

# Mostrar logs en tiempo real (opcional)
log "¿Deseas ver los logs en tiempo real? (y/N)"
read -r show_logs
if [[ $show_logs =~ ^[Yy]$ ]]; then
    docker-compose logs -f
fi

# Información final del despliegue
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✅ Despliegue completado exitosamente!"
echo ""

# URLs importantes
echo -e "${BLUE}🌐 API URL: http://206.62.139.11:3000/api${NC}"
echo -e "${BLUE}📚 Documentación: http://206.62.139.11:3000/api-docs${NC}"
echo -e "${BLUE}💚 Health Check: http://206.62.139.11:3000/api/health${NC}"
echo ""

# Comandos útiles para administración
echo -e "${YELLOW}📝 Comandos útiles:${NC}"
echo "  • Ver logs: docker-compose logs -f"
echo "  • Migrar base de datos: docker-compose exec api npm run db:migrate"
echo "  • Cargar catálogos: docker-compose exec api npm run db:load-catalogs"
echo "  • Reiniciar: docker-compose restart"
echo "  • Detener: docker-compose down"
echo "  • Ver estado: docker-compose ps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

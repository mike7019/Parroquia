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

# Verificar variables de entorno críticas
log "Verificando variables de entorno críticas..."
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
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    error "Variables de entorno faltantes: ${missing_vars[*]}"
    error "Asegúrate de que las variables estén configuradas en .bashrc y ejecuta 'source ~/.bashrc'"
    exit 1
else
    log "✓ Todas las variables de entorno críticas están configuradas"
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
docker-compose exec -T api npm run db:migrate

# Verificar que las migraciones fueron exitosas
log "Verificando estado de las migraciones..."
if docker-compose exec -T api npx sequelize-cli db:migrate:status; then
    log "✅ Migraciones verificadas exitosamente"
else
    error "❌ Error verificando migraciones"
    exit 1
fi

# Verificar estructura de base de datos crítica
log "Verificando estructura de base de datos..."
docker-compose exec -T postgres psql -U parroquia_user -d parroquia_db -c "
SELECT 
    'Tabla: ' || table_name || ' - Columnas: ' || count(*) as tabla_info
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('sexo', 'sector', 'parroquia', 'municipios', 'departamentos', 'usuarios')
GROUP BY table_name
ORDER BY table_name;" || {
    warn "⚠️  No se pudo verificar estructura completa de BD"
}

# Verificar secuencias auto-increment
log "Verificando secuencias auto-increment..."
docker-compose exec -T postgres psql -U parroquia_user -d parroquia_db -c "
SELECT sequence_name, last_value FROM information_schema.sequences 
WHERE sequence_name LIKE '%_seq' AND sequence_schema = 'public';" || {
    warn "⚠️  No se pudo verificar secuencias"
}

# Cargar datos de catálogo básicos
log "Cargando datos de catálogo básicos..."
docker-compose exec -T api npm run db:load-catalogs

# Crear usuario administrador
log "¿Deseas crear un usuario administrador? (y/N)"
read -r create_admin
if [[ $create_admin =~ ^[Yy]$ ]]; then
    log "Creando usuario administrador..."
    docker-compose exec -T api npm run admin:create
fi

# Verificar que la API responde
log "Verificando que la API está respondiendo..."
sleep 10
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    log "✅ API respondiendo correctamente"
else
    warn "⚠️ API no responde en el endpoint de health. Verificando logs..."
    docker-compose logs api --tail=20
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
echo -e "${BLUE}🌐 API URL: http://$(hostname -I | cut -d' ' -f1):3000/api${NC}"
echo -e "${BLUE}📚 Documentación: http://$(hostname -I | cut -d' ' -f1):3000/api-docs${NC}"
echo -e "${BLUE}💚 Health Check: http://$(hostname -I | cut -d' ' -f1):3000/api/health${NC}"
echo ""

# Comandos útiles para administración
echo -e "${YELLOW}📝 Comandos útiles:${NC}"
echo "  • Ver logs: docker-compose logs -f"
echo "  • Ver logs específicos: docker-compose logs -f api"
echo "  • Migrar base de datos: docker-compose exec api npm run db:migrate"
echo "  • Cargar catálogos: docker-compose exec api npm run db:load-catalogs"
echo "  • Crear admin: docker-compose exec api npm run admin:create"
echo "  • Reiniciar: docker-compose restart"
echo "  • Detener: docker-compose down"
echo "  • Ver estado: docker-compose ps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

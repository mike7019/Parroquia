#!/bin/bash

# ==============================================
# SCRIPT DE DESPLIEGUE PARA AMBIENTE QA
# Puerto: 5000
# ==============================================

echo "🚀 Iniciando despliegue de ambiente QA en puerto 5000..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logs
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar si Docker está corriendo
if ! docker info >/dev/null 2>&1; then
    log_error "Docker no está ejecutándose. Por favor inicia Docker."
    exit 1
fi

# Detener servicios QA existentes si están corriendo
log_info "Deteniendo servicios QA existentes..."
docker-compose -f docker-compose.qa.yml down --remove-orphans

# Limpiar volúmenes QA si se solicita
if [ "$1" = "--clean" ]; then
    log_warning "Limpiando volúmenes de QA (se perderán todos los datos)..."
    docker volume rm parroquia_postgres_qa_data 2>/dev/null || true
    docker volume rm parroquia_app_qa_logs 2>/dev/null || true
    docker volume rm parroquia_app_qa_temp 2>/dev/null || true
    docker volume rm parroquia_app_qa_uploads 2>/dev/null || true
    docker volume rm parroquia_nginx_qa_logs 2>/dev/null || true
fi

# Crear network si no existe
log_info "Creando network de QA..."
docker network create parroquia-qa-network 2>/dev/null || true

# Construir y levantar servicios
log_info "Construyendo y levantando servicios QA..."
docker-compose -f docker-compose.qa.yml up -d --build

# Esperar a que la base de datos esté lista
log_info "Esperando a que PostgreSQL QA esté listo..."
for i in {1..30}; do
    if docker exec parroquia-postgres-qa pg_isready -U parroquia_qa_user -d parroquia_qa_db >/dev/null 2>&1; then
        log_success "PostgreSQL QA está listo"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Timeout esperando PostgreSQL QA"
        exit 1
    fi
    sleep 2
done

# Sincronizar base de datos si es necesario
if [ "$1" = "--sync-db" ] || [ "$2" = "--sync-db" ]; then
    log_info "Sincronizando base de datos QA..."
    
    # Copiar script de sincronización al contenedor
    docker cp sync-database.js parroquia-api-qa:/app/
    
    # Ejecutar sincronización
    docker exec parroquia-api-qa node sync-database.js
    
    if [ $? -eq 0 ]; then
        log_success "Base de datos QA sincronizada correctamente"
    else
        log_error "Error al sincronizar base de datos QA"
        exit 1
    fi
fi

# Esperar a que la API esté lista
log_info "Esperando a que la API QA esté lista..."
for i in {1..60}; do
    if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
        log_success "API QA está funcionando"
        break
    fi
    if [ $i -eq 60 ]; then
        log_error "Timeout esperando API QA"
        exit 1
    fi
    sleep 2
done

# Verificar servicios
log_info "Verificando estado de servicios QA..."
docker-compose -f docker-compose.qa.yml ps

# Mostrar URLs de acceso
echo ""
log_success "🎉 Ambiente QA desplegado exitosamente!"
echo ""
echo "📱 URLs de Acceso:"
echo "   • API QA:           http://localhost:5000/api"
echo "   • Health Check:     http://localhost:5000/api/health"
echo "   • Documentación:    http://localhost:5000/api-docs"
echo "   • Nginx QA:         http://localhost:8081"
echo ""
echo "🔍 Base de Datos QA:"
echo "   • Host: localhost"
echo "   • Puerto: 5433"
echo "   • Database: parroquia_qa_db"
echo "   • User: parroquia_qa_user"
echo ""
echo "📋 Comandos útiles:"
echo "   • Ver logs API:     docker-compose -f docker-compose.qa.yml logs -f api-qa"
echo "   • Ver logs DB:      docker-compose -f docker-compose.qa.yml logs -f postgres-qa"
echo "   • Parar servicios:  docker-compose -f docker-compose.qa.yml down"
echo "   • Restart API:      docker-compose -f docker-compose.qa.yml restart api-qa"
echo ""

# Probar endpoint de salud
log_info "Probando endpoint de salud..."
health_response=$(curl -s http://localhost:5000/api/health)
if echo "$health_response" | grep -q "success"; then
    log_success "Endpoint de salud respondiendo correctamente"
    echo "   Respuesta: $health_response"
else
    log_warning "Endpoint de salud no está respondiendo como se esperaba"
    echo "   Respuesta: $health_response"
fi

echo ""
log_success "✨ Despliegue QA completado!"

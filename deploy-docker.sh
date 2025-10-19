#!/bin/bash

###############################################################################
# Script de Despliegue Docker para Parroquia API
# 
# Este script despliega la aplicación en contenedores Docker utilizando
# las variables de entorno definidas en ~/.bashrc
#
# Uso: ./deploy-docker.sh [opciones]
#
# Opciones:
#   --build    Reconstruir imágenes antes de desplegar
#   --clean    Limpiar contenedores y volúmenes anteriores
#   --logs     Mostrar logs después del despliegue
#   --help     Mostrar esta ayuda
###############################################################################

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
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

print_header() {
    echo -e "${BLUE}"
    echo "═══════════════════════════════════════════════════════════════════"
    echo "  🚀 DESPLIEGUE DOCKER - PARROQUIA API"
    echo "═══════════════════════════════════════════════════════════════════"
    echo -e "${NC}"
}

print_separator() {
    echo -e "${BLUE}───────────────────────────────────────────────────────────────────${NC}"
}

# Verificar que estamos en el directorio correcto
check_directory() {
    log_info "Verificando directorio del proyecto..."
    
    if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
        log_error "Este script debe ejecutarse desde el directorio raíz del proyecto"
        exit 1
    fi
    
    log_success "Directorio correcto"
}

# Cargar variables de entorno desde .bashrc
load_environment() {
    log_info "Cargando variables de entorno desde ~/.bashrc..."
    
    # Source .bashrc para cargar todas las variables
    if [ -f ~/.bashrc ]; then
        # Extraer solo las exports relacionados con el proyecto
        set -a  # Exportar automáticamente todas las variables
        source <(grep -E '^export (DB_|JWT_|EMAIL_|SMTP_|APP_|FRONTEND_|CORS_|RATE_|LOG_|NODE_|PORT|GEMINI|GITHUB)' ~/.bashrc | sed 's/^export //')
        set +a
        
        log_success "Variables de entorno cargadas"
    else
        log_error "No se encontró el archivo ~/.bashrc"
        exit 1
    fi
}

# Verificar variables críticas
verify_environment() {
    log_info "Verificando variables de entorno críticas..."
    
    REQUIRED_VARS=(
        "DB_HOST"
        "DB_PORT"
        "DB_NAME"
        "DB_USER"
        "DB_PASSWORD"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "NODE_ENV"
        "PORT"
    )
    
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        log_error "Faltan las siguientes variables de entorno:"
        for var in "${MISSING_VARS[@]}"; do
            echo "  - $var"
        done
        echo ""
        log_warning "Asegúrate de tener estas variables definidas en ~/.bashrc"
        exit 1
    fi
    
    log_success "Todas las variables críticas están configuradas"
    
    # Mostrar resumen de configuración (sin valores sensibles)
    echo ""
    log_info "Configuración actual:"
    echo "  • NODE_ENV: ${NODE_ENV}"
    echo "  • PORT: ${PORT}"
    echo "  • DB_HOST: ${DB_HOST}"
    echo "  • DB_NAME: ${DB_NAME}"
    echo "  • APP_URL: ${APP_URL:-http://localhost:${PORT}}"
    echo ""
}

# Crear archivo .env para Docker Compose
create_env_file() {
    log_info "Creando archivo .env para Docker Compose..."
    
    ENV_FILE=".env.docker"
    
    cat > "$ENV_FILE" << EOF
# ═══════════════════════════════════════════════════════════════════
# Variables de Entorno para Docker - Generado automáticamente
# Fecha: $(date '+%Y-%m-%d %H:%M:%S')
# ═══════════════════════════════════════════════════════════════════

# Database Configuration
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-72h}
JWT_REFRESH_EXPIRES_IN=${JWT_REFRESH_EXPIRES_IN:-7d}

# Email Configuration
EMAIL_HOST=${EMAIL_HOST:-smtp.gmail.com}
EMAIL_PORT=${EMAIL_PORT:-587}
EMAIL_USER=${EMAIL_USER}
EMAIL_PASS=${EMAIL_PASS}
EMAIL_FROM=${EMAIL_FROM}
SEND_REAL_EMAILS=${SEND_REAL_EMAILS:-true}
SMTP_FROM_EMAIL=${SMTP_FROM_EMAIL}

# SMTP Configuration
SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}
SMTP_PORT=${SMTP_PORT:-587}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}

# Application Configuration
NODE_ENV=${NODE_ENV:-production}
PORT=${PORT:-3000}
APP_NAME=${APP_NAME:-Parroquia API}
APP_URL=${APP_URL}
FRONTEND_URL=${FRONTEND_URL}

# Security Configuration
CORS_ORIGIN=${CORS_ORIGIN:-*}
RATE_LIMIT_WINDOW_MS=${RATE_LIMIT_WINDOW_MS:-900000}
RATE_LIMIT_MAX=${RATE_LIMIT_MAX:-100}

# Logging
LOG_LEVEL=${LOG_LEVEL:-info}

# API Keys (opcional)
GEMINI_API_KEY=${GEMINI_API_KEY:-}
GITHUB_TOKEN=${GITHUB_TOKEN:-}
EOF
    
    chmod 600 "$ENV_FILE"
    log_success "Archivo .env.docker creado"
}

# Limpiar contenedores y volúmenes anteriores
clean_docker() {
    log_warning "Limpiando contenedores y volúmenes anteriores..."
    
    docker-compose down -v 2>/dev/null || true
    
    # Eliminar imágenes antiguas (opcional)
    # docker rmi parroquia-api 2>/dev/null || true
    
    log_success "Limpieza completada"
}

# Construir imágenes Docker
build_images() {
    log_info "Construyendo imágenes Docker..."
    
    docker-compose --env-file .env.docker build --no-cache api
    
    log_success "Imágenes construidas exitosamente"
}

# Iniciar contenedores
start_containers() {
    log_info "Iniciando contenedores Docker..."
    
    docker-compose --env-file .env.docker up -d
    
    log_success "Contenedores iniciados"
}

# Esperar a que los servicios estén listos
wait_for_services() {
    log_info "Esperando a que los servicios estén listos..."
    
    local max_attempts=30
    local attempt=0
    
    # Esperar por PostgreSQL
    log_info "Verificando PostgreSQL..."
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose --env-file .env.docker exec -T postgres pg_isready -U ${DB_USER} -d ${DB_NAME} >/dev/null 2>&1; then
            log_success "PostgreSQL está listo"
            break
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        log_error "PostgreSQL no respondió a tiempo"
        return 1
    fi
    
    echo ""
    
    # Esperar por la API
    log_info "Verificando API..."
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:${PORT}/api/health >/dev/null 2>&1; then
            log_success "API está lista"
            break
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 3
    done
    
    if [ $attempt -eq $max_attempts ]; then
        log_warning "API no respondió, pero los contenedores están corriendo"
        log_info "Verifica los logs con: docker-compose logs -f api"
    fi
    
    echo ""
}

# Mostrar información del despliegue
show_deployment_info() {
    print_separator
    log_success "¡Despliegue completado exitosamente!"
    print_separator
    
    echo ""
    echo "📋 Información del Despliegue:"
    echo ""
    echo "  🌐 API URL: http://localhost:${PORT}"
    echo "  📚 Swagger: http://localhost:${PORT}/api-docs"
    echo "  🏥 Health: http://localhost:${PORT}/api/health"
    echo ""
    echo "  🐘 PostgreSQL:"
    echo "     Host: localhost:5432"
    echo "     Database: ${DB_NAME}"
    echo "     User: ${DB_USER}"
    echo ""
    echo "📦 Contenedores en ejecución:"
    echo ""
    docker-compose --env-file .env.docker ps
    echo ""
    echo "🔧 Comandos útiles:"
    echo ""
    echo "  Ver logs:           docker-compose --env-file .env.docker logs -f"
    echo "  Ver logs de API:    docker-compose --env-file .env.docker logs -f api"
    echo "  Detener:            docker-compose --env-file .env.docker down"
    echo "  Reiniciar API:      docker-compose --env-file .env.docker restart api"
    echo "  Entrar a API:       docker-compose --env-file .env.docker exec api sh"
    echo "  Entrar a DB:        docker-compose --env-file .env.docker exec postgres psql -U ${DB_USER} -d ${DB_NAME}"
    echo ""
    print_separator
}

# Mostrar logs
show_logs() {
    log_info "Mostrando logs (Ctrl+C para salir)..."
    docker-compose --env-file .env.docker logs -f
}

# Mostrar ayuda
show_help() {
    cat << EOF
Script de Despliegue Docker - Parroquia API

USO:
    ./deploy-docker.sh [opciones]

OPCIONES:
    --build     Reconstruir imágenes antes de desplegar
    --clean     Limpiar contenedores y volúmenes anteriores
    --logs      Mostrar logs después del despliegue
    --help      Mostrar esta ayuda

EJEMPLOS:
    # Despliegue normal
    ./deploy-docker.sh

    # Despliegue con reconstrucción de imágenes
    ./deploy-docker.sh --build

    # Despliegue limpio (elimina todo y reconstruye)
    ./deploy-docker.sh --clean --build

    # Despliegue y ver logs
    ./deploy-docker.sh --logs

NOTAS:
    - Las variables de entorno se cargan desde ~/.bashrc
    - Asegúrate de tener Docker y Docker Compose instalados
    - Los datos de PostgreSQL persisten en un volumen Docker

EOF
}

###############################################################################
# MAIN SCRIPT
###############################################################################

main() {
    # Parse arguments
    BUILD=false
    CLEAN=false
    SHOW_LOGS=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --build)
                BUILD=true
                shift
                ;;
            --clean)
                CLEAN=true
                shift
                ;;
            --logs)
                SHOW_LOGS=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "Opción desconocida: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    print_header
    
    # Verificaciones
    check_directory
    load_environment
    verify_environment
    
    # Crear archivo .env
    create_env_file
    
    # Limpieza si se solicita
    if [ "$CLEAN" = true ]; then
        print_separator
        clean_docker
    fi
    
    # Construcción si se solicita
    if [ "$BUILD" = true ]; then
        print_separator
        build_images
    fi
    
    # Despliegue
    print_separator
    start_containers
    
    # Esperar servicios
    print_separator
    wait_for_services
    
    # Mostrar información
    show_deployment_info
    
    # Mostrar logs si se solicita
    if [ "$SHOW_LOGS" = true ]; then
        print_separator
        show_logs
    fi
}

# Ejecutar script principal
main "$@"

#!/bin/bash

###############################################################################
# Utilidades Docker para Parroquia API
# 
# Script con comandos útiles para gestionar el despliegue Docker
#
# Uso: ./docker-utils.sh [comando]
###############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

ENV_FILE=".env.docker"

# Funciones de utilidad
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

print_header() {
    echo -e "${CYAN}"
    echo "═══════════════════════════════════════════════════════════════════"
    echo "  🛠️  UTILIDADES DOCKER - PARROQUIA API"
    echo "═══════════════════════════════════════════════════════════════════"
    echo -e "${NC}"
}

# Verificar que existe .env.docker
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        log_error "No se encontró $ENV_FILE"
        log_info "Ejecuta primero: ./deploy-docker.sh"
        exit 1
    fi
}

# 1. Ver estado de contenedores
status() {
    log_info "Estado de los contenedores:"
    echo ""
    docker-compose --env-file "$ENV_FILE" ps
    echo ""
    
    log_info "Uso de recursos:"
    docker stats --no-stream parroquia-api parroquia-postgres 2>/dev/null || \
        log_warning "Los contenedores no están corriendo"
}

# 2. Ver logs
logs() {
    local service="${1:-}"
    
    if [ -z "$service" ]; then
        log_info "Mostrando logs de todos los servicios (Ctrl+C para salir)..."
        docker-compose --env-file "$ENV_FILE" logs -f
    else
        log_info "Mostrando logs de $service (Ctrl+C para salir)..."
        docker-compose --env-file "$ENV_FILE" logs -f "$service"
    fi
}

# 3. Reiniciar servicios
restart() {
    local service="${1:-}"
    
    if [ -z "$service" ]; then
        log_info "Reiniciando todos los servicios..."
        docker-compose --env-file "$ENV_FILE" restart
    else
        log_info "Reiniciando $service..."
        docker-compose --env-file "$ENV_FILE" restart "$service"
    fi
    
    log_success "Servicios reiniciados"
}

# 4. Detener servicios
stop() {
    log_warning "Deteniendo servicios..."
    docker-compose --env-file "$ENV_FILE" down
    log_success "Servicios detenidos"
}

# 5. Iniciar servicios
start() {
    log_info "Iniciando servicios..."
    docker-compose --env-file "$ENV_FILE" up -d
    log_success "Servicios iniciados"
}

# 6. Acceder a shell de contenedor
shell() {
    local service="${1:-api}"
    
    log_info "Accediendo a shell de $service..."
    docker-compose --env-file "$ENV_FILE" exec "$service" sh
}

# 7. Backup de base de datos
backup() {
    log_info "Creando backup de base de datos..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="backups/backup_${timestamp}.sql"
    
    mkdir -p backups
    
    docker-compose --env-file "$ENV_FILE" exec -T postgres \
        pg_dump -U parroquia_user parroquia_db > "$backup_file"
    
    if [ -f "$backup_file" ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log_success "Backup creado: $backup_file ($size)"
    else
        log_error "Error al crear backup"
        exit 1
    fi
}

# 8. Restaurar backup
restore() {
    local backup_file="${1:-}"
    
    if [ -z "$backup_file" ]; then
        log_error "Debes especificar el archivo de backup"
        echo "Uso: $0 restore <archivo.sql>"
        echo ""
        echo "Backups disponibles:"
        ls -lh backups/*.sql 2>/dev/null || echo "  No hay backups"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "El archivo $backup_file no existe"
        exit 1
    fi
    
    log_warning "⚠️  ADVERTENCIA: Esto sobrescribirá la base de datos actual"
    read -p "¿Continuar? (si/no): " confirm
    
    if [ "$confirm" != "si" ]; then
        log_info "Operación cancelada"
        exit 0
    fi
    
    log_info "Restaurando backup desde $backup_file..."
    
    cat "$backup_file" | docker-compose --env-file "$ENV_FILE" exec -T postgres \
        psql -U parroquia_user -d parroquia_db
    
    log_success "Backup restaurado exitosamente"
}

# 9. Ejecutar comandos en API
exec_api() {
    local command="${1:-}"
    
    if [ -z "$command" ]; then
        log_error "Debes especificar un comando"
        echo "Uso: $0 exec <comando>"
        exit 1
    fi
    
    log_info "Ejecutando: $command"
    docker-compose --env-file "$ENV_FILE" exec api sh -c "$command"
}

# 10. Ver información de salud
health() {
    log_info "Verificando salud de los servicios..."
    echo ""
    
    # API Health
    echo "🌐 API Health:"
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        local response=$(curl -s http://localhost:3000/api/health)
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        log_success "API está respondiendo"
    else
        log_error "API no está respondiendo"
    fi
    
    echo ""
    
    # PostgreSQL Health
    echo "🐘 PostgreSQL Health:"
    if docker-compose --env-file "$ENV_FILE" exec -T postgres pg_isready -U parroquia_user > /dev/null 2>&1; then
        log_success "PostgreSQL está respondiendo"
    else
        log_error "PostgreSQL no está respondiendo"
    fi
    
    echo ""
    
    # Docker Health Check
    echo "🏥 Docker Health Check:"
    docker inspect parroquia-api --format='{{.State.Health.Status}}' 2>/dev/null || \
        echo "No disponible"
}

# 11. Ver estadísticas de base de datos
db_stats() {
    log_info "Estadísticas de base de datos:"
    echo ""
    
    docker-compose --env-file "$ENV_FILE" exec postgres psql -U parroquia_user -d parroquia_db -c "
    SELECT 
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
      pg_total_relation_size(schemaname||'.'||tablename) AS bytes
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY bytes DESC
    LIMIT 20;
    "
}

# 12. Limpiar logs
clean_logs() {
    log_warning "Limpiando logs antiguos..."
    
    find logs/ -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
    
    log_success "Logs antiguos eliminados"
}

# 13. Ver variables de entorno
show_env() {
    log_info "Variables de entorno (valores ocultos):"
    echo ""
    
    if [ -f "$ENV_FILE" ]; then
        # Mostrar solo las claves, no los valores
        grep -E '^[A-Z_]+=' "$ENV_FILE" | sed 's/=.*/=***/' | sort
    else
        log_error "Archivo $ENV_FILE no encontrado"
    fi
}

# 14. Rebuild rápido
rebuild() {
    log_info "Reconstruyendo API sin detener PostgreSQL..."
    
    docker-compose --env-file "$ENV_FILE" stop api
    docker-compose --env-file "$ENV_FILE" build --no-cache api
    docker-compose --env-file "$ENV_FILE" up -d api
    
    log_success "API reconstruida y reiniciada"
}

# 15. Inicializar base de datos
init_db() {
    log_info "Inicializando base de datos..."
    
    log_info "Ejecutando seeders de catálogos..."
    docker-compose --env-file "$ENV_FILE" exec api npm run db:seed:config
    
    log_success "Base de datos inicializada"
}

# Mostrar menú de ayuda
show_help() {
    cat << EOF
🛠️  Utilidades Docker - Parroquia API

USO:
    ./docker-utils.sh <comando> [opciones]

COMANDOS DE GESTIÓN:
    status              Ver estado de contenedores y recursos
    start               Iniciar servicios
    stop                Detener servicios
    restart [servicio]  Reiniciar servicios (api, postgres, o todos)
    rebuild             Reconstruir API sin detener PostgreSQL

COMANDOS DE LOGS:
    logs [servicio]     Ver logs en tiempo real (api, postgres, o todos)
    clean-logs          Eliminar logs antiguos (>7 días)

COMANDOS DE ACCESO:
    shell [servicio]    Acceder a shell del contenedor (default: api)
    exec <comando>      Ejecutar comando en contenedor de API

COMANDOS DE BASE DE DATOS:
    backup              Crear backup de PostgreSQL
    restore <archivo>   Restaurar backup de PostgreSQL
    db-stats            Ver estadísticas de tablas
    init-db             Ejecutar seeders de catálogos

COMANDOS DE MONITOREO:
    health              Verificar salud de servicios
    show-env            Ver variables de entorno configuradas

EJEMPLOS:
    # Ver estado
    ./docker-utils.sh status

    # Ver logs de API
    ./docker-utils.sh logs api

    # Reiniciar solo API
    ./docker-utils.sh restart api

    # Hacer backup
    ./docker-utils.sh backup

    # Restaurar backup
    ./docker-utils.sh restore backups/backup_20251019_120000.sql

    # Acceder a shell de API
    ./docker-utils.sh shell api

    # Ejecutar comando en API
    ./docker-utils.sh exec "npm run db:seed:config"

    # Ver salud
    ./docker-utils.sh health

    # Rebuild rápido
    ./docker-utils.sh rebuild

EOF
}

###############################################################################
# MAIN
###############################################################################

main() {
    local command="${1:-}"
    shift || true
    
    if [ -z "$command" ]; then
        print_header
        show_help
        exit 0
    fi
    
    # Verificar archivo .env excepto para help
    if [ "$command" != "help" ] && [ "$command" != "--help" ] && [ "$command" != "-h" ]; then
        check_env_file
    fi
    
    case "$command" in
        status)
            print_header
            status
            ;;
        logs)
            logs "$@"
            ;;
        restart)
            print_header
            restart "$@"
            ;;
        stop)
            print_header
            stop
            ;;
        start)
            print_header
            start
            ;;
        shell)
            shell "$@"
            ;;
        backup)
            print_header
            backup
            ;;
        restore)
            restore "$@"
            ;;
        exec)
            exec_api "$@"
            ;;
        health)
            print_header
            health
            ;;
        db-stats)
            print_header
            db_stats
            ;;
        clean-logs)
            print_header
            clean_logs
            ;;
        show-env)
            print_header
            show_env
            ;;
        rebuild)
            print_header
            rebuild
            ;;
        init-db)
            print_header
            init_db
            ;;
        help|--help|-h)
            print_header
            show_help
            ;;
        *)
            log_error "Comando desconocido: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"

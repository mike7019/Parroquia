#!/bin/bash

###############################################################################
# Verificador de Configuración para Docker
# 
# Este script verifica que todo esté listo para el despliegue Docker
###############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

print_header() {
    echo -e "${BLUE}"
    echo "═══════════════════════════════════════════════════════════════════"
    echo "  🔍 VERIFICACIÓN DE CONFIGURACIÓN DOCKER"
    echo "═══════════════════════════════════════════════════════════════════"
    echo -e "${NC}"
}

ERRORS=0
WARNINGS=0

# 1. Verificar Docker
check_docker() {
    log_info "Verificando Docker..."
    
    if command -v docker &> /dev/null; then
        local version=$(docker --version)
        log_success "Docker instalado: $version"
    else
        log_error "Docker no está instalado"
        ((ERRORS++))
    fi
}

# 2. Verificar Docker Compose
check_docker_compose() {
    log_info "Verificando Docker Compose..."
    
    if command -v docker-compose &> /dev/null; then
        local version=$(docker-compose --version)
        log_success "Docker Compose instalado: $version"
    else
        log_error "Docker Compose no está instalado"
        ((ERRORS++))
    fi
}

# 3. Verificar archivos necesarios
check_files() {
    log_info "Verificando archivos necesarios..."
    
    local required_files=(
        "package.json"
        "docker-compose.yml"
        "Dockerfile"
        "ecosystem.config.cjs"
        "deploy-docker.sh"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            log_success "$file existe"
        else
            log_error "$file no existe"
            ((ERRORS++))
        fi
    done
}

# 4. Verificar variables de entorno en .bashrc
check_bashrc_vars() {
    log_info "Verificando variables en ~/.bashrc..."
    
    if [ ! -f ~/.bashrc ]; then
        log_error "~/.bashrc no existe"
        ((ERRORS++))
        return
    fi
    
    local required_vars=(
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
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if grep -q "export ${var}=" ~/.bashrc; then
            log_success "Variable $var definida"
        else
            log_warning "Variable $var no encontrada en .bashrc"
            missing_vars+=("$var")
            ((WARNINGS++))
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo ""
        log_warning "Variables faltantes en ~/.bashrc:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
    fi
}

# 5. Verificar valores actuales de variables
check_current_vars() {
    log_info "Verificando valores de variables..."
    
    source ~/.bashrc 2>/dev/null || true
    
    local vars_to_check=(
        "DB_NAME"
        "DB_USER"
        "NODE_ENV"
        "PORT"
    )
    
    for var in "${vars_to_check[@]}"; do
        if [ -n "${!var}" ]; then
            log_success "$var = ${!var}"
        else
            log_warning "$var no está configurada"
            ((WARNINGS++))
        fi
    done
}

# 6. Verificar permisos de scripts
check_permissions() {
    log_info "Verificando permisos de scripts..."
    
    local scripts=(
        "deploy-docker.sh"
        "docker-utils.sh"
        "verify-docker-setup.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [ -f "$script" ]; then
            if [ -x "$script" ]; then
                log_success "$script es ejecutable"
            else
                log_warning "$script no es ejecutable"
                log_info "  Ejecuta: chmod +x $script"
                ((WARNINGS++))
            fi
        fi
    done
}

# 7. Verificar puertos disponibles
check_ports() {
    log_info "Verificando puertos..."
    
    local ports_to_check=(3000 5432)
    
    for port in "${ports_to_check[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_warning "Puerto $port está en uso"
            local process=$(lsof -Pi :$port -sTCP:LISTEN -t | head -1)
            log_info "  Proceso: $(ps -p $process -o comm= 2>/dev/null || echo 'desconocido')"
            ((WARNINGS++))
        else
            log_success "Puerto $port disponible"
        fi
    done
}

# 8. Verificar espacio en disco
check_disk_space() {
    log_info "Verificando espacio en disco..."
    
    local available=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
    
    if [ "$available" -gt 10 ]; then
        log_success "Espacio disponible: ${available}GB"
    elif [ "$available" -gt 5 ]; then
        log_warning "Espacio disponible: ${available}GB (recomendado >10GB)"
        ((WARNINGS++))
    else
        log_error "Espacio insuficiente: ${available}GB (mínimo 5GB)"
        ((ERRORS++))
    fi
}

# 9. Verificar imágenes Docker existentes
check_docker_images() {
    log_info "Verificando imágenes Docker..."
    
    if docker images | grep -q parroquia; then
        log_success "Imágenes de Parroquia encontradas:"
        docker images | grep parroquia
    else
        log_info "No hay imágenes de Parroquia (se crearán al desplegar)"
    fi
}

# 10. Verificar volúmenes Docker existentes
check_docker_volumes() {
    log_info "Verificando volúmenes Docker..."
    
    if docker volume ls | grep -q parroquia; then
        log_success "Volúmenes de Parroquia encontrados:"
        docker volume ls | grep parroquia
    else
        log_info "No hay volúmenes de Parroquia (se crearán al desplegar)"
    fi
}

# Resumen final
print_summary() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    
    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        log_success "¡Todo listo para el despliegue!"
        echo ""
        echo "Ejecuta: ./deploy-docker.sh"
    elif [ $ERRORS -eq 0 ]; then
        log_warning "Verificación completada con $WARNINGS advertencias"
        echo ""
        echo "Puedes continuar con el despliegue, pero revisa las advertencias"
        echo "Ejecuta: ./deploy-docker.sh"
    else
        log_error "Verificación fallida con $ERRORS errores y $WARNINGS advertencias"
        echo ""
        echo "Corrige los errores antes de desplegar"
    fi
    
    echo "═══════════════════════════════════════════════════════════════════"
}

###############################################################################
# MAIN
###############################################################################

main() {
    print_header
    
    check_docker
    echo ""
    
    check_docker_compose
    echo ""
    
    check_files
    echo ""
    
    check_bashrc_vars
    echo ""
    
    check_current_vars
    echo ""
    
    check_permissions
    echo ""
    
    check_ports
    echo ""
    
    check_disk_space
    echo ""
    
    check_docker_images
    echo ""
    
    check_docker_volumes
    
    print_summary
    
    if [ $ERRORS -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

main "$@"

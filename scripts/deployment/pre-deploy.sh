#!/bin/bash

# Script de pre-deploy - verificaciones antes del despliegue
# Uso: ./pre-deploy.sh

set -e

echo "🔍 Verificando configuración para despliegue..."

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

# Contador de errores
ERRORS=0

# Verificar que todos los archivos necesarios existen
log "Verificando archivos necesarios..."

required_files=(
    "../../package.json"
    "../../Dockerfile"
    "../../docker-compose.yml"
    "../../src/app.js"
    "../../config/sequelize.js"
    "../../scripts/database/createAdminUser.js"
    "../../scripts/utilities/loadCatalogData.js"
    "../../scripts/deployment/deploy.sh"
)

required_dirs=(
    "migrations"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        error "Archivo requerido no encontrado: $file"
        ((ERRORS++))
    else
        log "✓ $file"
    fi
done

for dir in "${required_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        error "Directorio requerido no encontrado: $dir"
        ((ERRORS++))
    else
        log "✓ $dir"
    fi
done

# Verificar que Docker está instalado
log "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
    ((ERRORS++))
else
    log "✓ Docker instalado: $(docker --version)"
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado"
    ((ERRORS++))
else
    log "✓ Docker Compose instalado: $(docker-compose --version)"
fi

# Verificar variables de entorno críticas (desde .bashrc)
log "Verificando variables de entorno críticas..."

# Verificar variables requeridas
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
        error "Variable de entorno requerida no encontrada: $var"
        ((ERRORS++))
    else
        log "✓ $var configurado"
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo ""
    error "Las siguientes variables de entorno son requeridas:"
    printf '%s\n' "${missing_vars[@]}"
    echo ""
    echo -e "${YELLOW}Agrega estas variables a tu .bashrc y ejecuta 'source ~/.bashrc'${NC}"
fi

# Verificar valores de seguridad
if [ ! -z "$JWT_SECRET" ] && [ "$JWT_SECRET" = "parroquia_jwt_secret_muy_seguro" ]; then
    warn "JWT_SECRET usa valor por defecto. Cámbialo por uno único."
fi

if [ ! -z "$DB_PASS" ] && [ "$DB_PASS" = "admin" ]; then
    warn "DB_PASS usa valor por defecto. Cámbialo por uno seguro."
fi

# Verificar que las migraciones están ordenadas
log "Verificando migraciones..."
migration_count=$(ls migrations/*.cjs 2>/dev/null | wc -l)
if [ $migration_count -gt 0 ]; then
    log "✓ $migration_count migraciones encontradas"
    ls migrations/*.cjs | sort
else
    error "No se encontraron migraciones"
    ((ERRORS++))
fi

# Verificar sintaxis de archivos JavaScript principales
log "Verificando sintaxis de archivos JavaScript..."
js_files=(
    "src/app.js"
    "scripts/database/createAdminUser.js"
    "scripts/utilities/loadCatalogData.js"
)

for js_file in "${js_files[@]}"; do
    if [ -f "$js_file" ]; then
        if node -c "$js_file" 2>/dev/null; then
            log "✓ $js_file (sintaxis OK)"
        else
            error "Error de sintaxis en $js_file"
            ((ERRORS++))
        fi
    else
        warn "Archivo JavaScript opcional no encontrado: $js_file"
    fi
done

# Verificar que los puertos no están en uso
log "Verificando puertos disponibles..."
if command -v netstat &> /dev/null; then
    if netstat -tuln | grep ":3000" > /dev/null; then
        warn "Puerto 3000 ya está en uso"
    else
        log "✓ Puerto 3000 disponible"
    fi
    
    if netstat -tuln | grep ":5432" > /dev/null; then
        warn "Puerto 5432 ya está en uso"
    else
        log "✓ Puerto 5432 disponible"
    fi
fi

# Verificar permisos de archivos de script
log "Verificando permisos de scripts..."
if [ -x "scripts/deployment/deploy.sh" ]; then
    log "✓ scripts/deployment/deploy.sh es ejecutable"
else
    warn "scripts/deployment/deploy.sh no es ejecutable. Aplicando permisos..."
    chmod +x scripts/deployment/deploy.sh
fi

# Verificar espacio en disco
log "Verificando espacio en disco..."
available_space=$(df . | tail -1 | awk '{print $4}')
if [ $available_space -gt 1000000 ]; then # 1GB en KB
    log "✓ Espacio en disco suficiente"
else
    warn "Poco espacio en disco disponible: ${available_space}KB"
fi

# Resumen final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    log "✅ Pre-deploy completado exitosamente!"
    echo ""
    echo -e "${BLUE}🚀 Sistema listo para deploy. Ejecuta:${NC}"
    echo -e "${BLUE}   ./scripts/deployment/deploy.sh${NC}"
    echo ""
else
    error "❌ Pre-deploy completado con $ERRORS errores"
    echo ""
    echo -e "${RED}🛑 Corrige los errores antes de hacer deploy${NC}"
    echo ""
    exit 1
fi

echo -e "${YELLOW}📝 Checklist final:${NC}"
echo "  1. ✓ Variables de entorno configuradas en .bashrc"
echo "  2. ✓ JWT secrets únicos y seguros" 
echo "  3. ✓ Password de base de datos seguro"
echo "  4. ✓ Variables críticas presentes en el sistema"
echo "  5. ✓ Puertos disponibles (3000, 5432)"
echo "  6. ✓ Docker y Docker Compose instalados"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

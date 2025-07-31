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
    "package.json"
    "Dockerfile"
    "docker-compose.yml"
    ".env.production"
    "src/app.js"
    "config/sequelize.js"
    "migrations"
    "createAdminUser.js"
    "loadCatalogData.js"
    "deploy.sh"
)

for file in "${required_files[@]}"; do
    if [ ! -e "$file" ]; then
        error "Archivo requerido no encontrado: $file"
        ((ERRORS++))
    else
        log "✓ $file"
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

# Verificar que el archivo .env existe o crear uno desde .env.production
log "Verificando archivo .env..."
if [ ! -f ".env" ]; then
    warn "Archivo .env no existe. Copiando desde .env.production..."
    cp .env.production .env
    warn "IMPORTANTE: Edita el archivo .env con configuraciones específicas de producción"
else
    log "✓ Archivo .env existe"
fi

# Verificar configuración crítica en .env
log "Verificando configuración crítica..."
if [ -f ".env" ]; then
    # Verificar JWT secrets
    if grep -q "parroquia_jwt_secret_muy_seguro" .env; then
        warn "JWT_SECRET usa valor por defecto. Cámbialo por uno único."
    else
        log "✓ JWT_SECRET configurado"
    fi
    
    # Verificar password de base de datos
    if grep -q "DB_PASSWORD=admin" .env; then
        warn "DB_PASSWORD usa valor por defecto. Cámbialo por uno seguro."
    else
        log "✓ DB_PASSWORD configurado"
    fi
    
    # Verificar APP_URL
    if grep -q "APP_URL=" .env; then
        log "✓ APP_URL configurado"
    else
        warn "APP_URL no está configurado"
    fi
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
    "createAdminUser.js"
    "loadCatalogData.js"
)

for js_file in "${js_files[@]}"; do
    if [ -f "$js_file" ]; then
        if node -c "$js_file" 2>/dev/null; then
            log "✓ $js_file (sintaxis OK)"
        else
            error "Error de sintaxis en $js_file"
            ((ERRORS++))
        fi
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
if [ -x "deploy.sh" ]; then
    log "✓ deploy.sh es ejecutable"
else
    warn "deploy.sh no es ejecutable. Aplicando permisos..."
    chmod +x deploy.sh
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
    echo -e "${BLUE}   ./deploy.sh${NC}"
    echo ""
else
    error "❌ Pre-deploy completado con $ERRORS errores"
    echo ""
    echo -e "${RED}🛑 Corrige los errores antes de hacer deploy${NC}"
    echo ""
    exit 1
fi

echo -e "${YELLOW}📝 Checklist final:${NC}"
echo "  1. ✓ Archivo .env configurado con valores de producción"
echo "  2. ✓ JWT secrets únicos y seguros" 
echo "  3. ✓ Password de base de datos seguro"
echo "  4. ✓ APP_URL configurado correctamente"
echo "  5. ✓ Puertos disponibles (3000, 5432)"
echo "  6. ✓ Docker y Docker Compose instalados"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

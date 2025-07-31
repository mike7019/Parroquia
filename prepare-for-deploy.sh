#!/bin/bash

# Script de preparación final para deploy
# Este script asegura que todos los cambios estén listos para push

set -e

echo "🔧 Preparando repositorio para deploy..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Hacer todos los scripts ejecutables
log "Configurando permisos de scripts..."
chmod +x deploy.sh
chmod +x pre-deploy.sh
chmod +x prepare-for-deploy.sh

# Verificar que los archivos clave existen
log "Verificando archivos esenciales..."
essential_files=(
    ".env.production"
    "docker-compose.yml"
    "Dockerfile"
    "package.json"
    "createAdminUser.js"
    "loadCatalogData.js"
    "deploy.sh"
    "pre-deploy.sh"
    "DEPLOY_GUIDE.md"
    "migrations/20250731120000-add-autoincrement-sequences.cjs"
)

for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        log "✓ $file"
    else
        warn "⚠️ $file no encontrado"
    fi
done

# Verificar que las migraciones están en orden
log "Verificando migraciones..."
ls -la migrations/*.cjs 2>/dev/null | wc -l && echo " migraciones encontradas"

# Verificar sintaxis de archivos JavaScript críticos
log "Verificando sintaxis de archivos JavaScript..."
node -c createAdminUser.js && log "✓ createAdminUser.js"
node -c loadCatalogData.js && log "✓ loadCatalogData.js"
node -c src/app.js && log "✓ src/app.js"

# Verificar que no hay archivos .env en el repositorio
if [ -f ".env" ]; then
    warn "Archivo .env encontrado. Este archivo no debe estar en el repositorio."
    warn "El deploy usará .env.production como plantilla."
fi

# Mostrar archivos que serán incluidos en el commit
log "Archivos modificados para commit:"
git status --porcelain

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✅ Preparación completada"
echo ""
echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo "1. Revisar los cambios: git status"
echo "2. Hacer commit: git add . && git commit -m 'Deploy setup: scripts, migraciones y configuración completa'"
echo "3. Push al repositorio: git push origin develop"
echo "4. En el servidor Linux, clonar y ejecutar: ./deploy.sh"
echo ""
echo -e "${YELLOW}📚 Documentación:${NC}"
echo "• Guía completa de deploy: DEPLOY_GUIDE.md"
echo "• Verificación pre-deploy: ./pre-deploy.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

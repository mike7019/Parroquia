#!/bin/bash

# 🔍 Script para verificar que NO haya referencias problemáticas a id_sector

echo "🔍 Verificando que no haya referencias problemáticas a id_sector..."
echo "📅 $(date)"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Archivos donde NO debe haber referencias activas a id_sector
PROBLEM_FILES=(
    "src/models/catalog/Veredas.js"
    "src/models/catalog/index.js" 
    "src/services/catalog/veredaService.js"
    "src/config/swagger.js"
)

FOUND_PROBLEMS=0

log_info "Verificando archivos críticos..."

for file in "${PROBLEM_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_info "Verificando: $file"
        
        # Buscar referencias activas (no comentadas) a id_sector
        ACTIVE_REFS=$(grep -n "id_sector" "$file" | grep -v "^[[:space:]]*//\|^[[:space:]]*\*\|^[[:space:]]*\/\*" | grep -v "console.log\|comment\|description" || true)
        
        if [ ! -z "$ACTIVE_REFS" ]; then
            log_error "Encontradas referencias activas a id_sector en $file:"
            echo "$ACTIVE_REFS"
            FOUND_PROBLEMS=$((FOUND_PROBLEMS + 1))
        else
            log_success "✓ $file - Sin referencias problemáticas"
        fi
    else
        log_warning "Archivo no encontrado: $file"
    fi
done

# Verificar asociaciones activas en archivos de modelos
log_info "Verificando asociaciones activas..."

ASSOCIATION_FILES=(
    "src/models/index.js"
    "src/models/catalog/index.js"
)

for file in "${ASSOCIATION_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Buscar patrones como: Veredas.belongsTo(Sector o Sector.hasMany(Veredas que no estén comentados
        ACTIVE_ASSOCIATIONS=$(grep -n -A 3 -B 1 "Veredas.*Sector\|Sector.*Veredas" "$file" | grep -v "^--$" | grep -v "^[[:space:]]*//\|^[[:space:]]*\*\|^[[:space:]]*\/\*" || true)
        
        if [ ! -z "$ACTIVE_ASSOCIATIONS" ]; then
            log_error "Encontradas asociaciones activas Vereda-Sector en $file:"
            echo "$ACTIVE_ASSOCIATIONS"
            FOUND_PROBLEMS=$((FOUND_PROBLEMS + 1))
        else
            log_success "✓ $file - Sin asociaciones problemáticas"
        fi
    fi
done

# Verificar que el modelo Veredas tenga la estructura correcta
log_info "Verificando estructura del modelo Veredas..."

if grep -q "id_sector" "src/models/catalog/Veredas.js" 2>/dev/null; then
    log_error "El modelo Veredas.js aún contiene referencias a id_sector"
    FOUND_PROBLEMS=$((FOUND_PROBLEMS + 1))
else
    log_success "✓ Modelo Veredas sin referencias a id_sector"
fi

# Resumen final
echo ""
echo "📋 RESUMEN DE VERIFICACIÓN"
echo "=========================="

if [ $FOUND_PROBLEMS -eq 0 ]; then
    echo ""
    log_success "🎉 ¡NO SE ENCONTRARON PROBLEMAS!"
    log_success "✅ Todos los archivos están limpios de referencias problemáticas a id_sector"
    log_success "✅ El deploy-to-server.sh debería funcionar correctamente ahora"
    echo ""
    log_info "Puedes proceder con confianza a ejecutar el deployment"
    exit 0
else
    echo ""
    log_error "🚨 SE ENCONTRARON $FOUND_PROBLEMS PROBLEMA(S)"
    log_error "❌ Es necesario corregir las referencias antes del deployment"
    echo ""
    log_info "Revisa los archivos mencionados arriba y elimina/comenta las referencias a id_sector"
    exit 1
fi

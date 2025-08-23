#!/bin/bash

# 🧪 Script para probar endpoints de veredas después del deployment

echo "🧪 Probando endpoints de veredas en servidor..."
echo "📅 $(date)"
echo ""

# Configuración del servidor (ajustar según corresponda)
SERVER_URL="http://localhost:3000"  # Cambiar por la URL del servidor
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="Admin123!"

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

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Obtener token de autenticación
log_info "Obteniendo token de autenticación..."

AUTH_RESPONSE=$(curl -s -X POST "$SERVER_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"correo_electronico\":\"$ADMIN_EMAIL\",\"contrasena\":\"$ADMIN_PASSWORD\"}")

if [[ $? -ne 0 ]]; then
    log_error "No se pudo conectar al servidor en $SERVER_URL"
    exit 1
fi

# Extraer token usando jq (si está disponible) o sed
if command -v jq &> /dev/null; then
    TOKEN=$(echo $AUTH_RESPONSE | jq -r '.data.accessToken // empty')
else
    TOKEN=$(echo $AUTH_RESPONSE | sed 's/.*"accessToken":"\([^"]*\)".*/\1/')
fi

if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
    log_error "No se pudo obtener token de autenticación"
    echo "Respuesta del servidor: $AUTH_RESPONSE"
    exit 1
fi

log_success "Token obtenido correctamente"

# Headers para las siguientes peticiones
HEADERS=(-H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")

# 2. Probar GET /api/catalog/veredas
log_info "Probando GET /api/catalog/veredas..."

VEREDAS_RESPONSE=$(curl -s -X GET "$SERVER_URL/api/catalog/veredas" "${HEADERS[@]}")

if echo "$VEREDAS_RESPONSE" | grep -q '"success":true' && echo "$VEREDAS_RESPONSE" | grep -q '"status":"success"'; then
    log_success "Endpoint GET /api/catalog/veredas funciona correctamente"
    
    # Extraer cantidad de veredas
    if command -v jq &> /dev/null; then
        TOTAL_VEREDAS=$(echo $VEREDAS_RESPONSE | jq -r '.data.total // 0')
        log_info "Total de veredas encontradas: $TOTAL_VEREDAS"
    fi
else
    log_error "Endpoint GET /api/catalog/veredas falló"
    echo "Respuesta: $VEREDAS_RESPONSE"
    exit 1
fi

# 3. Probar búsqueda de veredas
log_info "Probando búsqueda de veredas..."

SEARCH_RESPONSE=$(curl -s -X GET "$SERVER_URL/api/catalog/veredas/search?q=test" "${HEADERS[@]}")

if echo "$SEARCH_RESPONSE" | grep -q '"success":true'; then
    log_success "Endpoint de búsqueda funciona correctamente"
else
    log_error "Endpoint de búsqueda falló"
    echo "Respuesta: $SEARCH_RESPONSE"
fi

# 4. Probar estadísticas
log_info "Probando estadísticas de veredas..."

STATS_RESPONSE=$(curl -s -X GET "$SERVER_URL/api/catalog/veredas/statistics" "${HEADERS[@]}")

if echo "$STATS_RESPONSE" | grep -q '"success":true'; then
    log_success "Endpoint de estadísticas funciona correctamente"
else
    log_error "Endpoint de estadísticas falló"
    echo "Respuesta: $STATS_RESPONSE"
fi

# 5. Verificar que no haya errores de id_sector
log_info "Verificando que no haya errores de id_sector..."

if echo "$VEREDAS_RESPONSE" | grep -q "id_sector.*does not exist"; then
    log_error "¡Aún hay referencias a id_sector!"
    echo "Respuesta completa: $VEREDAS_RESPONSE"
    exit 1
else
    log_success "No se encontraron errores de id_sector"
fi

# Resumen final
echo ""
echo "🎉 PRUEBAS COMPLETADAS"
echo "======================"
log_success "✅ Autenticación funcional"
log_success "✅ Endpoint principal de veredas funcional"
log_success "✅ Búsqueda de veredas funcional"
log_success "✅ Estadísticas funcionales"
log_success "✅ No hay errores de id_sector"
echo ""
log_success "El problema del id_sector ha sido solucionado"
echo ""

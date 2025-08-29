#!/bin/bash

# Test Suite para el Servicio de Encuestas Mejorado
echo "🧪 INICIANDO TESTS DEL SERVICIO DE ENCUESTAS MEJORADO"
echo "====================================================="

# Configuración
BASE_URL="http://206.62.139.100:3000/api"
LOGIN_URL="$BASE_URL/auth/login"
ENCUESTA_URL="$BASE_URL/encuesta"

# Función para obtener token
get_auth_token() {
    echo "🔐 Obteniendo token de autenticación..."
    
    local response=$(curl -s -X POST "$LOGIN_URL" \
        -H "Content-Type: application/json" \
        -d '{"correo_electronico":"admin@parroquia.com","contrasena":"Admin123!"}')
    
    local token=$(echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$token" ]; then
        echo "✅ Login exitoso"
        echo "$token"
    else
        echo "❌ Error en login"
        echo "$response"
        return 1
    fi
}

# Test 1: GET encuestas
test_get_encuestas() {
    local token="$1"
    echo ""
    echo "📋 TEST 1: GET /api/encuesta"
    
    local response=$(curl -s -X GET "$ENCUESTA_URL?page=1&limit=5" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json")
    
    if echo "$response" | grep -q '"exito":true'; then
        echo "✅ GET encuestas exitoso"
        local total=$(echo "$response" | grep -o '"total":[0-9]*' | cut -d':' -f2)
        echo "   📊 Total encuestas: $total"
        return 0
    else
        echo "❌ Error en GET encuestas"
        echo "$response"
        return 1
    fi
}

# Test 2: Crear familia nueva
test_create_new_family() {
    local token="$1"
    echo ""
    echo "➕ TEST 2: Crear familia nueva"
    
    local timestamp=$(date +%s)
    local phone_suffix="${timestamp: -6}"
    
    local data='{
        "informacionGeneral": {
            "apellido_familiar": "Test Familia '$timestamp'",
            "telefono": "300'$phone_suffix'",
            "direccion": "Calle Test #'$timestamp'-01",
            "email": "test'$timestamp'@test.com",
            "id_municipio": 1
        },
        "familyMembers": [{
            "nombres": "Juan Carlos",
            "apellidos": "Test '$timestamp'",
            "numeroIdentificacion": "1000'$phone_suffix'",
            "fechaNacimiento": "1990-01-01",
            "tipoIdentificacion": "CC",
            "sexo": "M",
            "estadoCivil": "Soltero",
            "nivelEducativo": "Universitario",
            "ocupacion": "Ingeniero",
            "esTutorResponsable": true
        }],
        "vivienda": {
            "tipo_vivienda": "Casa",
            "material_paredes": "Ladrillo",
            "material_pisos": "Cerámica",
            "num_habitaciones": 3
        },
        "servicios_agua": {
            "acueducto": true,
            "alcantarillado": true,
            "pozo_septico": false
        },
        "observaciones": {
            "observaciones_generales": "Encuesta de prueba",
            "comunionEnCasa": false
        }
    }'
    
    local response=$(curl -s -X POST "$ENCUESTA_URL" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$data")
    
    if echo "$response" | grep -q '"exito":true'; then
        echo "✅ Familia nueva creada exitosamente"
        local familia_id=$(echo "$response" | grep -o '"id_familia":"[^"]*"' | cut -d'"' -f4)
        echo "   🆔 ID Familia: $familia_id"
        
        # Guardar datos para test de duplicado
        echo "Test Familia $timestamp" > /tmp/test_apellido
        echo "300$phone_suffix" > /tmp/test_telefono
        echo "Calle Test #$timestamp-01" > /tmp/test_direccion
        echo "$familia_id" > /tmp/test_familia_id
        
        return 0
    else
        echo "❌ Error creando familia nueva"
        echo "$response"
        return 1
    fi
}

# Test 3: Familia duplicada (debería fallar con mensaje mejorado)
test_duplicate_family() {
    local token="$1"
    echo ""
    echo "🔄 TEST 3: Familia duplicada (detección de error)"
    
    if [ ! -f /tmp/test_apellido ]; then
        echo "❌ No hay datos de familia previa para test de duplicado"
        return 1
    fi
    
    local apellido=$(cat /tmp/test_apellido)
    local telefono=$(cat /tmp/test_telefono)
    local direccion=$(cat /tmp/test_direccion)
    
    local data='{
        "informacionGeneral": {
            "apellido_familiar": "'$apellido'",
            "telefono": "'$telefono'",
            "direccion": "'$direccion'",
            "email": "duplicate@test.com",
            "id_municipio": 1
        },
        "familyMembers": [{
            "nombres": "Maria Elena",
            "apellidos": "'$apellido'",
            "numeroIdentificacion": "2000123456789",
            "fechaNacimiento": "1985-06-15",
            "tipoIdentificacion": "CC",
            "sexo": "F",
            "estadoCivil": "Casada",
            "nivelEducativo": "Secundaria",
            "ocupacion": "Ama de casa",
            "esTutorResponsable": true
        }],
        "vivienda": {
            "tipo_vivienda": "Casa",
            "material_paredes": "Ladrillo",
            "material_pisos": "Cerámica",
            "num_habitaciones": 4
        },
        "servicios_agua": {
            "acueducto": true,
            "alcantarillado": true,
            "pozo_septico": false
        },
        "observaciones": {
            "observaciones_generales": "Test familia duplicada",
            "comunionEnCasa": false
        }
    }'
    
    local response=$(curl -s -X POST "$ENCUESTA_URL" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$data")
    
    if echo "$response" | grep -q '"code":"DUPLICATE_FAMILY"'; then
        echo "✅ Familia duplicada detectada correctamente"
        echo "   📋 Respuesta:"
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
        return 0
    else
        echo "❌ ERROR: Se permitió crear familia duplicada o error inesperado"
        echo "$response"
        return 1
    fi
}

# Test 4: Familia diferente (debería funcionar)
test_different_family() {
    local token="$1"
    echo ""
    echo "✨ TEST 4: Familia diferente (debería funcionar)"
    
    local timestamp=$(date +%s)
    local phone_suffix="${timestamp: -6}"
    
    local data='{
        "informacionGeneral": {
            "apellido_familiar": "Familia Diferente '$timestamp'",
            "telefono": "301'$phone_suffix'",
            "direccion": "Avenida Diferente #'$timestamp'-99",
            "email": "diferente'$timestamp'@test.com",
            "id_municipio": 1
        },
        "familyMembers": [{
            "nombres": "Ana Patricia",
            "apellidos": "Diferente '$timestamp'",
            "numeroIdentificacion": "3000'$phone_suffix'",
            "fechaNacimiento": "1988-03-22",
            "tipoIdentificacion": "CC",
            "sexo": "F",
            "estadoCivil": "Soltera",
            "nivelEducativo": "Técnico",
            "ocupacion": "Enfermera",
            "esTutorResponsable": true
        }],
        "vivienda": {
            "tipo_vivienda": "Apartamento",
            "material_paredes": "Concreto",
            "material_pisos": "Laminado",
            "num_habitaciones": 2
        },
        "servicios_agua": {
            "acueducto": true,
            "alcantarillado": true,
            "pozo_septico": false
        },
        "observaciones": {
            "observaciones_generales": "Familia completamente diferente",
            "comunionEnCasa": true
        }
    }'
    
    local response=$(curl -s -X POST "$ENCUESTA_URL" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$data")
    
    if echo "$response" | grep -q '"exito":true'; then
        echo "✅ Familia diferente creada exitosamente"
        local familia_id=$(echo "$response" | grep -o '"id_familia":"[^"]*"' | cut -d'"' -f4)
        echo "   🆔 ID Familia: $familia_id"
        return 0
    else
        echo "❌ Error creando familia diferente"
        echo "$response"
        return 1
    fi
}

# EJECUTAR TODOS LOS TESTS
echo ""
echo "🚀 Ejecutando suite completa de tests..."

# 1. Obtener token
TOKEN=$(get_auth_token)
if [ $? -ne 0 ] || [ -z "$TOKEN" ]; then
    echo "❌ No se pudo obtener token. Terminando tests."
    exit 1
fi

# 2. Ejecutar tests
RESULTS=()

test_get_encuestas "$TOKEN"
RESULTS+=($(echo $?))

test_create_new_family "$TOKEN"
RESULTS+=($(echo $?))

test_duplicate_family "$TOKEN"
RESULTS+=($(echo $?))

test_different_family "$TOKEN"
RESULTS+=($(echo $?))

# 3. Calcular resultados
TOTAL_TESTS=4
PASSED_TESTS=0

for result in "${RESULTS[@]}"; do
    if [ "$result" -eq 0 ]; then
        ((PASSED_TESTS++))
    fi
done

PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

# 4. Mostrar resumen
echo ""
echo "📊 RESUMEN DE RESULTADOS"
echo "========================"

TEST_NAMES=("GET Encuestas" "Crear Familia Nueva" "Detectar Duplicada" "Familia Diferente")
for i in "${!RESULTS[@]}"; do
    if [ "${RESULTS[$i]}" -eq 0 ]; then
        echo "${TEST_NAMES[$i]}: ✅ PASS"
    else
        echo "${TEST_NAMES[$i]}: ❌ FAIL"
    fi
done

echo ""
echo "🎯 RESULTADO FINAL: $PASSED_TESTS/$TOTAL_TESTS tests pasaron ($PERCENTAGE%)"

if [ "$PASSED_TESTS" -eq "$TOTAL_TESTS" ]; then
    echo "🎉 ¡Todos los tests pasaron! El servicio funciona correctamente."
else
    echo "⚠️ Algunos tests fallaron. Revisar implementación."
fi

echo ""
echo "✅ Tests completados."

# Limpiar archivos temporales
rm -f /tmp/test_*

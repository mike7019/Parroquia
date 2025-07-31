#!/bin/bash

# Script para probar la prevención de duplicados en endpoints de creación

BASE_URL="http://localhost:3000/api"

echo "🧪 PROBANDO PREVENCIÓN DE DUPLICADOS EN ENDPOINTS DE CREACIÓN"
echo "============================================================="

# Función para obtener token (necesitarás ajustar las credenciales)
get_token() {
    echo "🔐 Obteniendo token de autenticación..."
    
    # Intentar login con usuario existente (ajusta las credenciales según tu DB)
    TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@parroquia.com","password":"admin123"}' | \
        jq -r '.data.accessToken' 2>/dev/null)
    
    if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
        echo "❌ No se pudo obtener token. Verifica las credenciales."
        return 1
    fi
    
    echo "✅ Token obtenido exitosamente"
    return 0
}

# Función para probar endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local data="$3"
    
    echo ""
    echo "🔍 Probando: $name"
    echo "   URL: $url"
    
    # Primera llamada - debe crear exitosamente
    echo "   📝 Primera llamada (crear)..."
    response1=$(curl -s -X POST "$url" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$data")
    
    status1=$(echo "$response1" | jq -r '.status' 2>/dev/null)
    message1=$(echo "$response1" | jq -r '.message' 2>/dev/null)
    
    if [ "$status1" = "success" ]; then
        echo "   ✅ Primera llamada exitosa: $message1"
    else
        echo "   ❌ Primera llamada falló: $message1"
        return 1
    fi
    
    # Segunda llamada - debe fallar con duplicado
    echo "   📝 Segunda llamada (duplicado)..."
    response2=$(curl -s -X POST "$url" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$data")
    
    status2=$(echo "$response2" | jq -r '.status' 2>/dev/null)
    message2=$(echo "$response2" | jq -r '.message' 2>/dev/null)
    
    if [ "$status2" = "error" ] && [[ "$message2" == *"ya existe"* || "$message2" == *"already exists"* ]]; then
        echo "   ✅ Segunda llamada correctamente rechazada: $message2"
        return 0
    else
        echo "   ❌ Segunda llamada debería haber fallado: $message2"
        return 1
    fi
}

# Verificar si jq está instalado
if ! command -v jq &> /dev/null; then
    echo "❌ jq no está instalado. Instálalo con: sudo apt-get install jq"
    exit 1
fi

# Obtener token
if ! get_token; then
    exit 1
fi

# Ejecutar pruebas
successful_tests=0
total_tests=0

# Test 1: Crear Sexo
((total_tests++))
if test_endpoint "Crear Sexo" "$BASE_URL/catalog/sexos" '{"sexo":"Test Masculino"}'; then
    ((successful_tests++))
fi

# Test 2: Crear Sector  
((total_tests++))
if test_endpoint "Crear Sector" "$BASE_URL/catalog/sectors" '{"nombre":"Sector Test Duplicado"}'; then
    ((successful_tests++))
fi

# Test 3: Crear Parroquia
((total_tests++))
if test_endpoint "Crear Parroquia" "$BASE_URL/catalog/parroquias" '{"nombre":"Parroquia Test Duplicado"}'; then
    ((successful_tests++))
fi

# Test 4: Crear Departamento
((total_tests++))
if test_endpoint "Crear Departamento" "$BASE_URL/catalog/departamentos" '{"nombre":"Departamento Test","codigo_dane":"99","region":"Test"}'; then
    ((successful_tests++))
fi

# Test 5: Crear Municipio
((total_tests++))
if test_endpoint "Crear Municipio" "$BASE_URL/catalog/municipios" '{"nombre_municipio":"Municipio Test","codigo_dane":"999","id_departamento":1}'; then
    ((successful_tests++))
fi

# Test 6: Crear Vereda
((total_tests++))
if test_endpoint "Crear Vereda" "$BASE_URL/catalog/veredas" '{"nombre":"Vereda Test","codigo_vereda":"9999","id_municipio":1}'; then
    ((successful_tests++))
fi

# Resumen
echo ""
echo "📊 RESUMEN DE PRUEBAS"
echo "===================="
echo "✅ Pruebas exitosas: $successful_tests/$total_tests"
echo "❌ Pruebas fallidas: $((total_tests - successful_tests))/$total_tests"

if [ $successful_tests -eq $total_tests ]; then
    echo ""
    echo "🎉 ¡TODAS LAS PRUEBAS PASARON!"
    echo "La prevención de duplicados está funcionando correctamente."
else
    echo ""
    echo "⚠️  ALGUNAS PRUEBAS FALLARON"
    echo "Revisar la implementación de findOrCreate."
fi

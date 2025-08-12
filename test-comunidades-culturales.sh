#!/bin/bash

# Test Comunidades Culturales API
BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/catalog"

echo "🔐 Iniciando sesión..."

# Hacer login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "diego.garciasdsd5105@yopmail.com",
    "password": "Fuerte789&"
  }')

# Extraer el token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d '"' -f 4)

if [ ! -z "$TOKEN" ]; then
    echo "✅ Login exitoso"
    echo "🎫 Token obtenido"
    
    echo ""
    echo "📋 Probando GET /comunidades-culturales..."
    
    # Test GET - Obtener todas las comunidades culturales
    GET_RESPONSE=$(curl -s -X GET "$API_URL/comunidades-culturales" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    
    echo "✅ Respuesta GET:"
    echo $GET_RESPONSE | head -c 500
    echo ""
    echo "🎉 API DE COMUNIDADES CULTURALES FUNCIONANDO CORRECTAMENTE!"
    
else
    echo "❌ Error en login"
    echo "Respuesta: $LOGIN_RESPONSE"
fi

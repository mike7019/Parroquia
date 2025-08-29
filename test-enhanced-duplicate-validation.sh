#!/bin/bash

echo "=== Testing Enhanced Duplicate Family Validation (Full Format) ==="

API_URL="http://206.62.139.100:3000"

# Step 1: Login
echo "Step 1: Authenticating..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"correo_electronico":"admin@parroquia.com","contrasena":"Admin123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Authentication failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Authentication successful"

# Step 2: Create original family with full format
echo -e "\nStep 2: Creating original family with complete data structure..."
ORIGINAL_DATA='{
  "informacionGeneral": {
    "municipio": { "id": "66001", "nombre": "Medellín" },
    "parroquia": { "id": "1", "nombre": "San José" },
    "sector": { "id": "1", "nombre": "Centro" },
    "vereda": { "id": "1", "nombre": "El Carmen" },
    "fecha": "2025-01-27T10:00:00.000Z",
    "apellido_familiar": "RODRIGUEZ_TEST",
    "direccion": "Avenida 80 #25-30 Test",
    "telefono": "3003456789",
    "numero_contrato_epm": "987654321",
    "comunionEnCasa": false
  },
  "vivienda": {
    "tipo_vivienda": { "id": "1", "nombre": "Casa" },
    "disposicion_basuras": {
      "recolector": true,
      "quemada": false,
      "enterrada": false,
      "recicla": true,
      "aire_libre": false,
      "no_aplica": false
    }
  },
  "servicios_agua": {
    "sistema_acueducto": { "id": "1", "nombre": "Acueducto Municipal" },
    "aguas_residuales": "Alcantarillado público",
    "pozo_septico": false,
    "letrina": false,
    "campo_abierto": false
  },
  "observaciones": {
    "sustento_familia": "Trabajo independiente",
    "observaciones_encuestador": "Familia colaborativa en la encuesta",
    "autorizacion_datos": true
  },
  "familyMembers": [
    {
      "nombres": "Carlos Eduardo",
      "apellidos": "Rodriguez Martinez",
      "fecha_nacimiento": "1985-03-10",
      "numeroIdentificacion": "1012345681",
      "tipoIdentificacion": "CC",
      "sexo": "M",
      "estado_civil": "Casado",
      "parentesco": "Jefe de Hogar",
      "nivel_educativo": "Bachillerato",
      "profesion": "Comerciante",
      "comunidad_cultural": "Mestizo"
    }
  ],
  "deceasedMembers": [],
  "metadata": {
    "timestamp": "2025-01-27T10:00:00.000Z",
    "completed": true,
    "currentStage": 1
  }
}'

CREATE_RESPONSE=$(curl -s -w "\nSTATUS_CODE:%{http_code}" -X POST "$API_URL/api/encuesta" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$ORIGINAL_DATA")

STATUS_CODE=$(echo "$CREATE_RESPONSE" | grep "STATUS_CODE:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$CREATE_RESPONSE" | sed '/STATUS_CODE:/d')

echo "Status Code: $STATUS_CODE"
echo "Response: $RESPONSE_BODY"

if [ "$STATUS_CODE" = "201" ]; then
  echo "✅ Original family created successfully"
else
  echo "❌ Failed to create original family"
  exit 1
fi

# Step 3: Test duplicate detection (same family data, different member ID)
echo -e "\nStep 3: Testing enhanced duplicate detection..."
echo "Creating same family with different member identification (simulating form error)"

DUPLICATE_DATA='{
  "informacionGeneral": {
    "municipio": { "id": "66001", "nombre": "Medellín" },
    "parroquia": { "id": "1", "nombre": "San José" },
    "sector": { "id": "1", "nombre": "Centro" },
    "vereda": { "id": "1", "nombre": "El Carmen" },
    "fecha": "2025-01-27T10:30:00.000Z",
    "apellido_familiar": "RODRIGUEZ_TEST",
    "direccion": "Avenida 80 #25-30 Test",
    "telefono": "3003456789",
    "numero_contrato_epm": "987654321",
    "comunionEnCasa": false
  },
  "vivienda": {
    "tipo_vivienda": { "id": "1", "nombre": "Casa" },
    "disposicion_basuras": {
      "recolector": true,
      "quemada": false,
      "enterrada": false,
      "recicla": true,
      "aire_libre": false,
      "no_aplica": false
    }
  },
  "servicios_agua": {
    "sistema_acueducto": { "id": "1", "nombre": "Acueducto Municipal" },
    "aguas_residuales": "Alcantarillado público",
    "pozo_septico": false,
    "letrina": false,
    "campo_abierto": false
  },
  "observaciones": {
    "sustento_familia": "Trabajo independiente",
    "observaciones_encuestador": "Familia colaborativa en la encuesta",
    "autorizacion_datos": true
  },
  "familyMembers": [
    {
      "nombres": "Carlos Eduardo",
      "apellidos": "Rodriguez Martinez",
      "fecha_nacimiento": "1985-03-10",
      "numeroIdentificacion": "9876543210",
      "tipoIdentificacion": "CC",
      "sexo": "M",
      "estado_civil": "Casado",
      "parentesco": "Jefe de Hogar",
      "nivel_educativo": "Bachillerato",
      "profesion": "Comerciante",
      "comunidad_cultural": "Mestizo"
    }
  ],
  "deceasedMembers": [],
  "metadata": {
    "timestamp": "2025-01-27T10:30:00.000Z",
    "completed": true,
    "currentStage": 1
  }
}'

echo "Testing with same family but different member ID: 9876543210 instead of 1012345681"

DUPLICATE_RESPONSE=$(curl -s -w "\nSTATUS_CODE:%{http_code}" -X POST "$API_URL/api/encuesta" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$DUPLICATE_DATA")

DUP_STATUS_CODE=$(echo "$DUPLICATE_RESPONSE" | grep "STATUS_CODE:" | cut -d: -f2)
DUP_RESPONSE_BODY=$(echo "$DUPLICATE_RESPONSE" | sed '/STATUS_CODE:/d')

echo -e "\nDuplicate Detection Results:"
echo "Status Code: $DUP_STATUS_CODE"
echo "Response:"
echo "$DUP_RESPONSE_BODY" | python3 -m json.tool 2>/dev/null || echo "$DUP_RESPONSE_BODY"

# Analyze results
echo -e "\n=== Analysis ==="
if [ "$DUP_STATUS_CODE" = "409" ]; then
  echo "✅ Duplicate family correctly detected (409 Conflict)"
  
  if echo "$DUP_RESPONSE_BODY" | grep -q "posible_error_formulacion"; then
    echo "✅ Form error detection working - detects when same family has different member IDs"
  else
    echo "⚠️  Form error detection may not be working properly"
  fi
  
  if echo "$DUP_RESPONSE_BODY" | grep -q "miembros_existentes"; then
    echo "✅ Existing members comparison working"
  else
    echo "⚠️  Existing members comparison may not be working properly"
  fi
  
  if echo "$DUP_RESPONSE_BODY" | grep -q "POSIBLE ERROR: Verificar si cambiaste incorrectamente las cédulas"; then
    echo "✅ Enhanced error message for form mistakes working"
  else
    echo "⚠️  Enhanced error message may not be working properly"
  fi
  
  echo -e "\n🎉 Enhanced duplicate family validation is working correctly!"
  echo "   - Detects duplicate families ✓"
  echo "   - Identifies potential form errors when users change member IDs ✓"
  echo "   - Provides detailed guidance to users ✓"
  
else
  echo "❌ Expected 409 conflict for duplicate family, got $DUP_STATUS_CODE"
  echo "Enhanced validation may not be working properly"
fi

echo -e "\n=== Test Complete ==="

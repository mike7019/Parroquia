#!/bin/bash

echo "=== Simple Test for Enhanced Duplicate Validation ==="

API_URL="http://206.62.139.100:3000"

# Login and get token
echo "Logging in..."
TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"correo_electronico":"admin@parroquia.com","contrasena":"Admin123!"}' | \
  grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful"

# First, let's see what encuestas already exist
echo -e "\nChecking existing encuestas..."
EXISTING=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/encuestas")
echo "Existing count: $(echo $EXISTING | grep -o '"total":[0-9]*' | cut -d: -f2)"

# Now let's test creating a duplicate by trying to create a family that might already exist
echo -e "\nTesting duplicate detection with minimal valid data..."

# Use IDs that are likely to exist (1,1,1,1)
TEST_DATA='{
  "informacionGeneral": {
    "municipio": { "id": "1" },
    "parroquia": { "id": "1" },
    "sector": { "id": "1" },
    "vereda": { "id": "1" },
    "fecha": "2025-01-27T15:00:00.000Z",
    "apellido_familiar": "TEST_DUPLICATE_FAMILIA",
    "direccion": "Calle Test Duplicada 123",
    "telefono": "3001112233",
    "numero_contrato_epm": "123456789",
    "comunionEnCasa": false
  },
  "vivienda": {
    "tipo_vivienda": { "id": "1" },
    "disposicion_basuras": {
      "recolector": true,
      "quemada": false,
      "enterrada": false,
      "recicla": false,
      "aire_libre": false,
      "no_aplica": false
    }
  },
  "servicios_agua": {
    "sistema_acueducto": { "id": "1" },
    "aguas_residuales": "Alcantarillado público",
    "pozo_septico": false,
    "letrina": false,
    "campo_abierto": false
  },
  "observaciones": {
    "sustento_familia": "Test",
    "observaciones_encuestador": "Test de validación",
    "autorizacion_datos": true
  },
  "familyMembers": [
    {
      "nombres": "Persona",
      "apellidos": "De Prueba",
      "fecha_nacimiento": "1990-01-01",
      "numeroIdentificacion": "1111111111",
      "tipoIdentificacion": "CC",
      "sexo": "M",
      "estado_civil": "Soltero",
      "parentesco": "Jefe de Hogar",
      "nivel_educativo": "Primaria",
      "profesion": "Empleado",
      "comunidad_cultural": "Mestizo"
    }
  ],
  "deceasedMembers": [],
  "metadata": {
    "timestamp": "2025-01-27T15:00:00.000Z",
    "completed": true,
    "currentStage": 1
  }
}'

# Try to create family twice to test duplicate detection
echo "Creating family first time..."
FIRST_RESPONSE=$(curl -s -w "STATUS:%{http_code}" -X POST "$API_URL/api/encuesta" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

FIRST_STATUS=$(echo "$FIRST_RESPONSE" | grep "STATUS:" | cut -d: -f2)
FIRST_BODY=$(echo "$FIRST_RESPONSE" | sed 's/STATUS:[0-9]*$//')

echo "First creation status: $FIRST_STATUS"

# If first was successful, try duplicate
if [ "$FIRST_STATUS" = "201" ]; then
  echo "✅ First family created successfully"
  
  echo -e "\nNow testing duplicate with different member ID..."
  
  # Change the member ID to test our enhanced validation
  DUPLICATE_DATA=$(echo "$TEST_DATA" | sed 's/"numeroIdentificacion": "1111111111"/"numeroIdentificacion": "2222222222"/')
  
  DUPLICATE_RESPONSE=$(curl -s -w "STATUS:%{http_code}" -X POST "$API_URL/api/encuesta" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$DUPLICATE_DATA")
  
  DUP_STATUS=$(echo "$DUPLICATE_RESPONSE" | grep "STATUS:" | cut -d: -f2)
  DUP_BODY=$(echo "$DUPLICATE_RESPONSE" | sed 's/STATUS:[0-9]*$//')
  
  echo "Duplicate attempt status: $DUP_STATUS"
  
  if [ "$DUP_STATUS" = "409" ]; then
    echo "✅ Enhanced duplicate validation working!"
    echo "Response contains:"
    
    if echo "$DUP_BODY" | grep -q "posible_error_formulacion"; then
      echo "  ✅ Form error detection"
    fi
    
    if echo "$DUP_BODY" | grep -q "POSIBLE ERROR"; then
      echo "  ✅ Enhanced error message"
    fi
    
    echo -e "\nFull response:"
    echo "$DUP_BODY" | python3 -m json.tool 2>/dev/null || echo "$DUP_BODY"
    
  else
    echo "❌ Expected 409, got $DUP_STATUS"
    echo "Response: $DUP_BODY"
  fi
  
else
  echo "❌ First family creation failed with status: $FIRST_STATUS"
  echo "Response: $FIRST_BODY"
  echo "This might be due to missing reference data or validation errors"
fi

echo -e "\n=== Test Complete ==="

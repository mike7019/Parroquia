#!/bin/bash

echo "=== Testing Enhanced Duplicate Family Validation ==="

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

# Step 2: Create original family
echo -e "\nStep 2: Creating original family..."
ORIGINAL_DATA='{
  "personas": [
    {
      "tipoIdentificacion": "1",
      "numeroIdentificacion": "1012345681",
      "nombres": "Carlos",
      "apellidos": "Rodriguez",
      "fechaNacimiento": "1985-03-10",
      "genero": "M",
      "estadoCivil": "1",
      "esJefeFamilia": true,
      "tipoPoblacion": "1"
    }
  ],
  "familia": {
    "direccion": "Avenida 80 #25-30",
    "telefono": "3003456789",
    "vulnerabilidad": false,
    "etnia": "1",
    "iglesia": "1",
    "comunionEnCasa": false,
    "correoElectronico": "carlos@example.com",
    "departamento": "66",
    "municipio": "66001",
    "parroquia": "1",
    "sector": "1",
    "vereda": "1"
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
echo -e "\nStep 3: Testing duplicate detection with different member ID..."
DUPLICATE_DATA='{
  "personas": [
    {
      "tipoIdentificacion": "1",
      "numeroIdentificacion": "9876543210",
      "nombres": "Carlos",
      "apellidos": "Rodriguez", 
      "fechaNacimiento": "1985-03-10",
      "genero": "M",
      "estadoCivil": "1",
      "esJefeFamilia": true,
      "tipoPoblacion": "1"
    }
  ],
  "familia": {
    "direccion": "Avenida 80 #25-30",
    "telefono": "3003456789",
    "vulnerabilidad": false,
    "etnia": "1",
    "iglesia": "1",
    "comunionEnCasa": false,
    "correoElectronico": "carlos@example.com",
    "departamento": "66",
    "municipio": "66001",
    "parroquia": "1",
    "sector": "1",
    "vereda": "1"
  }
}'

DUPLICATE_RESPONSE=$(curl -s -w "\nSTATUS_CODE:%{http_code}" -X POST "$API_URL/api/encuesta" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$DUPLICATE_DATA")

DUP_STATUS_CODE=$(echo "$DUPLICATE_RESPONSE" | grep "STATUS_CODE:" | cut -d: -f2)
DUP_RESPONSE_BODY=$(echo "$DUPLICATE_RESPONSE" | sed '/STATUS_CODE:/d')

echo "Status Code: $DUP_STATUS_CODE"
echo "Response: $DUP_RESPONSE_BODY"

if [ "$DUP_STATUS_CODE" = "409" ]; then
  echo "✅ Enhanced duplicate validation working correctly"
  echo "Checking for enhanced error details..."
  
  if echo "$DUP_RESPONSE_BODY" | grep -q "posible_error_formulacion"; then
    echo "✅ Form error detection working"
  else
    echo "⚠️  Form error detection may not be working"
  fi
  
  if echo "$DUP_RESPONSE_BODY" | grep -q "miembros_comparacion"; then
    echo "✅ Member comparison working"
  else
    echo "⚠️  Member comparison may not be working"
  fi
else
  echo "❌ Expected 409 conflict, got $DUP_STATUS_CODE"
fi

echo -e "\n=== Test Complete ==="

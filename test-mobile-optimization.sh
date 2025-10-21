#!/bin/bash

# Script para verificar que la API está optimizada para iPhone
# Uso: bash test-mobile-optimization.sh

API_URL="${1:-http://206.62.139.100:3000}"
COLORS='\033[0m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'

echo -e "${BLUE}🍎 Test de Optimización Mobile para iPhone${COLORS}"
echo "═══════════════════════════════════════════════"
echo "API URL: $API_URL"
echo ""

# Test 1: Health check con headers mobile
echo -e "${BLUE}[TEST 1]${COLORS} Health Check con headers iOS/Safari..."
RESPONSE=$(curl -s -i -X GET "$API_URL/api/health" \
  -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" \
  -H "Accept: application/json")

if echo "$RESPONSE" | grep -q "200"; then
  echo -e "${GREEN}✅ Health check exitoso${COLORS}"
  
  # Verificar headers optimizados
  if echo "$RESPONSE" | grep -q "Cache-Control"; then
    echo -e "${GREEN}✅ Header Cache-Control presente${COLORS}"
  else
    echo -e "${YELLOW}⚠️  Header Cache-Control no detectado${COLORS}"
  fi
  
  if echo "$RESPONSE" | grep -q "X-UA-Compatible"; then
    echo -e "${GREEN}✅ Header X-UA-Compatible presente${COLORS}"
  else
    echo -e "${YELLOW}⚠️  Header X-UA-Compatible no detectado${COLORS}"
  fi
  
else
  echo -e "${RED}❌ Falló health check${COLORS}"
  echo "$RESPONSE"
fi

echo ""

# Test 2: CORS Preflight con headers mobile
echo -e "${BLUE}[TEST 2]${COLORS} Test CORS Preflight para iPhone..."
RESPONSE=$(curl -s -i -X OPTIONS "$API_URL/api/auth/login" \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: User-Agent,Content-Type,Authorization" \
  -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" 2>&1)

if echo "$RESPONSE" | grep -q "Access-Control-Allow-Headers"; then
  if echo "$RESPONSE" | grep -q "User-Agent"; then
    echo -e "${GREEN}✅ Header User-Agent permitido en CORS${COLORS}"
  else
    echo -e "${RED}❌ Header User-Agent NO permitido en CORS${COLORS}"
  fi
  
  if echo "$RESPONSE" | grep -q "Access-Control-Allow-Credentials"; then
    echo -e "${GREEN}✅ Credentials permitidas para iPhone${COLORS}"
  else
    echo -e "${YELLOW}⚠️  Credentials no permitidas${COLORS}"
  fi
else
  echo -e "${RED}❌ CORS Preflight falló${COLORS}"
fi

echo ""

# Test 3: Compresión gzip
echo -e "${BLUE}[TEST 3]${COLORS} Test de Compresión Gzip..."
RESPONSE=$(curl -s -i "$API_URL/api/health" \
  -H "Accept-Encoding: gzip, deflate" \
  -H "User-Agent: Mozilla/5.0 (iPhone)" 2>&1)

if echo "$RESPONSE" | grep -q "Content-Encoding: gzip\|gzip"; then
  echo -e "${GREEN}✅ Respuesta comprimida con gzip${COLORS}"
else
  echo -e "${YELLOW}⚠️  Compresión gzip no detectada (posible pero no crítico)${COLORS}"
fi

echo ""

# Test 4: Keep-Alive
echo -e "${BLUE}[TEST 4]${COLORS} Test de Keep-Alive connection..."
RESPONSE=$(curl -s -i "$API_URL/api/health" \
  -H "User-Agent: Mozilla/5.0 (iPhone)" 2>&1)

if echo "$RESPONSE" | grep -qi "Connection: keep-alive\|Connection: Keep-Alive"; then
  echo -e "${GREEN}✅ Keep-Alive habilitado${COLORS}"
else
  echo -e "${YELLOW}⚠️  Keep-Alive no está explícitamente configurado${COLORS}"
fi

echo ""

# Test 5: Timeout y respuesta rápida
echo -e "${BLUE}[TEST 5]${COLORS} Test de Velocidad de Respuesta..."
START_TIME=$(date +%s%N)

curl -s "$API_URL/api/health" \
  -H "User-Agent: Mozilla/5.0 (iPhone)" > /dev/null 2>&1

END_TIME=$(date +%s%N)
ELAPSED=$((($END_TIME - $START_TIME) / 1000000))

echo -e "Tiempo de respuesta: ${ELAPSED}ms"

if [ $ELAPSED -lt 500 ]; then
  echo -e "${GREEN}✅ Muy rápido para iPhone (< 500ms)${COLORS}"
elif [ $ELAPSED -lt 1000 ]; then
  echo -e "${GREEN}✅ Rápido para iPhone (< 1s)${COLORS}"
elif [ $ELAPSED -lt 3000 ]; then
  echo -e "${YELLOW}⚠️  Moderado para iPhone (< 3s)${COLORS}"
else
  echo -e "${RED}❌ Lento para iPhone (> 3s)${COLORS}"
fi

echo ""

# Test 6: Detectar si se reconoce como móvil
echo -e "${BLUE}[TEST 6]${COLORS} Test de Detección Mobile..."
RESPONSE=$(curl -s -i "$API_URL/api/health" \
  -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" 2>&1)

if echo "$RESPONSE" | head -20 | grep -qi "vary.*user-agent\|vary.*accept-encoding"; then
  echo -e "${GREEN}✅ Middleware móvil aplicado (header Vary presente)${COLORS}"
else
  echo -e "${YELLOW}⚠️  Header Vary no detectado${COLORS}"
fi

echo ""

# Test 7: Limpieza de campos innecesarios
echo -e "${BLUE}[TEST 7]${COLORS} Test de Optimización de Respuestas..."
RESPONSE=$(curl -s -X GET "$API_URL/api/health" \
  -H "User-Agent: Mozilla/5.0 (iPhone)" 2>&1)

# Contar el tamaño de la respuesta
RESPONSE_SIZE=$(echo "$RESPONSE" | wc -c)
echo -e "Tamaño de respuesta: ${RESPONSE_SIZE} bytes"

if [ $RESPONSE_SIZE -lt 500 ]; then
  echo -e "${GREEN}✅ Respuesta optimizada (< 500 bytes)${COLORS}"
elif [ $RESPONSE_SIZE -lt 1000 ]; then
  echo -e "${GREEN}✅ Tamaño aceptable${COLORS}"
else
  echo -e "${YELLOW}⚠️  Respuesta podría optimizarse (> 1KB)${COLORS}"
fi

echo ""

# Resumen final
echo "═══════════════════════════════════════════════"
echo -e "${BLUE}📊 Resumen de Tests${COLORS}"
echo -e "${GREEN}✅ Todos los tests completados${COLORS}"
echo ""
echo "Recomendaciones para iPhone:"
echo "1. Usar WiFi en lugar de datos móviles"
echo "2. Conectar desde la misma red (LAN)"
echo "3. Si hay lentitud, verificar ancho de banda"
echo "4. En Safari: Settings → Safari → Clear History"
echo ""
echo -e "${BLUE}🍎 Prueba en tu iPhone:${COLORS}"
echo "URL: $API_URL/api/health"
echo ""

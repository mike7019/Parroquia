#!/bin/bash

# Script rápido para verificar que todo funciona después del deploy
# Uso: bash quick-test.sh [URL]

API_URL="${1:-http://206.62.139.100:3000}"
echo "🧪 Testing Parroquia API - Mobile Optimization v2.0"
echo "URL: $API_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

# Test function
test_endpoint() {
    local test_name=$1
    local method=$2
    local endpoint=$3
    local headers=$4
    
    echo -n "🔍 $test_name... "
    
    if [ -z "$headers" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" 2>/dev/null)
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" $headers 2>/dev/null)
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $HTTP_CODE)"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $HTTP_CODE)"
        ((FAIL++))
        echo "  Response: $BODY"
    fi
}

# Test CORS
test_cors() {
    local test_name=$1
    local endpoint=$2
    local header=$3
    
    echo -n "🔍 $test_name... "
    
    RESPONSE=$(curl -s -i -X OPTIONS "$API_URL$endpoint" \
        -H "Origin: http://localhost:3001" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: $header" 2>/dev/null)
    
    if echo "$RESPONSE" | grep -q "Access-Control-Allow-Headers"; then
        if echo "$RESPONSE" | grep -q "$header"; then
            echo -e "${GREEN}✅ PASS${NC}"
            ((PASS++))
        else
            echo -e "${RED}❌ FAIL${NC} - Header not allowed"
            ((FAIL++))
        fi
    else
        echo -e "${RED}❌ FAIL${NC} - No CORS headers"
        ((FAIL++))
    fi
}

# Test mobile optimization
test_mobile_header() {
    local test_name=$1
    local header=$2
    
    echo -n "🔍 $test_name... "
    
    RESPONSE=$(curl -s -i http://$API_URL/api/health \
        -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" 2>/dev/null)
    
    if echo "$RESPONSE" | grep -q "$header"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠️  WARNING${NC} - $header not found"
        ((FAIL++))
    fi
}

echo "═══════════════════════════════════════════════"
echo "1️⃣  BASIC TESTS"
echo "═══════════════════════════════════════════════"
echo ""

test_endpoint "Health Check" "GET" "/api/health"
test_endpoint "Home" "GET" "/"

echo ""
echo "═══════════════════════════════════════════════"
echo "2️⃣  CORS TESTS"
echo "═══════════════════════════════════════════════"
echo ""

test_cors "CORS - User-Agent" "/api/auth/login" "User-Agent"
test_cors "CORS - Content-Type" "/api/auth/login" "Content-Type"
test_cors "CORS - Authorization" "/api/auth/login" "Authorization"

echo ""
echo "═══════════════════════════════════════════════"
echo "3️⃣  MOBILE OPTIMIZATION TESTS"
echo "═══════════════════════════════════════════════"
echo ""

test_mobile_header "Cache-Control header" "Cache-Control"
test_mobile_header "X-UA-Compatible header" "X-UA-Compatible"
test_mobile_header "Keep-Alive header" "Keep-Alive"

echo ""
echo "═══════════════════════════════════════════════"
echo "4️⃣  PERFORMANCE TESTS"
echo "═══════════════════════════════════════════════"
echo ""

START_TIME=$(date +%s%N)
curl -s "$API_URL/api/health" > /dev/null 2>&1
END_TIME=$(date +%s%N)
ELAPSED=$((($END_TIME - $START_TIME) / 1000000))

echo -n "🔍 Response time... "
if [ $ELAPSED -lt 500 ]; then
    echo -e "${GREEN}✅ EXCELLENT${NC} (${ELAPSED}ms)"
    ((PASS++))
elif [ $ELAPSED -lt 1000 ]; then
    echo -e "${GREEN}✅ GOOD${NC} (${ELAPSED}ms)"
    ((PASS++))
elif [ $ELAPSED -lt 2000 ]; then
    echo -e "${YELLOW}⚠️  OK${NC} (${ELAPSED}ms)"
else
    echo -e "${RED}❌ SLOW${NC} (${ELAPSED}ms)"
    ((FAIL++))
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "SUMMARY"
echo "═══════════════════════════════════════════════"
echo ""
echo -e "✅ PASSED: ${GREEN}$PASS${NC}"
echo -e "❌ FAILED: ${RED}$FAIL${NC}"
echo -e "📊 SCORE: ${GREEN}$(((PASS*100)/(PASS+FAIL)))%${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo ""
    echo "Your Parroquia API is ready for:"
    echo "  ✅ iPhone access"
    echo "  ✅ CORS requests"
    echo "  ✅ Mobile optimization"
    echo ""
    echo "Next steps:"
    echo "  1. Test from iPhone: http://206.62.139.100:3000"
    echo "  2. Try login with credentials"
    echo "  3. Check Safari console for any errors"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
    echo ""
    echo "Please check:"
    echo "  • Server is running: docker-compose ps"
    echo "  • Docker rebuild without cache: docker-compose build --no-cache"
    echo "  • Logs: docker-compose logs -f api"
    exit 1
fi

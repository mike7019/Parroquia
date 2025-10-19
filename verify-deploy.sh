#!/bin/bash
# Script rápido de verificación post-deploy
# Uso: bash verify-deploy.sh

echo "═══════════════════════════════════════════════════════════════"
echo "🔍 VERIFICACIÓN RÁPIDA DE DESPLIEGUE"
echo "═══════════════════════════════════════════════════════════════"
echo ""

SERVER="206.62.139.11"
USER="ubuntu"
API_URL="http://206.62.139.11:3000"

echo "1️⃣  Verificando estado de la aplicación..."
ssh ${USER}@${SERVER} 'pm2 status | grep parroquia-api'
echo ""

echo "2️⃣  Verificando logs recientes..."
ssh ${USER}@${SERVER} 'pm2 logs parroquia-api --lines 10 --nostream'
echo ""

echo "3️⃣  Probando endpoint de salud..."
curl -s "${API_URL}/api/health" | head -5
echo ""

echo "4️⃣  Probando endpoint de corregimientos..."
curl -s "${API_URL}/api/catalog/corregimientos" | head -20
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ VERIFICACIÓN COMPLETADA"
echo "═══════════════════════════════════════════════════════════════"

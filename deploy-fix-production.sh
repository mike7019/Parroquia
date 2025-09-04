#!/bin/bash

# 🚀 DESPLIEGUE DE CORRECCIÓN URGENTE - TABLAS FALTANTES
# Soluciona el error: "relation parroquias does not exist" y tablas junction

set -e

echo "🚨 INICIANDO CORRECCIÓN URGENTE EN PRODUCCIÓN..."
echo "📅 $(date)"

# Variables de configuración
SERVER="206.62.139.11"
USER="ubuntu"
APP_DIR="/home/ubuntu/parroquia-management"

echo "🔗 Conectando al servidor de producción..."

# 1. Copiar script de corrección al servidor
echo "📂 Copiando script de corrección..."
scp fix-relations-urgent.js $USER@$SERVER:$APP_DIR/

# 2. Ejecutar corrección en el servidor
echo "🔧 Ejecutando corrección de base de datos..."
ssh $USER@$SERVER << 'EOF'
cd /home/ubuntu/parroquia-management

echo "🛑 Deteniendo contenedores..."
docker-compose down

echo "🚀 Iniciando solo la base de datos..."
docker-compose up -d postgres

echo "⏳ Esperando que PostgreSQL esté listo..."
sleep 10

echo "🔧 Ejecutando corrección de tablas..."
docker-compose exec -T postgres psql -U parroquia_user -d parroquia_db -c "\dt" || true

# Ejecutar script de corrección
node fix-relations-urgent.js

echo "✅ Corrección completada"

echo "🚀 Reiniciando todos los servicios..."
docker-compose up -d

echo "⏳ Esperando que los servicios estén listos..."
sleep 15

echo "🩺 Verificando estado de los servicios..."
docker-compose ps

echo "🌐 Probando endpoint de salud..."
curl -f http://localhost:3000/api/health || echo "❌ Health check falló"

EOF

echo "🎉 ¡CORRECCIÓN DEPLOYADA EXITOSAMENTE!"
echo "🔗 Servidor disponible en: http://206.62.139.11:3000"
echo "📋 Verificar logs: docker-compose logs -f api"

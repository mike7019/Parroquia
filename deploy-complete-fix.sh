#!/bin/bash

# 🚀 DESPLIEGUE COMPLETO - CORRECCIÓN DE TABLAS + CONFIGURACIÓN SWAGGER
# Servidor: 72.60.113.85:3001

set -e

echo "🚨 INICIANDO DESPLIEGUE COMPLETO EN PRODUCCIÓN..."
echo "📅 $(date)"
echo "🎯 Servidor: 72.60.113.85:3001"

# Variables de configuración
SERVER="72.60.113.85"
USER="ubuntu"
APP_DIR="/home/ubuntu/parroquia-management"
PORT="3001"

echo "🔗 Conectando al servidor de producción..."

# 1. Desplegar código actualizado
echo "📦 Desplegando código actualizado..."
ssh $USER@$SERVER << 'EOF'
cd /home/ubuntu/parroquia-management

echo "🛑 Deteniendo servicios..."
docker-compose down

echo "📥 Actualizando código desde GitHub..."
git fetch origin
git checkout develop
git pull origin develop

echo "🔨 Reconstruyendo imágenes Docker..."
docker-compose build --no-cache

echo "🚀 Iniciando solo PostgreSQL..."
docker-compose up -d postgres

echo "⏳ Esperando PostgreSQL (15 segundos)..."
sleep 15

echo "✅ PostgreSQL listo"
EOF

# 2. Copiar y ejecutar script de corrección
echo "🔧 Copiando script de corrección..."
scp fix-relations-urgent.js $USER@$SERVER:$APP_DIR/

echo "🛠️ Ejecutando corrección de tablas..."
ssh $USER@$SERVER << 'EOF'
cd /home/ubuntu/parroquia-management

echo "🔧 Aplicando corrección de tablas faltantes..."
node fix-relations-urgent.js

echo "✅ Corrección de tablas completada"
EOF

# 3. Iniciar todos los servicios
echo "🚀 Iniciando todos los servicios..."
ssh $USER@$SERVER << 'EOF'
cd /home/ubuntu/parroquia-management

echo "🚀 Iniciando todos los servicios..."
docker-compose up -d

echo "⏳ Esperando que los servicios estén listos (30 segundos)..."
sleep 30

echo "🩺 Verificando estado de los servicios..."
docker-compose ps

echo "🌐 Verificando conectividad..."
curl -f http://localhost:3001/api/health || echo "❌ Health check falló"

echo "📋 Mostrando logs recientes..."
docker-compose logs --tail=20 api

EOF

echo ""
echo "🎉 ¡DESPLIEGUE COMPLETO EXITOSO!"
echo ""
echo "🔗 URLs disponibles:"
echo "   📚 Swagger UI: http://72.60.113.85:3001/api-docs"
echo "   💚 Health Check: http://72.60.113.85:3001/api/health"
echo "   🏠 API Base: http://72.60.113.85:3001/api"
echo ""
echo "🔧 Configuración actualizada:"
echo "   ✅ Servidor agregado a Swagger dropdown"
echo "   ✅ Tablas de relaciones corregidas"
echo "   ✅ Sistemas de acueducto configurados"
echo ""
echo "🚨 Verificaciones importantes:"
echo "   1. Probar login en: http://72.60.113.85:3001/api-docs"
echo "   2. Verificar encuestas funcionando"
echo "   3. Revisar logs: docker-compose logs -f api"
echo ""
echo "📅 Despliegue completado: $(date)"

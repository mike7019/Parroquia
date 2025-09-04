#!/bin/bash

# 🚀 CORRECCIÓN URGENTE - TABLAS FALTANTES EN PRODUCCIÓN
# Servidor: 72.60.113.85:3001
# Soluciona: "relation parroquias does not exist" y tablas junction

set -e

echo "🚨 INICIANDO CORRECCIÓN URGENTE EN PRODUCCIÓN..."
echo "📅 $(date)"
echo "🎯 Servidor: 72.60.113.85:3001"

# Variables de configuración (ajustar según tu servidor)
SERVER="72.60.113.85"
USER="ubuntu"
APP_DIR="/home/ubuntu/parroquia-management"
PORT="3001"

# Función para verificar conexión
check_connection() {
    echo "� Verificando conexión al servidor..."
    if ssh -o ConnectTimeout=5 $USER@$SERVER "echo 'Conexión exitosa'"; then
        echo "✅ Conexión al servidor establecida"
        return 0
    else
        echo "❌ No se pudo conectar al servidor $SERVER"
        echo "💡 Verifica:"
        echo "   - Que tengas acceso SSH al servidor"
        echo "   - Que las variables SERVER y USER estén correctas"
        exit 1
    fi
}

# Verificar conexión antes de proceder
check_connection

# 1. Copiar script de corrección al servidor
echo "📂 Copiando script de corrección..."
if scp fix-relations-urgent.js $USER@$SERVER:$APP_DIR/; then
    echo "✅ Script copiado exitosamente"
else
    echo "❌ Error copiando script. Verificar permisos y rutas."
    exit 1
fi

# 2. Ejecutar corrección en el servidor
echo "🔧 Ejecutando corrección de base de datos..."
ssh $USER@$SERVER << 'EOF'
cd /home/ubuntu/parroquia-management

echo "� Directorio actual: $(pwd)"
echo "📁 Contenido del directorio:"
ls -la | head -10

echo "�🛑 Deteniendo contenedores..."
docker-compose down || echo "⚠️ No había contenedores ejecutándose"

echo "🚀 Iniciando solo PostgreSQL..."
docker-compose up -d postgres

echo "⏳ Esperando que PostgreSQL esté listo (15 segundos)..."
sleep 15

echo "� Verificando estado de PostgreSQL..."
docker-compose ps postgres

echo "🧪 Probando conexión a la base de datos..."
docker-compose exec postgres psql -U parroquia_user -d parroquia_db -c "SELECT version();" || echo "⚠️ Error en conexión DB"

echo "🔧 Ejecutando script de corrección de tablas..."
if [ -f "fix-relations-urgent.js" ]; then
    echo "✅ Script encontrado, ejecutando..."
    node fix-relations-urgent.js
    echo "✅ Corrección de tablas completada"
else
    echo "❌ Script fix-relations-urgent.js no encontrado"
    exit 1
fi

echo "🚀 Reiniciando todos los servicios..."
docker-compose up -d

echo "⏳ Esperando que los servicios estén listos (20 segundos)..."
sleep 20

echo "🩺 Verificando estado de todos los servicios..."
docker-compose ps

echo "🌐 Probando endpoints..."
curl -f http://localhost:3001/api/health || echo "❌ Health check falló en puerto 3001"
curl -f http://localhost:3000/api/health || echo "❌ Health check falló en puerto 3000"

echo "📋 Últimos logs de la aplicación:"
docker-compose logs --tail=10 api

EOF

echo ""
echo "🎉 ¡CORRECCIÓN EJECUTADA!"
echo ""
echo "🔗 URLs para verificar:"
echo "   💚 Health Check: http://72.60.113.85:3001/api/health"
echo "   📚 Swagger UI: http://72.60.113.85:3001/api-docs"
echo "   🏠 API Base: http://72.60.113.85:3001/api"
echo ""
echo "� Verificaciones recomendadas:"
echo "   1. Probar login en Swagger"
echo "   2. Verificar que las encuestas funcionen"
echo "   3. Revisar logs: ssh $USER@$SERVER 'cd $APP_DIR && docker-compose logs -f api'"
echo ""
echo "📅 Corrección completada: $(date)"

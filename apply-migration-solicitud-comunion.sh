#!/bin/bash

# Script para aplicar migración de solicitud_comunion_casa en servidor remoto
# Fecha: 2025-12-25
# Descripción: Agrega columna solicitud_comunion_casa a tabla personas

SERVER="ubuntu@206.62.139.11"
CONTAINER_NAME="parroquia-api-1"  # Ajustar si el nombre del contenedor es diferente

echo "🚀 Aplicando migración: solicitud_comunion_casa"
echo "================================================"
echo ""
echo "📡 Conectando a servidor: $SERVER"
echo ""

# Ejecutar migración
ssh $SERVER << 'EOF'
cd ~/Parroquia || cd /var/www/Parroquia || cd /home/ubuntu/Parroquia

echo "📂 Directorio actual: $(pwd)"
echo ""

# Verificar que Docker está corriendo
if ! docker ps &> /dev/null; then
    echo "❌ Error: Docker no está corriendo o no tienes permisos"
    exit 1
fi

# Ejecutar migración
echo "🔧 Ejecutando ALTER TABLE..."
docker exec parroquia-postgres-1 psql -U parroquia_user -d parroquia_db -c "
ALTER TABLE personas ADD COLUMN IF NOT EXISTS solicitud_comunion_casa BOOLEAN DEFAULT false;
"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migración aplicada exitosamente"
    echo ""
    echo "🔍 Verificando columna..."
    docker exec parroquia-postgres-1 psql -U parroquia_user -d parroquia_db -c "
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'personas' AND column_name = 'solicitud_comunion_casa';
    "
else
    echo ""
    echo "❌ Error al aplicar migración"
    exit 1
fi
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "✅ Proceso completado exitosamente"
    echo "================================================"
else
    echo ""
    echo "================================================"
    echo "❌ Error durante la ejecución"
    echo "================================================"
    exit 1
fi

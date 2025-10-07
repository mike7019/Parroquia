#!/bin/bash

# Script para deployar el fix de salud en el servidor remoto
# Servidor: 206.62.139.11
# Usuario: ubuntu

echo "🚀 Iniciando deployment del fix de salud en servidor remoto..."
echo ""

# Configuración
SERVER="ubuntu@206.62.139.11"
PROJECT_PATH="/home/ubuntu/Parroquia"  # Ajusta esta ruta según tu servidor

echo "📡 Conectando a servidor remoto: $SERVER"
echo "📁 Ruta del proyecto: $PROJECT_PATH"
echo ""

# Ejecutar comandos en el servidor remoto
ssh $SERVER << 'ENDSSH'

# Navegar al directorio del proyecto
cd /home/ubuntu/Parroquia

echo "📦 Estado actual del repositorio:"
git status
echo ""

echo "🔄 Haciendo pull de los cambios desde develop..."
git checkout develop
git pull origin develop
echo ""

echo "📋 Últimos commits:"
git log --oneline -5
echo ""

echo "🔄 Reiniciando la aplicación..."
# Si usas PM2
if command -v pm2 &> /dev/null; then
    pm2 restart parroquia-api || pm2 restart all
    echo "✅ Aplicación reiniciada con PM2"
# Si usas Docker
elif [ -f docker-compose.yml ]; then
    docker-compose restart api
    echo "✅ Contenedor API reiniciado"
# Si usas systemd
elif systemctl is-active --quiet parroquia; then
    sudo systemctl restart parroquia
    echo "✅ Servicio systemd reiniciado"
else
    echo "⚠️  No se detectó PM2, Docker ni systemd. Reinicia manualmente."
fi
echo ""

echo "⏳ Esperando 5 segundos para que la aplicación inicie..."
sleep 5
echo ""

echo "🧪 Ejecutando script de migración de parroquias..."
node scripts/migrar-parroquia-personas.cjs
echo ""

echo "✅ Deployment completado!"
echo ""
echo "🔍 Verificar el servicio:"
echo "   curl http://localhost:3000/api/health"
echo ""

ENDSSH

echo "✅ Deployment remoto completado!"
echo ""
echo "🧪 Para probar el endpoint desde tu máquina local:"
echo "   curl http://206.62.139.11:3000/api/personas/salud/parroquia/1 -H 'Authorization: Bearer <token>'"

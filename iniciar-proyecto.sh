#!/bin/bash

# Script para iniciar el proyecto Parroquia con variables de entorno desde .bashrc

echo "🚀 INICIANDO PROYECTO PARROQUIA"
echo "==============================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: No se encuentra docker-compose.yml"
    echo "Ejecute este script desde el directorio raíz del proyecto"
    exit 1
fi

# Cargar variables de entorno
echo "📋 Cargando variables de entorno..."
if [ -f ~/.bashrc ]; then
    source ~/.bashrc
    echo "✅ Variables cargadas desde ~/.bashrc"
else
    echo "⚠️  Archivo ~/.bashrc no encontrado"
fi

# Verificar variables críticas
echo ""
echo "🔍 Verificando variables críticas..."

missing_vars=false

if [ -z "$DB_PASSWORD" ] && [ -z "$POSTGRES_PASSWORD" ]; then
    echo "❌ DB_PASSWORD o POSTGRES_PASSWORD no configurada"
    missing_vars=true
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET no configurada"
    missing_vars=true
fi

if [ "$missing_vars" = true ]; then
    echo ""
    echo "❌ Variables críticas faltantes. Configure las variables en ~/.bashrc"
    echo "Ver: bashrc-variables-ejemplo.sh"
    exit 1
fi

echo "✅ Variables críticas configuradas"

# Mostrar configuración que se usará
echo ""
echo "📊 Configuración que se usará:"
echo "------------------------------"
echo "Base de datos: ${DB_NAME:-${POSTGRES_DB:-parroquia_db}}"
echo "Usuario DB: ${DB_USER:-${POSTGRES_USER:-parroquia_user}}"
echo "Puerto: ${PORT:-3000}"
echo "Entorno: ${NODE_ENV:-production}"

# Detener servicios existentes
echo ""
echo "🛑 Deteniendo servicios existentes..."
docker-compose down

# Construir e iniciar servicios
echo ""
echo "🔨 Construyendo e iniciando servicios..."
docker-compose up -d --build

# Esperar a que los servicios estén listos
echo ""
echo "⏳ Esperando que los servicios estén listos..."
sleep 10

# Verificar estado de los servicios
echo ""
echo "📊 Estado de los servicios:"
docker-compose ps

# Verificar conectividad
echo ""
echo "🔗 Verificando conectividad..."

# Esperar a que la API esté lista
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:${PORT:-3000}/api/health > /dev/null 2>&1; then
        echo "✅ API está respondiendo"
        break
    else
        echo "⏳ Intento $attempt/$max_attempts - Esperando que la API esté lista..."
        sleep 2
        attempt=$((attempt + 1))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ La API no respondió después de $max_attempts intentos"
    echo ""
    echo "🔍 Logs de la API:"
    docker-compose logs api
    exit 1
fi

# Mostrar información final
echo ""
echo "🎉 PROYECTO INICIADO EXITOSAMENTE"
echo "================================="
echo ""
echo "🔗 URLs disponibles:"
echo "• API Health: http://localhost:${PORT:-3000}/api/health"
echo "• Swagger Docs: http://localhost:${PORT:-3000}/api/docs"
echo "• API Base: http://localhost:${PORT:-3000}/api"
echo ""
echo "📋 Comandos útiles:"
echo "• Ver logs: docker-compose logs -f"
echo "• Ver logs API: docker-compose logs -f api"
echo "• Ver logs DB: docker-compose logs -f postgres"
echo "• Detener: docker-compose down"
echo "• Reiniciar: docker-compose restart"
echo ""
echo "🔧 Para troubleshooting:"
echo "• Verificar variables: ./verificar-variables.sh"
echo "• Conectar a DB: docker-compose exec postgres psql -U ${DB_USER:-${POSTGRES_USER:-parroquia_user}} -d ${DB_NAME:-${POSTGRES_DB:-parroquia_db}}"

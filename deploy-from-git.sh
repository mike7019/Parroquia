#!/bin/bash

# Script de despliegue automático desde repositorio Git
# Para usar en servidor Linux

set -e  # Salir si algún comando falla

PROJECT_NAME="parroquia-api"
REPO_URL="https://github.com/mike7019/Parroquia.git"
PROJECT_DIR="/opt/$PROJECT_NAME"
BRANCH="develop"

# Detectar si estamos ejecutando como root
if [ "$EUID" -eq 0 ]; then
    SUDO=""
else
    SUDO="sudo"
fi

echo "🚀 Iniciando despliegue automático de $PROJECT_NAME..."
echo "📅 $(date)"

# Función para logging
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

# Crear directorio del proyecto si no existe
if [ ! -d "$PROJECT_DIR" ]; then
    log "📁 Creando directorio del proyecto..."
    $SUDO mkdir -p "$PROJECT_DIR"
    if [ "$EUID" -ne 0 ]; then
        $SUDO chown $USER:$USER "$PROJECT_DIR"
    fi
fi

cd "$PROJECT_DIR"

# Si el repositorio ya existe, hacer pull, sino clonar
if [ -d ".git" ]; then
    log "🔄 Actualizando repositorio existente..."
    git fetch origin
    git reset --hard origin/$BRANCH
    git clean -fd
else
    log "📥 Clonando repositorio..."
    git clone "$REPO_URL" .
    git checkout "$BRANCH"
fi

log "📋 Commit actual: $(git rev-parse --short HEAD)"
log "📋 Último commit: $(git log -1 --pretty=format:'%h - %s (%an, %ar)')"

# Detener contenedores existentes
log "🛑 Deteniendo contenedores existentes..."
docker-compose down --remove-orphans || true

# Limpiar imágenes antiguas (opcional, comentar si quieres conservar cache)
log "🧹 Limpiando imágenes antiguas..."
docker image prune -f

# Construir e iniciar
log "🔨 Construyendo nueva imagen..."
docker-compose build --no-cache

log "▶️ Iniciando aplicación..."
docker-compose up -d

# Esperar a que el servicio esté listo
log "⏳ Esperando a que el servicio esté listo..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if curl -f http://localhost:8080 >/dev/null 2>&1; then
        log "✅ Servicio está funcionando correctamente"
        break
    fi
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    log "❌ El servicio no respondió en $timeout segundos"
    log "📊 Mostrando logs del contenedor:"
    docker-compose logs --tail=50
    exit 1
fi

# Verificar estado final
log "📊 Estado de los contenedores:"
docker-compose ps

log "🎉 ¡Despliegue completado exitosamente!"
log "🌐 Aplicación disponible en: http://$(hostname -I | awk '{print $1}'):8080"
log "🌐 También disponible en: http://localhost:8080"

# Mostrar información útil
echo ""
echo "=== INFORMACIÓN DEL DESPLIEGUE ==="
echo "📍 Directorio: $PROJECT_DIR"
echo "🌿 Rama: $BRANCH"
echo "📦 Contenedor: iglesia-survey"
echo "🔗 Puerto: 8080"
echo ""
echo "=== COMANDOS ÚTILES ==="
echo "📊 Ver logs en tiempo real: docker-compose logs -f"
echo "🔄 Reiniciar aplicación: docker-compose restart"
echo "🛑 Detener aplicación: docker-compose down"
echo "🔍 Ver estado: docker-compose ps"
#!/bin/bash
echo "🔍 Limpiando Dokploy de Docker..."

# 1. Detener y eliminar contenedores relacionados
echo "🛑 Deteniendo contenedores Dokploy..."
docker ps -a --filter "name=dokploy" -q | xargs -r docker stop
docker ps -a --filter "name=dokploy" -q | xargs -r docker rm

# 2. Eliminar imágenes relacionadas
echo "🗑️ Eliminando imágenes Dokploy..."
docker images --format "{{.Repository}}:{{.Tag}} {{.ID}}" | grep dokploy | awk '{print $2}' | xargs -r docker rmi -f

# 3. Eliminar volúmenes relacionados
echo "🧹 Eliminando volúmenes Dokploy..."
docker volume ls -q | grep dokploy | xargs -r docker volume rm -f

# 4. Eliminar redes relacionadas
echo "🌐 Eliminando redes Dokploy..."
docker network ls -q | grep dokploy | xargs -r docker network rm

# 5. Revisar si Traefik de Dokploy quedó activo
echo "🛑 Buscando contenedor Traefik..."
docker ps -a --filter "name=traefik" -q | xargs -r docker stop
docker ps -a --filter "name=traefik" -q | xargs -r docker rm

# 6. Eliminar imagen de Traefik (opcional)
echo "🗑️ Eliminando imagen Traefik usada por Dokploy..."
docker images | grep traefik | awk '{print $3}' | xargs -r docker rmi -f

# 7. Limpieza final de recursos huérfanos
echo "🧽 Ejecutando prune final..."
docker system prune -af --volumes

echo "✅ Dokploy eliminado completamente."

#!/bin/bash

# Script de diagnóstico para el servidor de producción
echo "=== DIAGNÓSTICO DEL SERVIDOR PARROQUIA API ==="
echo "Fecha: $(date)"
echo ""

echo "1. VERIFICANDO DOCKER..."
if command -v docker &> /dev/null; then
    echo "✓ Docker está instalado"
    docker --version
    
    if docker info &> /dev/null; then
        echo "✓ Docker está ejecutándose"
    else
        echo "✗ Docker no está ejecutándose"
        echo "  Ejecuta: sudo systemctl start docker"
    fi
else
    echo "✗ Docker no está instalado"
fi

echo ""
echo "2. VERIFICANDO DOCKER COMPOSE..."
if command -v docker-compose &> /dev/null; then
    echo "✓ Docker Compose está instalado"
    docker-compose --version
else
    echo "✗ Docker Compose no está instalado"
fi

echo ""
echo "3. ESTADO DE LOS CONTENEDORES..."
if [ -f "docker-compose.prod.yml" ]; then
    echo "Contenedores activos:"
    docker-compose -f docker-compose.prod.yml ps
    echo ""
    
    echo "Contenedores en ejecución:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "✗ Archivo docker-compose.prod.yml no encontrado"
fi

echo ""
echo "4. VERIFICANDO PUERTOS..."
echo "Puertos en uso:"
if command -v netstat &> /dev/null; then
    netstat -tulpn | grep -E ":(80|443|3000|5432)" || echo "No hay puertos web en uso"
elif command -v ss &> /dev/null; then
    ss -tulpn | grep -E ":(80|443|3000|5432)" || echo "No hay puertos web en uso"
else
    echo "netstat/ss no disponible"
fi

echo ""
echo "5. VERIFICANDO NGINX DEL SISTEMA..."
if systemctl is-active --quiet nginx; then
    echo "⚠️  Nginx del sistema está ACTIVO (puede causar conflictos)"
    echo "   Ejecuta: sudo systemctl stop nginx"
else
    echo "✓ Nginx del sistema está detenido"
fi

echo ""
echo "6. VERIFICANDO FIREWALL..."
if command -v ufw &> /dev/null; then
    echo "Estado de UFW:"
    sudo ufw status
elif command -v firewall-cmd &> /dev/null; then
    echo "Estado de firewalld:"
    sudo firewall-cmd --list-ports
else
    echo "No se detectó firewall configurado"
fi

echo ""
echo "7. LOGS RECIENTES DE LA API..."
if [ -f "docker-compose.prod.yml" ]; then
    echo "Últimas 10 líneas de logs de la API:"
    docker-compose -f docker-compose.prod.yml logs --tail=10 api 2>/dev/null || echo "No hay logs disponibles"
fi

echo ""
echo "8. PRUEBA DE CONECTIVIDAD LOCAL..."
echo "Probando conexión local al puerto 3000:"
if command -v curl &> /dev/null; then
    curl -s -o /dev/null -w "Estado: %{http_code}\n" http://localhost:3000/api/health || echo "No se puede conectar localmente"
else
    echo "curl no disponible"
fi

echo ""
echo "9. ESPACIO EN DISCO..."
df -h /

echo ""
echo "10. MEMORIA Y CPU..."
free -h
echo "Carga del sistema: $(uptime | awk -F'load average:' '{print $2}')"

echo ""
echo "=== FIN DEL DIAGNÓSTICO ==="
echo ""
echo "PASOS RECOMENDADOS:"
echo "1. Si Docker no está ejecutándose: sudo systemctl start docker"
echo "2. Si Nginx del sistema está activo: sudo systemctl stop nginx"
echo "3. Si los contenedores no están corriendo: ./deploy-production.sh deploy"
echo "4. Si hay problemas de firewall: configurar puertos 80, 443, 3000"
echo "5. Verificar logs con: docker-compose -f docker-compose.prod.yml logs -f"

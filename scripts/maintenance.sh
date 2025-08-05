#!/bin/bash
# Script de mantenimiento regular del proyecto
# Uso: ./scripts/maintenance.sh [--deep]

echo "🔧 MANTENIMIENTO DEL PROYECTO PARROQUIA"
echo "======================================"

DEEP_CLEAN=${1:-""}

# Función para mostrar tamaño de directorio
show_size() {
    if [ -d "$1" ]; then
        size=$(du -sh "$1" 2>/dev/null | cut -f1)
        echo "  📊 $1: $size"
    fi
}

# Verificar estado actual
echo "📋 Estado actual del proyecto:"
show_size "node_modules"
show_size "logs"
show_size "backups"
show_size ".git"

# Limpieza básica
echo ""
echo "🧹 Limpieza básica..."

# Limpiar logs antiguos (más de 7 días)
if [ -d "logs" ]; then
    find logs/ -name "*.log" -mtime +7 -delete 2>/dev/null || true
    echo "  ✅ Logs antiguos eliminados"
fi

# Limpiar archivos temporales
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true

echo "  ✅ Archivos temporales eliminados"

# Limpieza profunda (opcional)
if [ "$DEEP_CLEAN" = "--deep" ]; then
    echo ""
    echo "🚀 Limpieza profunda activada..."
    
    # Limpiar node_modules y reinstalar
    if [ -d "node_modules" ]; then
        echo "  🔄 Limpiando node_modules..."
        rm -rf node_modules
        npm install
        echo "  ✅ node_modules recreado"
    fi
    
    # Limpiar backups antiguos (más de 30 días)
    if [ -d "backups" ]; then
        find backups/ -name "*.sql" -mtime +30 -delete 2>/dev/null || true
        echo "  ✅ Backups antiguos eliminados"
    fi
fi

# Verificar estructura de directorios
echo ""
echo "📁 Verificando estructura de directorios..."

required_dirs=(
    "scripts/database"
    "scripts/deployment" 
    "scripts/utilities"
    "scripts/tests"
    "logs"
    "backups"
)

for dir in "${required_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "  ✅ Directorio $dir creado"
    fi
done

# Verificar permisos de scripts
echo ""
echo "🔐 Verificando permisos de scripts..."
find scripts/ -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
echo "  ✅ Permisos de scripts configurados"

# Mostrar estado final
echo ""
echo "📊 Estado después del mantenimiento:"
show_size "node_modules"
show_size "logs"
show_size "backups"

echo ""
echo "✅ Mantenimiento completado"
echo ""
echo "💡 Consejos:"
echo "  • Ejecuta este script semanalmente"
echo "  • Usa --deep una vez al mes"
echo "  • Mantén backups regulares de la BD"

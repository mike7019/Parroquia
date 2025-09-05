#!/bin/bash
# Verificador de Variables de Entorno para Migración

echo "🔍 VERIFICANDO VARIABLES DE ENTORNO PARA MIGRACIÓN"
echo "=================================================="
echo ""

# Función para verificar variable
check_var() {
    local var_name=$1
    local alt_name=$2
    local description=$3
    
    local value="${!var_name}"
    local alt_value="${!alt_name}"
    
    if [ -n "$value" ]; then
        echo "✅ $var_name: configurada"
        echo "   Valor: $value"
    elif [ -n "$alt_value" ]; then
        echo "✅ $alt_name: configurada (alternativa)"
        echo "   Valor: $alt_value"
    else
        echo "❌ $var_name o $alt_name: NO configurada"
        echo "   Descripción: $description"
        return 1
    fi
    echo ""
    return 0
}

# Verificar variables principales
echo "📋 Variables de Base de Datos:"
echo "------------------------------"

all_ok=true

check_var "DB_HOST" "REMOTE_DB_HOST" "Dirección del servidor (ej: 206.62.139.100)" || all_ok=false
check_var "DB_PORT" "REMOTE_DB_PORT" "Puerto de PostgreSQL (ej: 5432)" || all_ok=false  
check_var "DB_NAME" "REMOTE_DB_NAME" "Nombre de la base de datos (ej: parroquia_db)" || all_ok=false
check_var "DB_USER" "REMOTE_DB_USER" "Usuario de la base de datos (ej: parroquia_user)" || all_ok=false
check_var "DB_PASSWORD" "REMOTE_DB_PASSWORD" "Contraseña de la base de datos" || all_ok=false

echo "🔗 Configuración que se usará:"
echo "------------------------------"
echo "Host: ${DB_HOST:-${REMOTE_DB_HOST:-'206.62.139.100 (default)'}}"
echo "Puerto: ${DB_PORT:-${REMOTE_DB_PORT:-'5432 (default)'}}"
echo "Base de datos: ${DB_NAME:-${REMOTE_DB_NAME:-'parroquia_db (default)'}}"
echo "Usuario: ${DB_USER:-${REMOTE_DB_USER:-'parroquia_user (default)'}}"
echo "Password: $(if [ -n "${DB_PASSWORD:-$REMOTE_DB_PASSWORD}" ]; then echo 'Configurada ✅'; else echo 'NO configurada ❌'; fi)"
echo ""

# Resultado final
if [ "$all_ok" = true ]; then
    echo "🎉 TODAS LAS VARIABLES ESTÁN CONFIGURADAS"
    echo "✅ Listo para ejecutar la migración"
    echo ""
    echo "📋 Comandos siguientes:"
    echo "1. node verificar-antes-migracion.js"
    echo "2. node migrar-cambios-produccion.js"
else
    echo "⚠️  FALTAN VARIABLES POR CONFIGURAR"
    echo "❌ Configure las variables faltantes en .bashrc"
    echo ""
    echo "📝 Ejemplo para .bashrc:"
    echo "export DB_HOST=206.62.139.100"
    echo "export DB_PORT=5432"
    echo "export DB_NAME=parroquia_db"
    echo "export DB_USER=parroquia_user"
    echo "export DB_PASSWORD=tu_password_aqui"
    echo ""
    echo "Luego ejecute: source ~/.bashrc"
fi

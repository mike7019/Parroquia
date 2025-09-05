#!/bin/bash

# Script para verificar que todas las variables de entorno están configuradas correctamente

echo "🔍 VERIFICACIÓN DE VARIABLES DE ENTORNO"
echo "======================================="
echo ""

# Función para verificar variable
check_var() {
    local var_name=$1
    local description=$2
    local required=${3:-true}
    
    local value="${!var_name}"
    
    if [ -n "$value" ]; then
        echo "✅ $var_name: configurada"
        if [ "$var_name" = "DB_PASSWORD" ] || [ "$var_name" = "JWT_SECRET" ] || [ "$var_name" = "SMTP_PASS" ]; then
            echo "   Valor: [OCULTO POR SEGURIDAD]"
        else
            echo "   Valor: $value"
        fi
    else
        if [ "$required" = true ]; then
            echo "❌ $var_name: NO configurada (requerida)"
            echo "   Descripción: $description"
            return 1
        else
            echo "⚠️  $var_name: NO configurada (opcional)"
            echo "   Descripción: $description"
        fi
    fi
    echo ""
    return 0
}

echo "📋 Variables de Base de Datos:"
echo "------------------------------"
all_ok=true

check_var "DB_HOST" "Host de la base de datos local" || all_ok=false
check_var "DB_PORT" "Puerto de la base de datos local" || all_ok=false
check_var "DB_NAME" "Nombre de la base de datos" || all_ok=false
check_var "DB_USER" "Usuario de la base de datos" || all_ok=false
check_var "DB_PASSWORD" "Contraseña de la base de datos" || all_ok=false

echo "🔐 Variables de Autenticación:"
echo "------------------------------"
check_var "JWT_SECRET" "Secreto para tokens JWT (mínimo 32 caracteres)" || all_ok=false
check_var "JWT_REFRESH_SECRET" "Secreto para tokens de refresh (mínimo 32 caracteres)" || all_ok=false

echo "🌐 Variables de Aplicación:"
echo "-----------------------------"
check_var "NODE_ENV" "Entorno de ejecución" false
check_var "PORT" "Puerto de la aplicación" false
check_var "API_URL" "URL base de la API" false

echo "📧 Variables de Email:"
echo "----------------------"
check_var "SMTP_HOST" "Servidor SMTP" false
check_var "SMTP_PORT" "Puerto SMTP" false
check_var "SMTP_USER" "Usuario SMTP" false
check_var "SMTP_PASS" "Contraseña SMTP" false

echo "🚀 Variables de Producción:"
echo "----------------------------"
check_var "REMOTE_DB_HOST" "Host de la base de datos remota" false
check_var "REMOTE_DB_PORT" "Puerto de la base de datos remota" false
check_var "REMOTE_DB_NAME" "Nombre de la base de datos remota" false
check_var "REMOTE_DB_USER" "Usuario de la base de datos remota" false
check_var "REMOTE_DB_PASSWORD" "Contraseña de la base de datos remota" false

echo "🏁 RESULTADO FINAL:"
echo "==================="

if [ "$all_ok" = true ]; then
    echo "✅ TODAS LAS VARIABLES REQUERIDAS ESTÁN CONFIGURADAS"
    echo ""
    echo "📋 Comandos para probar:"
    echo "1. docker-compose up -d"
    echo "2. docker-compose logs -f"
    echo "3. curl http://localhost:$PORT/api/health"
    echo ""
    echo "🔗 URLs importantes:"
    echo "• API: http://localhost:${PORT:-3000}"
    echo "• Swagger: http://localhost:${PORT:-3000}/api/docs"
    echo "• Base de datos: localhost:${DB_PORT:-5432}"
else
    echo "❌ FALTAN VARIABLES REQUERIDAS"
    echo ""
    echo "🔧 Pasos para corregir:"
    echo "1. Editar ~/.bashrc"
    echo "2. Agregar las variables faltantes"
    echo "3. Ejecutar: source ~/.bashrc"
    echo "4. Ejecutar este script nuevamente"
    echo ""
    echo "📝 Ejemplo de variables en bashrc-variables-ejemplo.sh"
fi

echo ""
echo "💡 Para cargar las variables:"
echo "source ~/.bashrc"

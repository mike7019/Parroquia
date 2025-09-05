#!/bin/bash

# Script para hacer backup de la base de datos antes del cleanup

echo "💾 CREACIÓN DE BACKUP ANTES DE CLEANUP"
echo "======================================"
echo ""

# Variables de configuración
DB_HOST=${DB_HOST:-${REMOTE_DB_HOST:-"206.62.139.100"}}
DB_PORT=${DB_PORT:-${REMOTE_DB_PORT:-"5432"}}
DB_NAME=${DB_NAME:-${REMOTE_DB_NAME:-"parroquia_db"}}
DB_USER=${DB_USER:-${REMOTE_DB_USER:-"parroquia_user"}}

# Generar nombre de backup con timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_cleanup_${TIMESTAMP}.sql"

echo "📋 Configuración del backup:"
echo "Host: $DB_HOST"
echo "Puerto: $DB_PORT"
echo "Base de datos: $DB_NAME"
echo "Usuario: $DB_USER"
echo "Archivo de backup: $BACKUP_FILE"
echo ""

# Verificar si pg_dump está disponible
if ! command -v pg_dump &> /dev/null; then
    echo "❌ pg_dump no está disponible en este sistema"
    echo ""
    echo "🔧 OPCIONES:"
    echo "1. Instalar PostgreSQL client:"
    echo "   sudo apt-get install postgresql-client"
    echo ""
    echo "2. O ejecutar desde el servidor de producción:"
    echo "   ssh usuario@$DB_HOST"
    echo "   pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_FILE"
    echo ""
    exit 1
fi

# Verificar conectividad
echo "🔗 Verificando conectividad..."
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" &> /dev/null; then
    echo "⚠️  No se pudo conectar directamente a la base de datos"
    echo ""
    echo "💡 EJECUTAR DESDE EL SERVIDOR DE PRODUCCIÓN:"
    echo "ssh usuario@$DB_HOST"
    echo "pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_FILE"
    echo ""
    echo "📋 Después del backup, ejecute:"
    echo "node cleanup-sincronizar-produccion.js"
    echo ""
    exit 1
fi

# Crear backup
echo "💾 Creando backup..."
echo "⏳ Este proceso puede tomar varios minutos..."

if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"; then
    echo "✅ Backup creado exitosamente: $BACKUP_FILE"
    
    # Verificar tamaño del archivo
    if [ -f "$BACKUP_FILE" ]; then
        SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        echo "📊 Tamaño del backup: $SIZE"
        
        # Verificar que no esté vacío
        if [ -s "$BACKUP_FILE" ]; then
            echo "✅ Backup verificado - contiene datos"
            echo ""
            echo "🎉 BACKUP COMPLETADO"
            echo "==================="
            echo "Archivo: $BACKUP_FILE"
            echo "Tamaño: $SIZE"
            echo ""
            echo "📋 SIGUIENTES PASOS:"
            echo "1. Verificar que el backup se creó correctamente"
            echo "2. Ejecutar: node cleanup-sincronizar-produccion.js"
            echo "3. En caso de problemas, restaurar con:"
            echo "   psql -h $DB_HOST -U $DB_USER -d $DB_NAME < $BACKUP_FILE"
        else
            echo "❌ El archivo de backup está vacío"
            rm -f "$BACKUP_FILE"
            exit 1
        fi
    else
        echo "❌ El archivo de backup no se creó"
        exit 1
    fi
else
    echo "❌ Error creando el backup"
    echo ""
    echo "🔧 POSIBLES SOLUCIONES:"
    echo "1. Verificar las credenciales de la base de datos"
    echo "2. Verificar la conectividad de red"
    echo "3. Ejecutar el backup desde el servidor de producción"
    exit 1
fi

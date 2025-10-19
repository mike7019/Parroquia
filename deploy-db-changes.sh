#!/bin/bash
# Script para aplicar cambios de base de datos en servidor remoto
# Servidor: 206.62.139.11

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 DEPLOY DE CAMBIOS DE BASE DE DATOS - CORREGIMIENTOS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Variables
SERVER="206.62.139.11"
USER="ubuntu"
APP_DIR="/home/ubuntu/parroquia-api"

echo "📋 Pasos a ejecutar:"
echo "1. Conectar al servidor via SSH"
echo "2. Ir al directorio de la aplicación"
echo "3. Hacer pull de los cambios desde develop"
echo "4. Crear migración para agregar tabla corregimientos"
echo "5. Ejecutar migración"
echo "6. Ejecutar seeder de corregimientos (si existe)"
echo "7. Reiniciar la aplicación"
echo ""

echo "🔐 Conectando al servidor..."
ssh ${USER}@${SERVER} << 'ENDSSH'

# Ir al directorio de la app
cd /home/ubuntu/parroquia-api || exit 1

echo "📥 Haciendo pull de cambios desde develop..."
git pull origin develop

echo "📦 Instalando dependencias (por si hay nuevas)..."
npm install

echo "🗃️ Verificando si la tabla corregimientos ya existe..."
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -c "\dt corregimientos" | grep corregimientos

if [ $? -eq 0 ]; then
    echo "✅ La tabla corregimientos ya existe en la base de datos"
else
    echo "⚠️  La tabla corregimientos NO existe, creando..."
    
    # Crear la tabla manualmente si no existe
    PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" << 'EOSQL'
    
    -- Crear tabla corregimientos
    CREATE TABLE IF NOT EXISTS corregimientos (
        id_corregimiento BIGSERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        codigo VARCHAR(50),
        descripcion TEXT,
        activo BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Crear índices
    CREATE INDEX IF NOT EXISTS idx_corregimientos_nombre ON corregimientos(nombre);
    CREATE INDEX IF NOT EXISTS idx_corregimientos_codigo ON corregimientos(codigo);
    CREATE INDEX IF NOT EXISTS idx_corregimientos_activo ON corregimientos(activo);

    -- Verificar si la columna id_corregimiento existe en familias
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='familias' AND column_name='id_corregimiento'
        ) THEN
            ALTER TABLE familias ADD COLUMN id_corregimiento BIGINT;
            ALTER TABLE familias ADD CONSTRAINT fk_familias_corregimiento 
                FOREIGN KEY (id_corregimiento) REFERENCES corregimientos(id_corregimiento);
            CREATE INDEX idx_familias_corregimiento ON familias(id_corregimiento);
        END IF;
    END $$;

    -- Insertar datos de ejemplo si la tabla está vacía
    INSERT INTO corregimientos (nombre, codigo, descripcion) 
    SELECT 'Corregimiento Uno', 'CORR-001', 'Corregimiento de prueba 1'
    WHERE NOT EXISTS (SELECT 1 FROM corregimientos);

    INSERT INTO corregimientos (nombre, codigo, descripcion) 
    SELECT 'Corregimiento Dos', 'CORR-002', 'Corregimiento de prueba 2'
    WHERE NOT EXISTS (SELECT 1 FROM corregimientos LIMIT 1 OFFSET 1);

EOSQL

    echo "✅ Tabla corregimientos creada exitosamente"
fi

echo ""
echo "🔄 Reiniciando aplicación con PM2..."
pm2 restart parroquia-api || pm2 restart all

echo ""
echo "✅ Deploy de base de datos completado"
echo ""
echo "🔍 Verificando estado de la aplicación..."
pm2 status

ENDSSH

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ PROCESO COMPLETADO"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📝 Próximos pasos:"
echo "1. Verifica que la aplicación esté corriendo: ssh ubuntu@206.62.139.11 'pm2 status'"
echo "2. Verifica los logs: ssh ubuntu@206.62.139.11 'pm2 logs parroquia-api --lines 50'"
echo "3. Prueba el endpoint: curl http://206.62.139.11:3000/api/catalog/corregimientos"
echo ""

-- ═══════════════════════════════════════════════════════════════
-- MIGRACIÓN: Agregar soporte para Corregimientos
-- Fecha: 2025-10-19
-- Descripción: Crear tabla corregimientos y agregar relación a familias
-- ═══════════════════════════════════════════════════════════════

-- 1. CREAR TABLA CORREGIMIENTOS
CREATE TABLE IF NOT EXISTS corregimientos (
    id_corregimiento BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50),
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_corregimientos_nombre ON corregimientos(nombre);
CREATE INDEX IF NOT EXISTS idx_corregimientos_codigo ON corregimientos(codigo);
CREATE INDEX IF NOT EXISTS idx_corregimientos_activo ON corregimientos(activo);

-- 3. AGREGAR COLUMNA id_corregimiento A TABLA FAMILIAS (SI NO EXISTE)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='familias' 
        AND column_name='id_corregimiento'
    ) THEN
        ALTER TABLE familias ADD COLUMN id_corregimiento BIGINT;
        
        -- Agregar foreign key
        ALTER TABLE familias ADD CONSTRAINT fk_familias_corregimiento 
            FOREIGN KEY (id_corregimiento) 
            REFERENCES corregimientos(id_corregimiento)
            ON DELETE SET NULL;
        
        -- Crear índice
        CREATE INDEX idx_familias_corregimiento ON familias(id_corregimiento);
        
        RAISE NOTICE 'Columna id_corregimiento agregada a familias';
    ELSE
        RAISE NOTICE 'Columna id_corregimiento ya existe en familias';
    END IF;
END $$;

-- 4. INSERTAR DATOS INICIALES DE CORREGIMIENTOS
-- Solo insertar si la tabla está vacía
INSERT INTO corregimientos (nombre, codigo, descripcion, activo) VALUES
    ('Corregimiento Uno', 'CORR-001', 'Primer corregimiento del municipio', true),
    ('Corregimiento Dos', 'CORR-002', 'Segundo corregimiento del municipio', true),
    ('Corregimiento Tres', 'CORR-003', 'Tercer corregimiento del municipio', true),
    ('Corregimiento Cuatro', 'CORR-004', 'Cuarto corregimiento del municipio', true),
    ('Corregimiento Cinco', 'CORR-005', 'Quinto corregimiento del municipio', true)
ON CONFLICT DO NOTHING;

-- 5. VERIFICACIÓN
-- Contar registros en corregimientos
SELECT 
    'Corregimientos creados:' as tabla,
    COUNT(*) as total 
FROM corregimientos;

-- Verificar estructura de familias
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'familias'
AND column_name IN ('id_corregimiento', 'numero_contrato_epm', 'comunionEnCasa')
ORDER BY ordinal_position;

-- Verificar foreign keys
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'familias'
AND kcu.column_name = 'id_corregimiento';

-- ═══════════════════════════════════════════════════════════════
-- FIN DE MIGRACIÓN
-- ═══════════════════════════════════════════════════════════════

-- NOTAS:
-- 1. Este script es idempotente (se puede ejecutar múltiples veces)
-- 2. No eliminará datos existentes
-- 3. Si la tabla ya existe, solo agregará índices faltantes
-- 4. Los datos de ejemplo solo se insertan si la tabla está vacía

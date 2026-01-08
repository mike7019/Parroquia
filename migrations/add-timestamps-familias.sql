-- =====================================================
-- Migración: Agregar timestamps a tabla familias
-- Fecha: 2026-01-08
-- Descripción: Agregar columnas created_at y updated_at
-- =====================================================

-- Paso 1: Agregar columnas con valores por defecto
ALTER TABLE familias 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Paso 2: Actualizar registros existentes que tengan NULL
UPDATE familias 
SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
WHERE created_at IS NULL OR updated_at IS NULL;

-- Paso 3: Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_familias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Paso 4: Aplicar trigger a la tabla familias
DROP TRIGGER IF EXISTS trigger_update_familias_timestamp ON familias;
CREATE TRIGGER trigger_update_familias_timestamp
    BEFORE UPDATE ON familias
    FOR EACH ROW
    EXECUTE FUNCTION update_familias_updated_at();

-- Verificación
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'familias' 
  AND column_name IN ('created_at', 'updated_at')
ORDER BY column_name;

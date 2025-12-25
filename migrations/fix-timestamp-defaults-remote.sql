-- Migración para agregar DEFAULT a columnas timestamp en base de datos remota
-- Fecha: 2025-12-25
-- Descripción: Agregar DEFAULT CURRENT_TIMESTAMP a columnas createdAt/updatedAt que son NOT NULL

-- ============================================================================
-- TABLA: persona_destreza
-- Problema: createdAt y updatedAt son NOT NULL pero no tienen DEFAULT
-- ============================================================================

ALTER TABLE persona_destreza 
  ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE persona_destreza 
  ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

COMMENT ON COLUMN persona_destreza."createdAt" IS 'Fecha de creación del registro';
COMMENT ON COLUMN persona_destreza."updatedAt" IS 'Fecha de última actualización del registro';

-- ============================================================================
-- TABLA: persona_enfermedad  
-- Problema: created_at y updated_at son NOT NULL pero no tienen DEFAULT
-- ============================================================================

ALTER TABLE persona_enfermedad 
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE persona_enfermedad 
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

COMMENT ON COLUMN persona_enfermedad.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN persona_enfermedad.updated_at IS 'Fecha de última actualización del registro';

-- ============================================================================
-- Verificación
-- ============================================================================

-- Verificar persona_destreza
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'persona_destreza' 
  AND column_name IN ('createdAt', 'updatedAt');

-- Verificar persona_enfermedad
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'persona_enfermedad' 
  AND column_name IN ('created_at', 'updated_at');

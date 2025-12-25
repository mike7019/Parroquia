-- Migración para simplificar nombres en tabla personas
-- Fecha: 2025-12-25
-- Descripción: Eliminar columnas primer_nombre, segundo_nombre, primer_apellido, segundo_apellido
--              Dejar solo la columna 'nombres' con el nombre completo

-- ============================================================================
-- 1. Primero migrar datos existentes a 'nombres' (si no existe aún)
-- ============================================================================

-- Verificar si existe la columna nombres, si no, crearla
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'personas' AND column_name = 'nombres') THEN
        ALTER TABLE personas ADD COLUMN nombres VARCHAR(255);
    END IF;
END $$;

-- Migrar datos existentes: concatenar primer_nombre + segundo_nombre + primer_apellido + segundo_apellido
UPDATE personas 
SET nombres = TRIM(
    CONCAT_WS(' ', 
        NULLIF(primer_nombre, ''),
        NULLIF(segundo_nombre, ''),
        NULLIF(primer_apellido, ''),
        NULLIF(segundo_apellido, '')
    )
)
WHERE nombres IS NULL OR nombres = '';

-- ============================================================================
-- 2. Eliminar columnas antiguas
-- ============================================================================

ALTER TABLE personas DROP COLUMN IF EXISTS primer_nombre;
ALTER TABLE personas DROP COLUMN IF EXISTS segundo_nombre;
ALTER TABLE personas DROP COLUMN IF EXISTS primer_apellido;
ALTER TABLE personas DROP COLUMN IF EXISTS segundo_apellido;

-- ============================================================================
-- 3. Agregar comentario
-- ============================================================================

COMMENT ON COLUMN personas.nombres IS 'Nombre completo de la persona (nombres y apellidos)';

-- ============================================================================
-- Verificación
-- ============================================================================

SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'personas' 
  AND column_name IN ('nombres', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido')
ORDER BY column_name;

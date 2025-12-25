-- Migración para agregar columna nombres completos en tabla personas
-- Fecha: 2025-12-25
-- Descripción: Agregar columna 'nombres' para guardar nombre completo sin separar

-- Agregar columna nombres
ALTER TABLE personas ADD COLUMN IF NOT EXISTS nombres VARCHAR(200);

-- Comentario descriptivo
COMMENT ON COLUMN personas.nombres IS 'Nombre completo de la persona (sin separar en primer/segundo nombre y apellidos)';

-- Verificación
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'personas' AND column_name = 'nombres';

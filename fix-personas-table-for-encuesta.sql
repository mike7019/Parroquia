-- MIGRACIÓN SQL PARA CORREGIR TABLA PERSONAS PARA ENCUESTA
-- Fecha: 4 de Septiembre 2025
-- Objetivo: Agregar campos faltantes y corregir nullable en personas

-- 1. Modificar campos existentes para permitir NULL
ALTER TABLE personas 
  ALTER COLUMN telefono DROP NOT NULL,
  ALTER COLUMN correo_electronico DROP NOT NULL;

-- 2. Eliminar constraint unique en correo_electronico (conflicta con nulls)
ALTER TABLE personas DROP CONSTRAINT IF EXISTS personas_correo_electronico_key;

-- 3. Agregar nuevos campos para encuesta
ALTER TABLE personas 
  ADD COLUMN IF NOT EXISTS id_parentesco BIGINT NULL,
  ADD COLUMN IF NOT EXISTS id_comunidad_cultural BIGINT NULL,
  ADD COLUMN IF NOT EXISTS id_nivel_educativo BIGINT NULL,
  ADD COLUMN IF NOT EXISTS motivo_celebrar VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS dia_celebrar INTEGER NULL CHECK (dia_celebrar >= 1 AND dia_celebrar <= 31),
  ADD COLUMN IF NOT EXISTS mes_celebrar INTEGER NULL CHECK (mes_celebrar >= 1 AND mes_celebrar <= 12);

-- 4. Agregar foreign keys
ALTER TABLE personas 
  ADD CONSTRAINT IF NOT EXISTS fk_personas_parentesco 
    FOREIGN KEY (id_parentesco) REFERENCES parentescos(id_parentesco),
  ADD CONSTRAINT IF NOT EXISTS fk_personas_comunidad_cultural 
    FOREIGN KEY (id_comunidad_cultural) REFERENCES comunidades_culturales(id_comunidad_cultural),
  ADD CONSTRAINT IF NOT EXISTS fk_personas_nivel_educativo 
    FOREIGN KEY (id_nivel_educativo) REFERENCES niveles_educativos(id_niveles_educativos);

-- 5. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_personas_parentesco ON personas(id_parentesco);
CREATE INDEX IF NOT EXISTS idx_personas_comunidad_cultural ON personas(id_comunidad_cultural);
CREATE INDEX IF NOT EXISTS idx_personas_nivel_educativo ON personas(id_nivel_educativo);
CREATE INDEX IF NOT EXISTS idx_personas_celebracion ON personas(mes_celebrar, dia_celebrar);

-- 6. Verificar cambios aplicados
SELECT 'VERIFICACIÓN DE CAMBIOS APLICADOS:' as mensaje;

-- Verificar que campos fueron agregados
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'personas' 
  AND column_name IN (
    'telefono', 'correo_electronico', 'id_parentesco', 
    'id_comunidad_cultural', 'id_nivel_educativo', 
    'motivo_celebrar', 'dia_celebrar', 'mes_celebrar'
  )
ORDER BY ordinal_position;

-- Verificar foreign keys creadas
SELECT 
  constraint_name,
  column_name,
  foreign_table_name,
  foreign_column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.referential_constraints rc
  ON kcu.constraint_name = rc.constraint_name
WHERE kcu.table_name = 'personas'
  AND kcu.column_name IN ('id_parentesco', 'id_comunidad_cultural', 'id_nivel_educativo');

-- Verificar índices creados
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'personas' 
  AND indexname LIKE '%parentesco%' 
   OR indexname LIKE '%comunidad%' 
   OR indexname LIKE '%educativo%' 
   OR indexname LIKE '%celebracion%';

COMMIT;

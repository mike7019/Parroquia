-- Agregar columna solicitud_comunion_casa a tabla personas
-- Fecha: 2025-12-25
-- Descripción: Campo booleano para indicar si la persona solicita comunión en casa

ALTER TABLE personas 
ADD COLUMN IF NOT EXISTS solicitud_comunion_casa BOOLEAN DEFAULT false;

-- Actualizar índice si es necesario
COMMENT ON COLUMN personas.solicitud_comunion_casa IS 'Indica si la persona solicita que la comunión se realice en casa';

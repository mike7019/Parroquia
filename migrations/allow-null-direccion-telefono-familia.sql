-- Permitir valores NULL en dirección y teléfono de familias
-- Fecha: 2026-03-09
-- Descripción: Dirección y teléfono ahora son campos opcionales en encuestas

-- Permitir NULL en direccion_familia
ALTER TABLE familias 
ALTER COLUMN direccion_familia DROP NOT NULL;

-- Comentarios
COMMENT ON COLUMN familias.direccion_familia IS 'Dirección de la familia (opcional)';
COMMENT ON COLUMN familias.numero_contacto IS 'Número de contacto de la familia (opcional)';

-- Permitir valores NULL en el campo sector de familias
-- Fecha: 2026-03-22
-- Descripción: sector ahora es opcional en encuestas

ALTER TABLE familias 
ALTER COLUMN sector DROP NOT NULL;

COMMENT ON COLUMN familias.sector IS 'Sector de la familia (opcional)';

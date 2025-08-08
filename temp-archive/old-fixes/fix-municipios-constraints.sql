-- Migration to improve municipios table constraints
-- Execute this SQL to fix the identified issues

-- 1. Add UNIQUE constraint on codigo_dane
ALTER TABLE municipios 
ADD CONSTRAINT municipios_codigo_dane_unique 
UNIQUE (codigo_dane);

-- 2. Make codigo_dane NOT NULL (after ensuring no NULL values exist)
-- First, check for NULL values:
-- SELECT * FROM municipios WHERE codigo_dane IS NULL;

-- If no NULL values, make it NOT NULL:
ALTER TABLE municipios 
ALTER COLUMN codigo_dane SET NOT NULL;

-- 3. Add index on nombre_municipio for search performance
CREATE INDEX idx_municipios_nombre 
ON municipios (nombre_municipio);

-- 4. Add check constraint for codigo_dane format (optional)
ALTER TABLE municipios 
ADD CONSTRAINT municipios_codigo_dane_check 
CHECK (codigo_dane ~ '^[0-9]{5}$');

-- Verify the changes
SELECT 
    constraint_name, 
    constraint_type,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'municipios';

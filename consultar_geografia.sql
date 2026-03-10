-- Consulta para ver los últimos registros de familias con datos geográficos
SELECT 
    id_familia,
    apellido_familiar,
    id_municipio,
    id_vereda,
    id_sector,
    id_corregimiento,
    id_centro_poblado,
    created_at
FROM familias 
ORDER BY id_familia DESC 
LIMIT 10;

-- Consulta para ver registros con sector o vereda pero sin selección explícita
SELECT 
    id_familia,
    apellido_familiar,
    id_municipio,
    id_vereda,
    id_sector,
    id_parroquia,
    created_at
FROM familias 
WHERE id_vereda IS NOT NULL OR id_sector IS NOT NULL
ORDER BY id_familia DESC 
LIMIT 20;

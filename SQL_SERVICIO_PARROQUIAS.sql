-- =====================================================
-- SQL PARA SERVICIO DE PARROQUIAS
-- Base de datos: PostgreSQL
-- Servicio: Catálogo de Parroquias (CRUD completo)
-- =====================================================

-- 1. CONSULTA PRINCIPAL: Obtener todas las parroquias con información del municipio
-- Utilizada en: getAllParroquias()
SELECT 
    p.id_parroquia,
    p.nombre,
    p.id_municipio,
    m.nombre_municipio,
    m.codigo_dane as municipio_codigo_dane,
    d.id_departamento,
    d.nombre as departamento_nombre,
    d.codigo_dane as departamento_codigo_dane
FROM parroquia p
LEFT JOIN municipios m ON p.id_municipio = m.id_municipio
LEFT JOIN departamentos d ON m.id_departamento = d.id_departamento
ORDER BY p.id_parroquia ASC;

-- 2. CONSULTA POR ID: Obtener parroquia específica por ID
-- Utilizada en: getParroquiaById(id)
SELECT 
    p.id_parroquia,
    p.nombre,
    p.id_municipio,
    m.nombre_municipio,
    m.codigo_dane as municipio_codigo_dane,
    d.id_departamento,
    d.nombre as departamento_nombre,
    d.codigo_dane as departamento_codigo_dane
FROM parroquia p
LEFT JOIN municipios m ON p.id_municipio = m.id_municipio
LEFT JOIN departamentos d ON m.id_departamento = d.id_departamento
WHERE p.id_parroquia = $1;

-- 3. BÚSQUEDA POR NOMBRE: Buscar parroquias por nombre (LIKE insensible a mayúsculas)
-- Utilizada en: searchParroquias(searchTerm)
SELECT 
    p.id_parroquia,
    p.nombre,
    p.id_municipio,
    m.nombre_municipio,
    m.codigo_dane as municipio_codigo_dane
FROM parroquia p
LEFT JOIN municipios m ON p.id_municipio = m.id_municipio
WHERE p.nombre ILIKE '%' || $1 || '%'
ORDER BY p.nombre ASC
LIMIT 20;

-- 4. CONSULTA POR MUNICIPIO: Obtener todas las parroquias de un municipio específico
-- Utilizada en: getParroquiasByMunicipio(municipioId)
SELECT 
    p.id_parroquia,
    p.nombre,
    p.id_municipio,
    m.nombre_municipio,
    m.codigo_dane as municipio_codigo_dane
FROM parroquia p
LEFT JOIN municipios m ON p.id_municipio = m.id_municipio
WHERE p.id_municipio = $1
ORDER BY p.nombre ASC;

-- 5. ESTADÍSTICAS: Contar total de parroquias
-- Utilizada en: getParroquiaStatistics()
SELECT COUNT(*) as total_parroquias
FROM parroquia;

-- 6. VALIDACIÓN DE MUNICIPIO: Verificar que existe el municipio antes de crear/actualizar
-- Utilizada en: createParroquia() y updateParroquia()
SELECT id_municipio, nombre_municipio
FROM municipios
WHERE id_municipio = $1;

-- 7. VERIFICAR EXISTENCIA: Comprobar si ya existe una parroquia con el mismo nombre
-- Utilizada en: findOrCreateParroquia()
SELECT id_parroquia, nombre
FROM parroquia
WHERE nombre = $1;

-- 8. CREAR PARROQUIA: Insertar nueva parroquia
-- Utilizada en: createParroquia()
INSERT INTO parroquia (nombre, id_municipio)
VALUES ($1, $2)
RETURNING id_parroquia, nombre, id_municipio;

-- 9. ACTUALIZAR PARROQUIA: Modificar datos de parroquia existente
-- Utilizada en: updateParroquia()
UPDATE parroquia
SET nombre = $1, id_municipio = $2
WHERE id_parroquia = $3
RETURNING id_parroquia, nombre, id_municipio;

-- 10. ELIMINAR PARROQUIA: Borrar parroquia (verificando dependencias)
-- Utilizada en: deleteParroquia()
DELETE FROM parroquia
WHERE id_parroquia = $1;

-- 11. VERIFICAR DEPENDENCIAS: Comprobar si tiene personas asociadas antes de eliminar
-- Utilizada en: deleteParroquia() - validación
SELECT COUNT(*) as personas_count
FROM personas
WHERE id_parroquia = $1;

-- =====================================================
-- CONSULTAS COMPLEMENTARIAS PARA VALIDACIONES
-- =====================================================

-- 12. OBTENER PARROQUIAS CON ESTADÍSTICAS BÁSICAS
SELECT 
    p.id_parroquia,
    p.nombre,
    p.id_municipio,
    m.nombre_municipio,
    d.nombre as departamento_nombre,
    COUNT(per.id_personas) as total_personas
FROM parroquia p
LEFT JOIN municipios m ON p.id_municipio = m.id_municipio
LEFT JOIN departamentos d ON m.id_departamento = d.id_departamento
LEFT JOIN personas per ON p.id_parroquia = per.id_parroquia
GROUP BY p.id_parroquia, p.nombre, p.id_municipio, m.nombre_municipio, d.nombre
ORDER BY p.nombre ASC;

-- 13. CONSULTA PARA DROPDOWN/SELECCIÓN: Lista simplificada para formularios
SELECT 
    id_parroquia,
    nombre,
    id_municipio
FROM parroquia
ORDER BY nombre ASC;

-- =====================================================
-- NOTAS DE IMPLEMENTACIÓN:
-- =====================================================

/*
PARÁMETROS UTILIZADOS:
- $1, $2, $3: Parámetros de consulta preparada para seguridad
- ILIKE: Búsqueda insensible a mayúsculas (PostgreSQL)
- LEFT JOIN: Para incluir parroquias aunque no tengan municipio asignado
- RETURNING: Para obtener datos después de INSERT/UPDATE

ÍNDICES RECOMENDADOS:
- idx_parroquia_municipio: ON parroquia(id_municipio)
- idx_parroquia_nombre: ON parroquia(nombre)
- idx_personas_parroquia: ON personas(id_parroquia)

ESTRUCTURA DE TABLA ESPERADA:
CREATE TABLE parroquia (
    id_parroquia BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    id_municipio BIGINT NOT NULL REFERENCES municipios(id_municipio)
);

DEPENDENCIAS:
- Tabla municipios (con id_municipio, nombre_municipio, codigo_dane, id_departamento)
- Tabla departamentos (con id_departamento, nombre, codigo_dane)
- Tabla personas (con id_personas, id_parroquia) - opcional para validaciones
*/
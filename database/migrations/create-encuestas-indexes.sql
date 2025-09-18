-- Índices optimizados para el servicio de encuestas
-- Ejecutar después de crear las tablas principales

-- =====================================================
-- ÍNDICES PARA TABLA FAMILIAS
-- =====================================================

-- Índice compuesto para paginación cursor-based (más eficiente)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familias_cursor_pagination 
ON familias (fecha_ultima_encuesta DESC, id_familia DESC);

-- Índice para búsquedas por apellido familiar (muy común)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familias_apellido_familiar 
ON familias USING gin(apellido_familiar gin_trgm_ops);

-- Índice para búsquedas por sector
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familias_sector 
ON familias USING gin(sector gin_trgm_ops);

-- Índice compuesto para filtros geográficos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familias_geografia 
ON familias (id_municipio, id_parroquia, id_sector, id_vereda);

-- Índice para estado de encuesta
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familias_estado_encuesta 
ON familias (estado_encuesta);

-- Índice para búsqueda por teléfono (validaciones de duplicados)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familias_telefono 
ON familias (telefono) WHERE telefono IS NOT NULL;

-- Índice para búsqueda por email
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familias_email 
ON familias (email) WHERE email IS NOT NULL;

-- Índice de texto completo para búsquedas generales
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familias_fulltext 
ON familias USING gin(
  to_tsvector('spanish', 
    COALESCE(apellido_familiar, '') || ' ' ||
    COALESCE(sector, '') || ' ' ||
    COALESCE(direccion_familia, '')
  )
);

-- =====================================================
-- ÍNDICES PARA TABLA PERSONAS
-- =====================================================

-- Índice único para identificación (ya existe, pero asegurar)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_personas_identificacion_unique 
ON personas (identificacion);

-- Índice compuesto para obtener personas por familia (muy común)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_personas_familia_activas 
ON personas (id_familia_familias, id_personas) 
WHERE identificacion NOT LIKE 'FALLECIDO%';

-- Índice para búsquedas por nombre
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_personas_nombres 
ON personas USING gin(
  (primer_nombre || ' ' || COALESCE(segundo_nombre, '') || ' ' || 
   COALESCE(primer_apellido, '') || ' ' || COALESCE(segundo_apellido, '')) gin_trgm_ops
);

-- Índice para fechas de nacimiento (reportes por edad)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_personas_fecha_nacimiento 
ON personas (fecha_nacimiento);

-- Índice para sexo (estadísticas)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_personas_sexo 
ON personas (id_sexo) WHERE id_sexo IS NOT NULL;

-- Índice para tipo de identificación
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_personas_tipo_identificacion 
ON personas (id_tipo_identificacion_tipo_identificacion) 
WHERE id_tipo_identificacion_tipo_identificacion IS NOT NULL;

-- =====================================================
-- ÍNDICES PARA TABLA DIFUNTOS_FAMILIA
-- =====================================================

-- Índice para obtener difuntos por familia
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_difuntos_familia 
ON difuntos_familia (id_familia_familias, id_difunto);

-- Índice para fechas de fallecimiento (reportes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_difuntos_fecha_fallecimiento 
ON difuntos_familia (fecha_fallecimiento) WHERE fecha_fallecimiento IS NOT NULL;

-- Índice para parentesco (estadísticas)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_difuntos_parentesco 
ON difuntos_familia (id_parentesco) WHERE id_parentesco IS NOT NULL;

-- Índice de texto completo para nombres de difuntos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_difuntos_nombre_fulltext 
ON difuntos_familia USING gin(to_tsvector('spanish', nombre_completo));

-- =====================================================
-- ÍNDICES PARA TABLAS DE SERVICIOS
-- =====================================================

-- Familia - Disposición de Basura
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familia_disposicion_basura_familia 
ON familia_disposicion_basura (id_familia);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familia_disposicion_basura_tipo 
ON familia_disposicion_basura (id_tipo_disposicion_basura);

-- Familia - Sistema Acueducto
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familia_sistema_acueducto_familia 
ON familia_sistema_acueducto (id_familia);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familia_sistema_acueducto_sistema 
ON familia_sistema_acueducto (id_sistema_acueducto);

-- Familia - Aguas Residuales
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familia_aguas_residuales_familia 
ON familia_sistema_aguas_residuales (id_familia);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familia_aguas_residuales_tipo 
ON familia_sistema_aguas_residuales (id_tipo_aguas_residuales);

-- Familia - Tipo Vivienda
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familia_tipo_vivienda_familia 
ON familia_tipo_vivienda (id_familia);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_familia_tipo_vivienda_tipo 
ON familia_tipo_vivienda (id_tipo_vivienda);

-- =====================================================
-- ÍNDICES PARA TABLAS DE CATÁLOGOS
-- =====================================================

-- Municipios (para JOINs frecuentes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_municipios_nombre 
ON municipios USING gin(nombre_municipio gin_trgm_ops);

-- Parroquias
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_parroquias_nombre 
ON parroquias USING gin(nombre gin_trgm_ops);

-- Sectores
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sectores_nombre 
ON sectores USING gin(nombre gin_trgm_ops);

-- Veredas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_veredas_nombre 
ON veredas USING gin(nombre gin_trgm_ops);

-- =====================================================
-- ESTADÍSTICAS Y MANTENIMIENTO
-- =====================================================

-- Actualizar estadísticas de las tablas principales
ANALYZE familias;
ANALYZE personas;
ANALYZE difuntos_familia;
ANALYZE familia_disposicion_basura;
ANALYZE familia_sistema_acueducto;
ANALYZE familia_sistema_aguas_residuales;
ANALYZE familia_tipo_vivienda;

-- =====================================================
-- VISTAS MATERIALIZADAS PARA REPORTES
-- =====================================================

-- Vista materializada para estadísticas rápidas
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_encuestas_estadisticas AS
SELECT 
  COUNT(*) as total_familias,
  COUNT(CASE WHEN estado_encuesta = 'completada' THEN 1 END) as familias_completadas,
  AVG(tamaño_familia) as promedio_tamaño_familia,
  COUNT(DISTINCT id_municipio) as municipios_cubiertos,
  COUNT(DISTINCT id_parroquia) as parroquias_cubiertas,
  MAX(fecha_ultima_encuesta) as ultima_encuesta_fecha,
  MIN(fecha_ultima_encuesta) as primera_encuesta_fecha,
  DATE_TRUNC('month', fecha_ultima_encuesta) as mes_encuesta,
  COUNT(*) as encuestas_por_mes
FROM familias
GROUP BY DATE_TRUNC('month', fecha_ultima_encuesta);

-- Índice para la vista materializada
CREATE INDEX IF NOT EXISTS idx_mv_encuestas_estadisticas_mes 
ON mv_encuestas_estadisticas (mes_encuesta);

-- Vista materializada para estadísticas por municipio
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_encuestas_por_municipio AS
SELECT 
  m.id_municipio,
  m.nombre_municipio,
  COUNT(f.id_familia) as total_familias,
  COUNT(p.id_personas) as total_personas,
  COUNT(df.id_difunto) as total_difuntos,
  AVG(f.tamaño_familia) as promedio_tamaño_familia
FROM municipios m
LEFT JOIN familias f ON m.id_municipio = f.id_municipio
LEFT JOIN personas p ON f.id_familia = p.id_familia_familias 
  AND p.identificacion NOT LIKE 'FALLECIDO%'
LEFT JOIN difuntos_familia df ON f.id_familia = df.id_familia_familias
GROUP BY m.id_municipio, m.nombre_municipio;

-- Índice para la vista por municipio
CREATE INDEX IF NOT EXISTS idx_mv_encuestas_por_municipio_id 
ON mv_encuestas_por_municipio (id_municipio);

-- =====================================================
-- FUNCIONES DE MANTENIMIENTO
-- =====================================================

-- Función para refrescar vistas materializadas
CREATE OR REPLACE FUNCTION refresh_encuestas_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_encuestas_estadisticas;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_encuestas_por_municipio;
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON INDEX idx_familias_cursor_pagination IS 'Índice optimizado para paginación cursor-based en encuestas';
COMMENT ON INDEX idx_familias_fulltext IS 'Índice de texto completo para búsquedas generales en familias';
COMMENT ON MATERIALIZED VIEW mv_encuestas_estadisticas IS 'Vista materializada para estadísticas rápidas de encuestas';
COMMENT ON FUNCTION refresh_encuestas_materialized_views() IS 'Función para refrescar todas las vistas materializadas de encuestas';

-- Mensaje de finalización
SELECT 'Índices de encuestas creados exitosamente. Total de índices: ' || 
       (SELECT COUNT(*) FROM pg_indexes WHERE tablename IN ('familias', 'personas', 'difuntos_familia')) ||
       '. Vistas materializadas: 2' as resultado;
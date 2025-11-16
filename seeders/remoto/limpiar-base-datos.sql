-- ============================================================================
-- SCRIPT DE LIMPIEZA COMPLETA - PARROQUIA DB
-- ============================================================================
-- Servidor: 206.62.139.100:5433
-- Base de datos: parroquia_db
-- Fecha: 2025-11-15
-- Descripción: Limpia TODAS las tablas (catálogos y encuestas) y reinicia secuencias
-- ============================================================================
-- ⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos
-- ============================================================================

-- ============================================================================
-- SECCIÓN 1: LIMPIAR TABLAS DE ENCUESTAS
-- ============================================================================

-- Tablas intermedias de personas
TRUNCATE TABLE persona_habilidad RESTART IDENTITY CASCADE;
TRUNCATE TABLE persona_destreza RESTART IDENTITY CASCADE;
TRUNCATE TABLE persona_celebracion RESTART IDENTITY CASCADE;
TRUNCATE TABLE persona_enfermedad RESTART IDENTITY CASCADE;

-- Tablas intermedias de familias
TRUNCATE TABLE familia_disposicion_basuras RESTART IDENTITY CASCADE;
TRUNCATE TABLE familia_aguas_residuales RESTART IDENTITY CASCADE;

-- Tabla de difuntos
TRUNCATE TABLE difuntos_familia RESTART IDENTITY CASCADE;

-- Tabla de personas
TRUNCATE TABLE personas RESTART IDENTITY CASCADE;

-- Tabla de familias
TRUNCATE TABLE familias RESTART IDENTITY CASCADE;

-- ============================================================================
-- SECCIÓN 2: LIMPIAR CATÁLOGOS (Opcional)
-- ============================================================================
-- Descomentar las líneas siguientes si deseas también limpiar los catálogos

-- TRUNCATE TABLE destrezas RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE habilidades RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE enfermedades RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE profesiones RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE comunidades_culturales RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE niveles_educativos RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE parentescos RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE situaciones_civiles RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE estados_civiles RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE sexos RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE tipos_identificacion RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE tipos_disposicion_basura RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE tipos_aguas_residuales RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE sistemas_acueducto RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE tipos_vivienda RESTART IDENTITY CASCADE;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- Descomentar para verificar que las tablas están vacías

-- SELECT 'familias' as tabla, COUNT(*) as registros FROM familias
-- UNION ALL SELECT 'personas', COUNT(*) FROM personas
-- UNION ALL SELECT 'difuntos_familia', COUNT(*) FROM difuntos_familia
-- UNION ALL SELECT 'persona_celebracion', COUNT(*) FROM persona_celebracion
-- UNION ALL SELECT 'persona_enfermedad', COUNT(*) FROM persona_enfermedad
-- UNION ALL SELECT 'persona_habilidad', COUNT(*) FROM persona_habilidad
-- UNION ALL SELECT 'persona_destreza', COUNT(*) FROM persona_destreza
-- UNION ALL SELECT 'familia_disposicion_basuras', COUNT(*) FROM familia_disposicion_basuras
-- UNION ALL SELECT 'familia_aguas_residuales', COUNT(*) FROM familia_aguas_residuales;

-- ============================================================================
-- FIN DEL SCRIPT DE LIMPIEZA
-- ============================================================================

-- Script de corrección de catálogos faltantes para encuestas
-- Fecha: 2025-09-04
-- Basado en análisis MCP PostgreSQL del sistema parroquial
-- EJECUTAR ANTES DE REALIZAR PRUEBAS DE ENCUESTAS

-- ======================================
-- PROBLEMA CRÍTICO 1: Sexos incompletos
-- ======================================
-- Actualmente solo existe "Masculino" (ID: 1)
-- Agregar "Femenino" para completar opciones básicas

INSERT INTO sexos (nombre, codigo, descripcion, created_at, updated_at) 
VALUES ('Femenino', 'F', 'Sexo femenino', NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

-- ===============================================
-- PROBLEMA CRÍTICO 2: tipos_identificacion VACÍA
-- ===============================================
-- Tabla completamente vacía - requerida para formularios
-- Poblar con tipos básicos de identificación colombianos

INSERT INTO tipos_identificacion (nombre, codigo, created_at, updated_at) VALUES
('Cédula de Ciudadanía', 'CC', NOW(), NOW()),
('Tarjeta de Identidad', 'TI', NOW(), NOW()),
('Registro Civil', 'RC', NOW(), NOW()),
('Cédula de Extranjería', 'CE', NOW(), NOW()),
('Pasaporte', 'PP', NOW(), NOW()),
('PEP', 'PEP', NOW(), NOW()),
('Documento de Identidad Extranjero', 'DIE', NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

-- ===============================================
-- VERIFICAR/COMPLETAR: Estados civiles
-- ===============================================
-- Asegurar que existan estados civiles básicos

INSERT INTO estados_civiles (nombre, created_at, updated_at) VALUES
('Soltero(a)', NOW(), NOW()),
('Casado(a) Civil', NOW(), NOW()),
('Casado(a) Religioso', NOW(), NOW()),
('Divorciado(a)', NOW(), NOW()),
('Viudo(a)', NOW(), NOW()),
('Unión Libre', NOW(), NOW()),
('Separado(a)', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ===============================================
-- VERIFICAR/COMPLETAR: Parentescos
-- ===============================================
-- Asegurar que existan parentescos básicos para familias

INSERT INTO parentescos (nombre, created_at, updated_at) VALUES
('Jefe de Hogar', NOW(), NOW()),
('Cónyuge', NOW(), NOW()),
('Esposo(a)', NOW(), NOW()),
('Hijo(a)', NOW(), NOW()),
('Padre', NOW(), NOW()),
('Madre', NOW(), NOW()),
('Hermano(a)', NOW(), NOW()),
('Abuelo(a)', NOW(), NOW()),
('Nieto(a)', NOW(), NOW()),
('Tío(a)', NOW(), NOW()),
('Sobrino(a)', NOW(), NOW()),
('Primo(a)', NOW(), NOW()),
('Yerno/Nuera', NOW(), NOW()),
('Suegro(a)', NOW(), NOW()),
('Cuñado(a)', NOW(), NOW()),
('Otro Familiar', NOW(), NOW()),
('No Familiar', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ===============================================
-- VERIFICAR RESULTADOS DE LA CORRECCIÓN
-- ===============================================
-- Consulta para verificar que los catálogos tengan datos

SELECT 
    'sexos' as tabla, 
    COUNT(*) as registros,
    STRING_AGG(nombre, ', ') as valores
FROM sexos

UNION ALL

SELECT 
    'tipos_identificacion',
    COUNT(*),
    STRING_AGG(codigo, ', ')
FROM tipos_identificacion

UNION ALL

SELECT 
    'estados_civiles',
    COUNT(*),
    STRING_AGG(LEFT(nombre, 20), ', ')
FROM estados_civiles

UNION ALL

SELECT 
    'parentescos',
    COUNT(*),
    STRING_AGG(LEFT(nombre, 15), ', ')
FROM parentescos

UNION ALL

SELECT 
    'tipos_vivienda',
    COUNT(*),
    STRING_AGG(nombre, ', ')
FROM tipos_vivienda

UNION ALL

SELECT 
    'sistemas_acueducto',
    COUNT(*),
    STRING_AGG(LEFT(nombre, 20), ', ')
FROM sistemas_acueducto

UNION ALL

SELECT 
    'tipos_aguas_residuales',
    COUNT(*),
    STRING_AGG(LEFT(nombre, 20), ', ')
FROM tipos_aguas_residuales

UNION ALL

SELECT 
    'tipos_disposicion_basura',
    COUNT(*),
    STRING_AGG(LEFT(nombre, 20), ', ')
FROM tipos_disposicion_basura;

-- ===============================================
-- VERIFICAR DATOS DE MUNICIPIOS
-- ===============================================
-- Mostrar municipios disponibles para usar en pruebas

SELECT 
    id_municipio,
    nombre_municipio,
    codigo_dane
FROM municipios
ORDER BY id_municipio
LIMIT 10;

-- ===============================================
-- NOTAS IMPORTANTES PARA DESARROLLADORES
-- ===============================================
/*
PROBLEMAS ESTRUCTURALES IDENTIFICADOS:

1. NOMBRES DE FK MUY LARGOS:
   - id_tipo_identificacion_tipo_identificacion (en tabla personas)
   - id_estado_civil_estado_civil (en tabla personas)
   RECOMENDACIÓN: Simplificar en próxima migración

2. FK DUPLICADAS:
   - id_familia e id_familia_familias (en tabla personas)
   RECOMENDACIÓN: Usar solo id_familia_familias

3. CAMPOS NUEVOS ENCONTRADOS EN TABLA FAMILIAS:
   - numero_contrato_epm (varchar 50)
   - comunionEnCasa (boolean)
   INCLUIR en JSON de request para aprovechar funcionalidad

4. MAPEO DE DISPOSICIÓN DE BASURAS:
   JSON tiene opciones booleanas que deben mapearse a IDs:
   - recolector → ID 1 (Recolección Pública)
   - quemada → ID 2 (Quema)
   - enterrada → ID 3 (Entierro)
   - recicla → ID 4 (Reciclaje)
   - aire_libre → ¿ID 5? (Compostaje como alternativa)

DESPUÉS DE EJECUTAR ESTE SCRIPT:
✅ Usar json-encuesta-corregido-mcp.json para pruebas
✅ Verificar que POST /api/encuesta procese correctamente
✅ Confirmar que tablas de relación se llenen
✅ Validar que consultas devuelvan toda la información
*/

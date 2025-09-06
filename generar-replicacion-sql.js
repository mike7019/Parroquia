#!/usr/bin/env node

/**
 * Script para generar SQL completo de replicación de base de datos
 * Genera todos los comandos necesarios para crear una base de datos idéntica
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 GENERADOR DE REPLICACIÓN DE BASE DE DATOS PARROQUIA');
console.log('====================================================');
console.log('');

// Este script genera consultas SQL que deben ejecutarse con el servidor MCP
// Cada consulta está diseñada para ser copiada y ejecutada manualmente

const sqlQueries = {
  // 1. Obtener estructura de todas las tablas
  getTableStructures: `
-- 1. OBTENER ESTRUCTURA DE TODAS LAS TABLAS
SELECT 
    table_name,
    string_agg(
        column_name || ' ' || 
        data_type || 
        CASE 
            WHEN character_maximum_length IS NOT NULL 
            THEN '(' || character_maximum_length || ')'
            WHEN numeric_precision IS NOT NULL AND numeric_scale IS NOT NULL
            THEN '(' || numeric_precision || ',' || numeric_scale || ')'
            WHEN numeric_precision IS NOT NULL
            THEN '(' || numeric_precision || ')'
            ELSE ''
        END ||
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
        ', '
        ORDER BY ordinal_position
    ) as table_definition
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name NOT IN ('SequelizeMeta')
GROUP BY table_name
ORDER BY table_name;`,

  // 2. Obtener todas las foreign keys
  getForeignKeys: `
-- 2. OBTENER FOREIGN KEYS
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;`,

  // 3. Obtener índices
  getIndexes: `
-- 3. OBTENER ÍNDICES
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename NOT IN ('SequelizeMeta')
ORDER BY tablename, indexname;`,

  // 4. Obtener secuencias
  getSequences: `
-- 4. OBTENER SECUENCIAS
SELECT
    sequence_name,
    start_value,
    minimum_value,
    maximum_value,
    increment,
    cycle_option
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_name;`,

  // 5. Obtener datos de tablas de catálogo (que no cambian frecuentemente)
  getCatalogData: `
-- 5. DATOS DE CATÁLOGO - DEPARTAMENTOS
SELECT 'INSERT INTO departamentos (id_departamento, nombre, codigo_dane, created_at, updated_at) VALUES (' ||
       id_departamento || ', ''' || 
       replace(nombre, '''', '''''') || ''', ''' || 
       codigo_dane || ''', ''' || 
       created_at || ''', ''' || 
       updated_at || ''');' as insert_statement
FROM departamentos
ORDER BY id_departamento;`,

  getCatalogDataMunicipios: `
-- 5B. DATOS DE CATÁLOGO - MUNICIPIOS (PRIMEROS 100)
SELECT 'INSERT INTO municipios (id_municipio, nombre_municipio, codigo_dane, id_departamento, created_at, updated_at) VALUES (' ||
       id_municipio || ', ''' || 
       replace(nombre_municipio, '''', '''''') || ''', ''' || 
       codigo_dane || ''', ' || 
       id_departamento || ', ''' || 
       created_at || ''', ''' || 
       updated_at || ''');' as insert_statement
FROM municipios
ORDER BY id_municipio
LIMIT 100;`,

  getCatalogDataParroquias: `
-- 5C. DATOS DE CATÁLOGO - PARROQUIAS
SELECT 'INSERT INTO parroquias (id_parroquia, nombre, id_municipio, created_at, updated_at) VALUES (' ||
       id_parroquia || ', ''' || 
       replace(nombre, '''', '''''') || ''', ' || 
       COALESCE(id_municipio::text, 'NULL') || ', ''' || 
       created_at || ''', ''' || 
       updated_at || ''');' as insert_statement
FROM parroquias
ORDER BY id_parroquia;`,

  // 6. Obtener datos de familias y personas (datos dinámicos)
  getFamilias: `
-- 6A. DATOS DINÁMICOS - FAMILIAS
SELECT 'INSERT INTO familias (id_familia, apellido_familiar, sector, direccion_familia, numero_contacto, telefono, email, tamaño_familia, tipo_vivienda, estado_encuesta, numero_encuestas, fecha_ultima_encuesta, codigo_familia, tutor_responsable, id_municipio, id_vereda, id_sector, "comunionEnCasa", numero_contrato_epm, id_parroquia, comunionencasa, fecha_encuesta, sustento_familia, observaciones_encuestador, autorizacion_datos, pozo_septico, letrina, campo_abierto, disposicion_recolector, disposicion_quemada, disposicion_enterrada, disposicion_recicla, disposicion_aire_libre, disposicion_no_aplica, id_tipo_vivienda) VALUES (' ||
       id_familia || ', ''' || 
       replace(apellido_familiar, '''', '''''') || ''', ''' || 
       replace(sector, '''', '''''') || ''', ''' || 
       replace(direccion_familia, '''', '''''') || ''', ' || 
       COALESCE('''' || numero_contacto || '''', 'NULL') || ', ' ||
       COALESCE('''' || telefono || '''', 'NULL') || ', ' ||
       COALESCE('''' || email || '''', 'NULL') || ', ' ||
       tamaño_familia || ', ' ||
       COALESCE('''' || tipo_vivienda || '''', 'NULL') || ', ''' ||
       estado_encuesta || ''', ' ||
       numero_encuestas || ', ' ||
       COALESCE('''' || fecha_ultima_encuesta || '''', 'NULL') || ', ' ||
       COALESCE('''' || codigo_familia || '''', 'NULL') || ', ' ||
       COALESCE(tutor_responsable::text, 'NULL') || ', ' ||
       COALESCE(id_municipio::text, 'NULL') || ', ' ||
       COALESCE(id_vereda::text, 'NULL') || ', ' ||
       COALESCE(id_sector::text, 'NULL') || ', ' ||
       COALESCE("comunionEnCasa"::text, 'false') || ', ' ||
       COALESCE('''' || numero_contrato_epm || '''', 'NULL') || ', ' ||
       COALESCE(id_parroquia::text, 'NULL') || ', ' ||
       COALESCE(comunionencasa::text, 'false') || ', ' ||
       COALESCE('''' || fecha_encuesta || '''', 'NULL') || ', ' ||
       COALESCE('''' || replace(sustento_familia, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || replace(observaciones_encuestador, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE(autorizacion_datos::text, 'false') || ', ' ||
       COALESCE(pozo_septico::text, 'false') || ', ' ||
       COALESCE(letrina::text, 'false') || ', ' ||
       COALESCE(campo_abierto::text, 'false') || ', ' ||
       COALESCE(disposicion_recolector::text, 'false') || ', ' ||
       COALESCE(disposicion_quemada::text, 'false') || ', ' ||
       COALESCE(disposicion_enterrada::text, 'false') || ', ' ||
       COALESCE(disposicion_recicla::text, 'false') || ', ' ||
       COALESCE(disposicion_aire_libre::text, 'false') || ', ' ||
       COALESCE(disposicion_no_aplica::text, 'false') || ', ' ||
       COALESCE(id_tipo_vivienda::text, 'NULL') || ');' as insert_statement
FROM familias
ORDER BY id_familia;`,

  getPersonas: `
-- 6B. DATOS DINÁMICOS - PERSONAS
SELECT 'INSERT INTO personas (id_personas, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, id_tipo_identificacion_tipo_identificacion, identificacion, telefono, correo_electronico, fecha_nacimiento, direccion, id_familia_familias, id_estado_civil_estado_civil, estudios, en_que_eres_lider, necesidad_enfermo, id_profesion, id_sexo, talla_camisa, talla_pantalon, talla_zapato, id_familia, id_parroquia, id_parentesco, id_comunidad_cultural, id_nivel_educativo, motivo_celebrar, dia_celebrar, mes_celebrar) VALUES (' ||
       id_personas || ', ''' || 
       replace(primer_nombre, '''', '''''') || ''', ' || 
       COALESCE('''' || replace(segundo_nombre, '''', '''''') || '''', 'NULL') || ', ''' ||
       replace(primer_apellido, '''', '''''') || ''', ' || 
       COALESCE('''' || replace(segundo_apellido, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE(id_tipo_identificacion_tipo_identificacion::text, 'NULL') || ', ''' ||
       replace(identificacion, '''', '''''') || ''', ' || 
       COALESCE('''' || telefono || '''', 'NULL') || ', ' ||
       COALESCE('''' || correo_electronico || '''', 'NULL') || ', ''' ||
       fecha_nacimiento || ''', ''' ||
       replace(direccion, '''', '''''') || ''', ' || 
       COALESCE(id_familia_familias::text, 'NULL') || ', ' ||
       COALESCE(id_estado_civil_estado_civil::text, 'NULL') || ', ' ||
       COALESCE('''' || replace(estudios, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || replace(en_que_eres_lider, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || replace(necesidad_enfermo, '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE(id_profesion::text, 'NULL') || ', ' ||
       COALESCE(id_sexo::text, 'NULL') || ', ' ||
       COALESCE('''' || talla_camisa || '''', 'NULL') || ', ' ||
       COALESCE('''' || talla_pantalon || '''', 'NULL') || ', ' ||
       COALESCE('''' || talla_zapato || '''', 'NULL') || ', ' ||
       COALESCE(id_familia::text, 'NULL') || ', ' ||
       COALESCE(id_parroquia::text, 'NULL') || ', ' ||
       COALESCE(id_parentesco::text, 'NULL') || ', ' ||
       COALESCE(id_comunidad_cultural::text, 'NULL') || ', ' ||
       COALESCE(id_nivel_educativo::text, 'NULL') || ', ' ||
       COALESCE('''' || motivo_celebrar || '''', 'NULL') || ', ' ||
       COALESCE(dia_celebrar::text, 'NULL') || ', ' ||
       COALESCE(mes_celebrar::text, 'NULL') || ');' as insert_statement
FROM personas
ORDER BY id_personas;`
};

console.log('📋 CONSULTAS SQL PARA REPLICACIÓN GENERADAS');
console.log('');
console.log('🔍 Para obtener toda la información necesaria, ejecute estas consultas');
console.log('   en orden usando el servidor MCP PostgreSQL:');
console.log('');

let queryNumber = 1;
for (const [key, query] of Object.entries(sqlQueries)) {
  console.log(`${queryNumber}. ${key}:`);
  console.log('   Copie y ejecute esta consulta en MCP:');
  console.log('   ```sql');
  console.log(query.trim());
  console.log('   ```');
  console.log('');
  queryNumber++;
}

console.log('📝 INSTRUCCIONES DE USO:');
console.log('1. Ejecute cada consulta en orden usando el servidor MCP');
console.log('2. Guarde los resultados de cada consulta');
console.log('3. Use los resultados para generar el script SQL final');
console.log('4. Ejecute el script SQL en el servidor destino');
console.log('');

// Generar archivo de instrucciones
const instructionsFile = `# 🔄 INSTRUCCIONES PARA REPLICACIÓN DE BASE DE DATOS

## Paso a Paso para Crear Base de Datos Idéntica

### 1. Preparación del Servidor Destino

\`\`\`sql
-- Crear base de datos
CREATE DATABASE parroquia_db_replica;

-- Crear usuario
CREATE USER parroquia_user_replica WITH ENCRYPTED PASSWORD 'tu_password_aqui';

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE parroquia_db_replica TO parroquia_user_replica;
\`\`\`

### 2. Ejecutar Consultas de Extracción

Ejecute cada una de las consultas generadas por el script \`generar-replicacion-sql.js\`
usando el servidor MCP PostgreSQL en la base de datos origen.

### 3. Generar Script de Creación

Con los resultados obtenidos, genere un script SQL que contenga:

1. **CREATE TABLE** statements (basado en consulta 1)
2. **ALTER TABLE ADD CONSTRAINT** para foreign keys (basado en consulta 2)
3. **CREATE INDEX** statements (basado en consulta 3)
4. **CREATE SEQUENCE** y **ALTER SEQUENCE** (basado en consulta 4)
5. **INSERT** statements para datos de catálogo (consultas 5A, 5B, 5C)
6. **INSERT** statements para datos dinámicos (consultas 6A, 6B)

### 4. Ejecutar en Servidor Destino

\`\`\`bash
# Conectar al servidor destino
psql -h servidor_destino -p 5432 -U parroquia_user_replica -d parroquia_db_replica

# Ejecutar script generado
\\i script_replicacion_completo.sql
\`\`\`

### 5. Verificación

\`\`\`sql
-- Verificar conteos
SELECT 'familias' as tabla, COUNT(*) as registros FROM familias
UNION ALL
SELECT 'personas' as tabla, COUNT(*) as registros FROM personas
UNION ALL
SELECT 'parroquias' as tabla, COUNT(*) as registros FROM parroquias
UNION ALL
SELECT 'municipios' as tabla, COUNT(*) as registros FROM municipios
UNION ALL
SELECT 'departamentos' as tabla, COUNT(*) as registros FROM departamentos;
\`\`\`

## Notas Importantes

- ⚠️ **Backup**: Siempre haga backup antes de ejecutar scripts
- 🔐 **Seguridad**: Cambie las contraseñas por defecto
- 📊 **Validación**: Compare conteos de registros entre origen y destino
- 🔄 **Secuencias**: Ajuste los valores de las secuencias si es necesario

## Automatización

Para automatizar este proceso, puede:
1. Usar el script \`replicar-base-datos-completo.js\` (próximamente)
2. Configurar sincronización programada
3. Implementar replicación en tiempo real con PostgreSQL streaming
`;

fs.writeFileSync(path.join(__dirname, 'INSTRUCCIONES_REPLICACION_BD.md'), instructionsFile);

console.log('✅ Archivo de instrucciones generado: INSTRUCCIONES_REPLICACION_BD.md');
console.log('');
console.log('🚀 PRÓXIMO PASO: Ejecute las consultas SQL en el servidor MCP PostgreSQL');
console.log('   para obtener toda la información necesaria para la replicación.');

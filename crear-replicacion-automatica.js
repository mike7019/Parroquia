#!/usr/bin/env node

/**
 * Script automático para generar SQL completo de replicación
 * Utiliza el servidor MCP PostgreSQL para extraer todos los datos
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 GENERADOR AUTOMÁTICO DE REPLICACIÓN DE BASE DE DATOS');
console.log('=====================================================');
console.log('');

// Función para generar timestamp
function getCurrentTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

// Función para formatear SQL
function formatSQL(sql) {
  return sql.split('\n').map(line => line.trim()).filter(line => line).join('\n');
}

/**
 * Genera el archivo SQL completo basado en los resultados del MCP
 */
function generateReplicationSQL() {
  const timestamp = getCurrentTimestamp();
  const fileName = `replicacion-parroquia-${timestamp}.sql`;
  
  const sqlContent = `-- ================================================================
-- SCRIPT DE REPLICACIÓN COMPLETA - BASE DE DATOS PARROQUIA
-- Generado el: ${new Date().toISOString()}
-- ================================================================

-- 🔧 CONFIGURACIÓN INICIAL
SET client_encoding = 'UTF8';
SET timezone = 'UTC';

-- 🗄️ CREAR BASE DE DATOS (ejecutar como superusuario)
/*
CREATE DATABASE parroquia_db_replica 
    WITH ENCODING 'UTF8' 
    LC_COLLATE = 'en_US.utf8' 
    LC_CTYPE = 'en_US.utf8';

CREATE USER parroquia_user_replica WITH ENCRYPTED PASSWORD 'tu_password_seguro_aqui';
GRANT ALL PRIVILEGES ON DATABASE parroquia_db_replica TO parroquia_user_replica;
*/

-- Conectar a la base de datos destino
\\c parroquia_db_replica

-- 🏗️ CREAR TABLAS PRINCIPALES
-- Las definiciones exactas deben obtenerse ejecutando las consultas MCP

-- 1. DEPARTAMENTOS
CREATE TABLE IF NOT EXISTS departamentos (
    id_departamento bigint NOT NULL DEFAULT nextval('departamentos_id_departamento_seq'::regclass),
    nombre character varying(100) NOT NULL,
    codigo_dane character varying(2) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT departamentos_pkey PRIMARY KEY (id_departamento)
);

-- 2. MUNICIPIOS
CREATE TABLE IF NOT EXISTS municipios (
    id_municipio bigint NOT NULL DEFAULT nextval('municipios_id_municipio_seq'::regclass),
    nombre_municipio character varying(255) NOT NULL,
    codigo_dane character varying(5) NOT NULL,
    id_departamento bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT municipios_pkey PRIMARY KEY (id_municipio)
);

-- 3. PARROQUIAS
CREATE TABLE IF NOT EXISTS parroquias (
    id_parroquia bigint NOT NULL DEFAULT nextval('parroquias_id_parroquia_seq'::regclass),
    nombre character varying(100) NOT NULL,
    id_municipio bigint,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT parroquias_pkey PRIMARY KEY (id_parroquia)
);

-- 4. FAMILIAS
CREATE TABLE IF NOT EXISTS familias (
    id_familia bigint NOT NULL DEFAULT nextval('familias_id_familia_seq'::regclass),
    apellido_familiar character varying(200) NOT NULL,
    sector character varying(100) NOT NULL,
    direccion_familia character varying(255) NOT NULL,
    numero_contacto character varying(20),
    telefono character varying(20),
    email character varying(100),
    tamaño_familia integer NOT NULL DEFAULT 1,
    tipo_vivienda character varying(100),
    estado_encuesta character varying(20) NOT NULL DEFAULT 'pending'::character varying,
    numero_encuestas integer NOT NULL DEFAULT 0,
    fecha_ultima_encuesta date,
    codigo_familia character varying(50),
    tutor_responsable boolean,
    id_municipio bigint,
    id_vereda bigint,
    id_sector bigint,
    "comunionEnCasa" boolean DEFAULT false,
    numero_contrato_epm character varying(50),
    id_parroquia bigint,
    comunionencasa boolean DEFAULT false,
    fecha_encuesta date,
    sustento_familia text,
    observaciones_encuestador text,
    autorizacion_datos boolean DEFAULT false,
    pozo_septico boolean DEFAULT false,
    letrina boolean DEFAULT false,
    campo_abierto boolean DEFAULT false,
    disposicion_recolector boolean DEFAULT false,
    disposicion_quemada boolean DEFAULT false,
    disposicion_enterrada boolean DEFAULT false,
    disposicion_recicla boolean DEFAULT false,
    disposicion_aire_libre boolean DEFAULT false,
    disposicion_no_aplica boolean DEFAULT false,
    id_tipo_vivienda bigint,
    CONSTRAINT familias_pkey PRIMARY KEY (id_familia)
);

-- 5. PERSONAS
CREATE TABLE IF NOT EXISTS personas (
    id_personas bigint NOT NULL DEFAULT nextval('personas_id_personas_seq'::regclass),
    primer_nombre character varying(255) NOT NULL,
    segundo_nombre character varying(255),
    primer_apellido character varying(255) NOT NULL,
    segundo_apellido character varying(255),
    id_tipo_identificacion_tipo_identificacion bigint,
    identificacion character varying(255) NOT NULL,
    telefono character varying(255),
    correo_electronico character varying(255),
    fecha_nacimiento date NOT NULL,
    direccion character varying(255) NOT NULL,
    id_familia_familias bigint,
    id_estado_civil_estado_civil bigint,
    estudios character varying(255),
    en_que_eres_lider text,
    necesidad_enfermo text,
    id_profesion bigint,
    id_sexo bigint,
    talla_camisa character varying(10),
    talla_pantalon character varying(10),
    talla_zapato character varying(10),
    id_familia bigint,
    id_parroquia bigint,
    id_parentesco bigint,
    id_comunidad_cultural bigint,
    id_nivel_educativo bigint,
    motivo_celebrar character varying(100),
    dia_celebrar integer,
    mes_celebrar integer,
    CONSTRAINT personas_pkey PRIMARY KEY (id_personas)
);

-- 🔗 CREAR SECUENCIAS
CREATE SEQUENCE IF NOT EXISTS departamentos_id_departamento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS municipios_id_municipio_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS parroquias_id_parroquia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS familias_id_familia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS personas_id_personas_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- 🔑 FOREIGN KEYS
ALTER TABLE ONLY municipios 
    ADD CONSTRAINT municipios_id_departamento_fkey 
    FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento);

ALTER TABLE ONLY parroquias 
    ADD CONSTRAINT parroquias_id_municipio_fkey 
    FOREIGN KEY (id_municipio) REFERENCES municipios(id_municipio);

ALTER TABLE ONLY familias 
    ADD CONSTRAINT familias_id_parroquia_fkey 
    FOREIGN KEY (id_parroquia) REFERENCES parroquias(id_parroquia);

ALTER TABLE ONLY familias 
    ADD CONSTRAINT familias_id_municipio_fkey 
    FOREIGN KEY (id_municipio) REFERENCES municipios(id_municipio);

ALTER TABLE ONLY personas 
    ADD CONSTRAINT personas_id_familia_fkey 
    FOREIGN KEY (id_familia) REFERENCES familias(id_familia);

ALTER TABLE ONLY personas 
    ADD CONSTRAINT personas_id_parroquia_fkey 
    FOREIGN KEY (id_parroquia) REFERENCES parroquias(id_parroquia);

-- 📊 INSERTAR DATOS
-- NOTA: Los INSERT statements específicos deben generarse usando las consultas MCP

-- Ejemplo de estructura para departamentos:
/*
INSERT INTO departamentos (id_departamento, nombre, codigo_dane, created_at, updated_at) VALUES 
(1, 'Amazonas', '91', '2025-09-05 06:20:49.683+00', '2025-09-05 06:20:49.684+00'),
(2, 'Antioquia', '05', '2025-09-05 06:20:49.684+00', '2025-09-05 06:20:49.684+00');
-- ... continuar con todos los departamentos
*/

-- ⚙️ AJUSTAR SECUENCIAS
-- Ajustar el valor de las secuencias basado en los datos insertados
/*
SELECT setval('departamentos_id_departamento_seq', (SELECT MAX(id_departamento) FROM departamentos));
SELECT setval('municipios_id_municipio_seq', (SELECT MAX(id_municipio) FROM municipios));
SELECT setval('parroquias_id_parroquia_seq', (SELECT MAX(id_parroquia) FROM parroquias));
SELECT setval('familias_id_familia_seq', (SELECT MAX(id_familia) FROM familias));
SELECT setval('personas_id_personas_seq', (SELECT MAX(id_personas) FROM personas));
*/

-- 🔍 VERIFICACIÓN
SELECT 'departamentos' as tabla, COUNT(*) as registros FROM departamentos
UNION ALL
SELECT 'municipios' as tabla, COUNT(*) as registros FROM municipios
UNION ALL
SELECT 'parroquias' as tabla, COUNT(*) as registros FROM parroquias
UNION ALL
SELECT 'familias' as tabla, COUNT(*) as registros FROM familias
UNION ALL
SELECT 'personas' as tabla, COUNT(*) as registros FROM personas;

-- ✅ SCRIPT COMPLETADO
-- Fecha: ${new Date().toISOString()}
-- ================================================================`;

  return { fileName, content: sqlContent };
}

/**
 * Genera script de consultas MCP para obtener todos los datos
 */
function generateMCPQueries() {
  const queries = {
    departamentos: `
-- DEPARTAMENTOS - Obtener INSERT statements
SELECT 'INSERT INTO departamentos (id_departamento, nombre, codigo_dane, created_at, updated_at) VALUES (' ||
       id_departamento || ', ''' || 
       replace(nombre, '''', '''''') || ''', ''' || 
       codigo_dane || ''', ''' || 
       created_at || ''', ''' || 
       updated_at || ''');' as insert_statement
FROM departamentos
ORDER BY id_departamento;`,

    municipios: `
-- MUNICIPIOS - Obtener INSERT statements (todos)
SELECT 'INSERT INTO municipios (id_municipio, nombre_municipio, codigo_dane, id_departamento, created_at, updated_at) VALUES (' ||
       id_municipio || ', ''' || 
       replace(nombre_municipio, '''', '''''') || ''', ''' || 
       codigo_dane || ''', ' || 
       id_departamento || ', ''' || 
       created_at || ''', ''' || 
       updated_at || ''');' as insert_statement
FROM municipios
ORDER BY id_municipio;`,

    parroquias: `
-- PARROQUIAS - Obtener INSERT statements
SELECT 'INSERT INTO parroquias (id_parroquia, nombre, id_municipio, created_at, updated_at) VALUES (' ||
       id_parroquia || ', ''' || 
       replace(nombre, '''', '''''') || ''', ' || 
       COALESCE(id_municipio::text, 'NULL') || ', ''' || 
       created_at || ''', ''' || 
       updated_at || ''');' as insert_statement
FROM parroquias
ORDER BY id_parroquia;`,

    familias: `
-- FAMILIAS - Obtener INSERT statements completos
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
       COALESCE('''' || replace(COALESCE(sustento_familia, ''), '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || replace(COALESCE(observaciones_encuestador, ''), '''', '''''') || '''', 'NULL') || ', ' ||
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

    personas: `
-- PERSONAS - Obtener INSERT statements completos  
SELECT 'INSERT INTO personas (id_personas, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, id_tipo_identificacion_tipo_identificacion, identificacion, telefono, correo_electronico, fecha_nacimiento, direccion, id_familia_familias, id_estado_civil_estado_civil, estudios, en_que_eres_lider, necesidad_enfermo, id_profesion, id_sexo, talla_camisa, talla_pantalon, talla_zapato, id_familia, id_parroquia, id_parentesco, id_comunidad_cultural, id_nivel_educativo, motivo_celebrar, dia_celebrar, mes_celebrar) VALUES (' ||
       id_personas || ', ''' || 
       replace(primer_nombre, '''', '''''') || ''', ' || 
       COALESCE('''' || replace(COALESCE(segundo_nombre, ''), '''', '''''') || '''', 'NULL') || ', ''' ||
       replace(primer_apellido, '''', '''''') || ''', ' || 
       COALESCE('''' || replace(COALESCE(segundo_apellido, ''), '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE(id_tipo_identificacion_tipo_identificacion::text, 'NULL') || ', ''' ||
       replace(identificacion, '''', '''''') || ''', ' || 
       COALESCE('''' || telefono || '''', 'NULL') || ', ' ||
       COALESCE('''' || correo_electronico || '''', 'NULL') || ', ''' ||
       fecha_nacimiento || ''', ''' ||
       replace(direccion, '''', '''''') || ''', ' || 
       COALESCE(id_familia_familias::text, 'NULL') || ', ' ||
       COALESCE(id_estado_civil_estado_civil::text, 'NULL') || ', ' ||
       COALESCE('''' || replace(COALESCE(estudios, ''), '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || replace(COALESCE(en_que_eres_lider, ''), '''', '''''') || '''', 'NULL') || ', ' ||
       COALESCE('''' || replace(COALESCE(necesidad_enfermo, ''), '''', '''''') || '''', 'NULL') || ', ' ||
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

  const mcpFile = `# 🔄 CONSULTAS MCP PARA REPLICACIÓN COMPLETA

## Instrucciones de Uso

1. **Ejecute cada consulta** en orden usando el servidor MCP PostgreSQL
2. **Copie los resultados** y reemplace las secciones correspondientes en el archivo SQL
3. **Genere el script final** con todos los INSERT statements

---

${Object.entries(queries).map(([table, query], index) => `
## ${index + 1}. Tabla: ${table.toUpperCase()}

\`\`\`sql
${query.trim()}
\`\`\`

**Resultado esperado:** Lista de INSERT statements para la tabla ${table}

---`).join('')}

## Notas Importantes

- ⚠️ **Orden de ejecución**: Respete el orden de las consultas (dependencias)
- 🔍 **Verificación**: Compare conteos antes y después de la replicación
- 💾 **Backup**: Siempre haga backup antes de ejecutar en producción
- 🔐 **Seguridad**: Cambie las contraseñas por defecto
`;

  return mcpFile;
}

// Generar archivos
console.log('📝 Generando archivos de replicación...');

// Generar script SQL base
const { fileName, content } = generateReplicationSQL();
fs.writeFileSync(path.join(__dirname, fileName), content);
console.log(`✅ Script SQL base generado: ${fileName}`);

// Generar consultas MCP
const mcpQueries = generateMCPQueries();
fs.writeFileSync(path.join(__dirname, 'CONSULTAS_MCP_REPLICACION.md'), mcpQueries);
console.log('✅ Consultas MCP generadas: CONSULTAS_MCP_REPLICACION.md');

// Generar script de automatización completo
const automationScript = `#!/bin/bash

# Script de automatización para replicación completa
# Requiere conexión a ambas bases de datos

echo "🔄 REPLICACIÓN AUTOMÁTICA DE BASE DE DATOS PARROQUIA"
echo "=================================================="

# Variables de configuración
SOURCE_HOST="localhost"
SOURCE_PORT="5432"
SOURCE_DB="parroquia_db"
SOURCE_USER="parroquia_user"

DEST_HOST="servidor_destino"
DEST_PORT="5432"
DEST_DB="parroquia_db_replica"
DEST_USER="parroquia_user_replica"

# Crear respaldo de la base destino (si existe)
echo "📦 Creando respaldo de seguridad..."
pg_dump -h \$DEST_HOST -p \$DEST_PORT -U \$DEST_USER -d \$DEST_DB > backup_destino_\$(date +%Y%m%d_%H%M%S).sql

# Ejecutar script de replicación
echo "🚀 Ejecutando replicación..."
psql -h \$DEST_HOST -p \$DEST_PORT -U \$DEST_USER -d \$DEST_DB -f ${fileName}

# Verificar replicación
echo "🔍 Verificando replicación..."
psql -h \$DEST_HOST -p \$DEST_PORT -U \$DEST_USER -d \$DEST_DB -c "
SELECT 'departamentos' as tabla, COUNT(*) as registros FROM departamentos
UNION ALL
SELECT 'municipios' as tabla, COUNT(*) as registros FROM municipios
UNION ALL
SELECT 'parroquias' as tabla, COUNT(*) as registros FROM parroquias
UNION ALL
SELECT 'familias' as tabla, COUNT(*) as registros FROM familias
UNION ALL
SELECT 'personas' as tabla, COUNT(*) as registros FROM personas;"

echo "✅ Replicación completada"
`;

fs.writeFileSync(path.join(__dirname, 'automatizar-replicacion.sh'), automationScript);
fs.chmodSync(path.join(__dirname, 'automatizar-replicacion.sh'), '755');
console.log('✅ Script de automatización generado: automatizar-replicacion.sh');

console.log('');
console.log('🎉 ARCHIVOS DE REPLICACIÓN GENERADOS EXITOSAMENTE');
console.log('==============================================');
console.log('');
console.log('📄 Archivos creados:');
console.log(`   1. ${fileName} - Script SQL base`);
console.log('   2. CONSULTAS_MCP_REPLICACION.md - Consultas para obtener datos');
console.log('   3. automatizar-replicacion.sh - Script de automatización');
console.log('');
console.log('🚀 PRÓXIMOS PASOS:');
console.log('   1. Ejecute las consultas MCP para obtener los INSERT statements');
console.log('   2. Complete el script SQL con los datos obtenidos');
console.log('   3. Ejecute en el servidor destino');
console.log('   4. Verifique la integridad de los datos');
console.log('');
console.log('💡 TIP: Use el servidor MCP PostgreSQL para ejecutar las consultas');
console.log('   desde VS Code de manera interactiva.');

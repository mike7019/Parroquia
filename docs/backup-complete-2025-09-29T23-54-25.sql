-- Tabla: SequelizeMeta
DROP TABLE IF EXISTS "SequelizeMeta" CASCADE;
CREATE TABLE SequelizeMeta (name VARCHAR(255) NOT NULL);

-- Datos para SequelizeMeta
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000001-create-departamentos.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000002-create-municipios.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000003-create-parroquias.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000004-create-veredas.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000005-create-sectores.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000006-create-profesiones.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000007-create-enfermedades.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000008-create-destrezas.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000009-create-tipos-vivienda.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000010-create-sistemas-acueducto.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000011-create-tipos-aguas-residuales.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000012-create-tipos-disposicion-basura.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000013-create-familias.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000014-create-personas.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000015-create-encuestas.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000016-create-persona-enfermedad.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000017-create-persona-destreza.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000018-create-familia-tipo-vivienda.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000019-create-familia-sistema-acueducto.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000020-create-familia-sistema-aguas-residuales.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000021-create-familia-disposicion-basura.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000022-create-tipos-identificacion.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000023-create-estados-civiles.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000024-add-foreign-keys-personas.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000025-create-sexos.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000026-add-id-sexo-to-personas.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000027-remove-sexo-field-from-personas.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000028-remove-fields-from-personas.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20250803202624-remove-calzado-from-personas.cjs');
INSERT INTO "SequelizeMeta" ("name") VALUES ('20240101000029-create-roles.cjs');

-- Tabla: comunidades_culturales
DROP TABLE IF EXISTS "comunidades_culturales" CASCADE;
CREATE TABLE comunidades_culturales (id_comunidad_cultural BIGINT NOT NULL, nombre VARCHAR(255) NOT NULL, descripcion TEXT, activo BOOLEAN NOT NULL, createdAt TIMESTAMPTZ NOT NULL, updatedAt TIMESTAMPTZ NOT NULL);

-- Datos para comunidades_culturales
INSERT INTO "comunidades_culturales" ("id_comunidad_cultural", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('1', 'Afrodescendiente', 'Comunidad de personas afrodescendientes', true, '2025-09-04T20:16:22.126Z', '2025-09-04T20:16:22.126Z');

-- Tabla: departamentos
DROP TABLE IF EXISTS "departamentos" CASCADE;
CREATE TABLE departamentos (id_departamento BIGINT NOT NULL, nombre VARCHAR(100) NOT NULL, codigo VARCHAR(10), activo BOOLEAN, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para departamentos
INSERT INTO "departamentos" ("id_departamento", "nombre", "codigo", "activo", "created_at", "updated_at") VALUES ('1', 'Antioquia', '05', true, '2025-09-29T22:05:27.497Z', '2025-09-29T22:05:27.497Z');
INSERT INTO "departamentos" ("id_departamento", "nombre", "codigo", "activo", "created_at", "updated_at") VALUES ('2', 'Cundinamarca', '25', true, '2025-09-29T22:05:27.505Z', '2025-09-29T22:05:27.505Z');
INSERT INTO "departamentos" ("id_departamento", "nombre", "codigo", "activo", "created_at", "updated_at") VALUES ('3', 'Valle del Cauca', '76', true, '2025-09-29T22:05:27.507Z', '2025-09-29T22:05:27.507Z');

-- Tabla: destrezas
DROP TABLE IF EXISTS "destrezas" CASCADE;
CREATE TABLE destrezas (id_destreza BIGINT NOT NULL, nombre VARCHAR(255) NOT NULL, createdAt TIMESTAMPTZ NOT NULL, updatedAt TIMESTAMPTZ NOT NULL);

-- Tabla: difuntos_familia
DROP TABLE IF EXISTS "difuntos_familia" CASCADE;
CREATE TABLE difuntos_familia (id_difunto BIGINT NOT NULL, nombre_completo VARCHAR(255) NOT NULL, fecha_fallecimiento DATE NOT NULL, observaciones TEXT, id_familia_familias BIGINT, createdAt TIMESTAMPTZ NOT NULL, updatedAt TIMESTAMPTZ NOT NULL, id_sexo BIGINT, id_parentesco BIGINT, causa_fallecimiento TEXT);

-- Datos para difuntos_familia
INSERT INTO "difuntos_familia" ("id_difunto", "nombre_completo", "fecha_fallecimiento", "observaciones", "id_familia_familias", "createdAt", "updatedAt", "id_sexo", "id_parentesco", "causa_fallecimiento") VALUES ('1', 'Pedro Antonio Los Alvarez', '2020-05-15T05:00:00.000Z', 'Enfermedad cardiovascular', NULL, '2025-09-11T05:16:42.952Z', '2025-09-11T05:16:42.953Z', '1', '2', 'Enfermedad cardiovascular');
INSERT INTO "difuntos_familia" ("id_difunto", "nombre_completo", "fecha_fallecimiento", "observaciones", "id_familia_familias", "createdAt", "updatedAt", "id_sexo", "id_parentesco", "causa_fallecimiento") VALUES ('2', 'Pecas Garzon Rodriguez', '2020-05-15T05:00:00.000Z', 'Enfermedad cardiovascular', NULL, '2025-09-11T05:23:25.674Z', '2025-09-11T05:23:25.674Z', '1', '2', 'Enfermedad cardiovascular');

-- Tabla: encuestas
DROP TABLE IF EXISTS "encuestas" CASCADE;
CREATE TABLE encuestas (id_encuesta BIGINT NOT NULL, id_parroquia BIGINT NOT NULL, id_municipio BIGINT NOT NULL, fecha DATE NOT NULL, id_sector BIGINT NOT NULL, id_vereda BIGINT NOT NULL, observaciones TEXT, tratamiento_datos BOOLEAN NOT NULL, firma TEXT, createdAt TIMESTAMPTZ NOT NULL, updatedAt TIMESTAMPTZ NOT NULL);

-- Tabla: enfermedades
DROP TABLE IF EXISTS "enfermedades" CASCADE;
CREATE TABLE enfermedades (id_enfermedad BIGINT NOT NULL, descripcion VARCHAR(100) NOT NULL, activo BOOLEAN, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para enfermedades
INSERT INTO "enfermedades" ("id_enfermedad", "descripcion", "activo", "created_at", "updated_at") VALUES ('1', 'Diabetes', true, '2025-09-29T22:05:27.601Z', '2025-09-29T22:05:27.601Z');
INSERT INTO "enfermedades" ("id_enfermedad", "descripcion", "activo", "created_at", "updated_at") VALUES ('2', 'Hipertensión', true, '2025-09-29T22:05:27.606Z', '2025-09-29T22:05:27.606Z');
INSERT INTO "enfermedades" ("id_enfermedad", "descripcion", "activo", "created_at", "updated_at") VALUES ('3', 'Cardiopatía', true, '2025-09-29T22:05:27.608Z', '2025-09-29T22:05:27.608Z');
INSERT INTO "enfermedades" ("id_enfermedad", "descripcion", "activo", "created_at", "updated_at") VALUES ('4', 'Asma', true, '2025-09-29T22:05:27.609Z', '2025-09-29T22:05:27.609Z');
INSERT INTO "enfermedades" ("id_enfermedad", "descripcion", "activo", "created_at", "updated_at") VALUES ('5', 'Artritis', true, '2025-09-29T22:05:27.611Z', '2025-09-29T22:05:27.611Z');
INSERT INTO "enfermedades" ("id_enfermedad", "descripcion", "activo", "created_at", "updated_at") VALUES ('6', 'Otra', true, '2025-09-29T22:05:27.614Z', '2025-09-29T22:05:27.614Z');

-- Tabla: estados_civiles
DROP TABLE IF EXISTS "estados_civiles" CASCADE;
CREATE TABLE estados_civiles (id_estado BIGINT NOT NULL, descripcion VARCHAR(50) NOT NULL, activo BOOLEAN, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para estados_civiles
INSERT INTO "estados_civiles" ("id_estado", "descripcion", "activo", "created_at", "updated_at") VALUES ('1', 'Soltero(a)', true, '2025-09-29T22:05:27.587Z', '2025-09-29T22:05:27.587Z');
INSERT INTO "estados_civiles" ("id_estado", "descripcion", "activo", "created_at", "updated_at") VALUES ('2', 'Casado(a)', true, '2025-09-29T22:05:27.592Z', '2025-09-29T22:05:27.592Z');
INSERT INTO "estados_civiles" ("id_estado", "descripcion", "activo", "created_at", "updated_at") VALUES ('3', 'Unión Libre', true, '2025-09-29T22:05:27.594Z', '2025-09-29T22:05:27.594Z');
INSERT INTO "estados_civiles" ("id_estado", "descripcion", "activo", "created_at", "updated_at") VALUES ('4', 'Divorciado(a)', true, '2025-09-29T22:05:27.596Z', '2025-09-29T22:05:27.596Z');
INSERT INTO "estados_civiles" ("id_estado", "descripcion", "activo", "created_at", "updated_at") VALUES ('5', 'Viudo(a)', true, '2025-09-29T22:05:27.597Z', '2025-09-29T22:05:27.597Z');
INSERT INTO "estados_civiles" ("id_estado", "descripcion", "activo", "created_at", "updated_at") VALUES ('6', 'Separado(a)', true, '2025-09-29T22:05:27.598Z', '2025-09-29T22:05:27.598Z');

-- Tabla: familia_aguas_residuales
DROP TABLE IF EXISTS "familia_aguas_residuales" CASCADE;
CREATE TABLE familia_aguas_residuales (id INTEGER NOT NULL, id_familia INTEGER NOT NULL, tipo_tratamiento VARCHAR(255) NOT NULL, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ);

-- Tabla: familia_disposicion_basura
DROP TABLE IF EXISTS "familia_disposicion_basura" CASCADE;
CREATE TABLE familia_disposicion_basura (id BIGINT NOT NULL, id_familia BIGINT NOT NULL, id_tipo_disposicion_basura BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Tabla: familia_disposicion_basuras
DROP TABLE IF EXISTS "familia_disposicion_basuras" CASCADE;
CREATE TABLE familia_disposicion_basuras (id INTEGER NOT NULL, id_familia INTEGER NOT NULL, disposicion VARCHAR(255) NOT NULL, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ);

-- Tabla: familia_sistema_acueducto
DROP TABLE IF EXISTS "familia_sistema_acueducto" CASCADE;
CREATE TABLE familia_sistema_acueducto (id_familia BIGINT NOT NULL, id_sistema_acueducto BIGINT NOT NULL, id BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Tabla: familia_sistema_acueductos
DROP TABLE IF EXISTS "familia_sistema_acueductos" CASCADE;
CREATE TABLE familia_sistema_acueductos (id BIGINT NOT NULL, id_familia BIGINT NOT NULL, id_sistema_acueducto BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Tabla: familia_sistema_aguas_residuales
DROP TABLE IF EXISTS "familia_sistema_aguas_residuales" CASCADE;
CREATE TABLE familia_sistema_aguas_residuales (id BIGINT NOT NULL, id_familia BIGINT NOT NULL, id_tipo_aguas_residuales BIGINT NOT NULL, createdAt TIMESTAMPTZ NOT NULL, updatedAt TIMESTAMPTZ NOT NULL);

-- Tabla: familia_tipo_vivienda
DROP TABLE IF EXISTS "familia_tipo_vivienda" CASCADE;
CREATE TABLE familia_tipo_vivienda (id_familia BIGINT NOT NULL, id_tipo_vivienda BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Tabla: familia_tipo_viviendas
DROP TABLE IF EXISTS "familia_tipo_viviendas" CASCADE;
CREATE TABLE familia_tipo_viviendas (id BIGINT NOT NULL, id_familia BIGINT NOT NULL, id_tipo_vivienda BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Tabla: familias
DROP TABLE IF EXISTS "familias" CASCADE;
CREATE TABLE familias (id_familia BIGINT NOT NULL, apellido_familiar VARCHAR(100), sector VARCHAR(100), direccion_familia VARCHAR(200), numero_contacto VARCHAR(20), telefono VARCHAR(20), email VARCHAR(100), tamaño_familia INTEGER, tipo_vivienda VARCHAR(50), estado_encuesta VARCHAR(50), numero_encuestas INTEGER, fecha_ultima_encuesta TIMESTAMPTZ, codigo_familia VARCHAR(50), tutor_responsable BOOLEAN, id_municipio BIGINT, id_vereda BIGINT, id_sector BIGINT, comunionEnCasa BOOLEAN, numero_contrato_epm VARCHAR(50), created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Tabla: municipios
DROP TABLE IF EXISTS "municipios" CASCADE;
CREATE TABLE municipios (id_municipio BIGINT NOT NULL, nombre VARCHAR(100) NOT NULL, codigo VARCHAR(10), id_departamento BIGINT, activo BOOLEAN, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para municipios
INSERT INTO "municipios" ("id_municipio", "nombre", "codigo", "id_departamento", "activo", "created_at", "updated_at") VALUES ('1', 'Medellín', '05001', '1', true, '2025-09-29T22:05:27.509Z', '2025-09-29T22:05:27.509Z');
INSERT INTO "municipios" ("id_municipio", "nombre", "codigo", "id_departamento", "activo", "created_at", "updated_at") VALUES ('2', 'Envigado', '05266', '1', true, '2025-09-29T22:05:27.513Z', '2025-09-29T22:05:27.513Z');
INSERT INTO "municipios" ("id_municipio", "nombre", "codigo", "id_departamento", "activo", "created_at", "updated_at") VALUES ('3', 'Bogotá D.C.', '25001', '2', true, '2025-09-29T22:05:27.515Z', '2025-09-29T22:05:27.515Z');
INSERT INTO "municipios" ("id_municipio", "nombre", "codigo", "id_departamento", "activo", "created_at", "updated_at") VALUES ('4', 'Cali', '76001', '3', true, '2025-09-29T22:05:27.518Z', '2025-09-29T22:05:27.518Z');

-- Tabla: niveles_educativos
DROP TABLE IF EXISTS "niveles_educativos" CASCADE;
CREATE TABLE niveles_educativos (id_niveles_educativos BIGINT NOT NULL, nivel VARCHAR(255) NOT NULL, descripcion TEXT, orden_nivel INTEGER, activo BOOLEAN NOT NULL, createdAt TIMESTAMPTZ NOT NULL, updatedAt TIMESTAMPTZ NOT NULL, deletedAt TIMESTAMPTZ);

-- Datos para niveles_educativos
INSERT INTO "niveles_educativos" ("id_niveles_educativos", "nivel", "descripcion", "orden_nivel", "activo", "createdAt", "updatedAt", "deletedAt") VALUES ('1', 'Educación Primaria', 'Nivel básico de educación formal', 1, true, '2025-09-04T20:14:48.526Z', '2025-09-04T20:14:48.526Z', NULL);
INSERT INTO "niveles_educativos" ("id_niveles_educativos", "nivel", "descripcion", "orden_nivel", "activo", "createdAt", "updatedAt", "deletedAt") VALUES ('2', 'Sin Educación Formal', 'Persona sin educación formal', 0, true, '2025-09-05T03:38:50.837Z', '2025-09-05T03:38:50.837Z', NULL);
INSERT INTO "niveles_educativos" ("id_niveles_educativos", "nivel", "descripcion", "orden_nivel", "activo", "createdAt", "updatedAt", "deletedAt") VALUES ('3', 'Educación Secundaria', 'Educación media o bachillerato', 2, true, '2025-09-05T03:38:50.844Z', '2025-09-05T03:38:50.844Z', NULL);
INSERT INTO "niveles_educativos" ("id_niveles_educativos", "nivel", "descripcion", "orden_nivel", "activo", "createdAt", "updatedAt", "deletedAt") VALUES ('4', 'Técnico', 'Formación técnica especializada', 3, true, '2025-09-05T03:38:50.848Z', '2025-09-05T03:38:50.848Z', NULL);
INSERT INTO "niveles_educativos" ("id_niveles_educativos", "nivel", "descripcion", "orden_nivel", "activo", "createdAt", "updatedAt", "deletedAt") VALUES ('5', 'Tecnológico', 'Formación tecnológica superior', 4, true, '2025-09-05T03:38:50.852Z', '2025-09-05T03:38:50.852Z', NULL);
INSERT INTO "niveles_educativos" ("id_niveles_educativos", "nivel", "descripcion", "orden_nivel", "activo", "createdAt", "updatedAt", "deletedAt") VALUES ('6', 'Universitario', 'Educación universitaria de pregrado', 5, true, '2025-09-05T03:38:50.856Z', '2025-09-05T03:38:50.856Z', NULL);
INSERT INTO "niveles_educativos" ("id_niveles_educativos", "nivel", "descripcion", "orden_nivel", "activo", "createdAt", "updatedAt", "deletedAt") VALUES ('7', 'Especialización', 'Estudios de especialización universitaria', 6, true, '2025-09-05T03:38:50.859Z', '2025-09-05T03:38:50.859Z', NULL);
INSERT INTO "niveles_educativos" ("id_niveles_educativos", "nivel", "descripcion", "orden_nivel", "activo", "createdAt", "updatedAt", "deletedAt") VALUES ('8', 'Maestría', 'Estudios de maestría o magíster', 7, true, '2025-09-05T03:38:50.862Z', '2025-09-05T03:38:50.862Z', NULL);
INSERT INTO "niveles_educativos" ("id_niveles_educativos", "nivel", "descripcion", "orden_nivel", "activo", "createdAt", "updatedAt", "deletedAt") VALUES ('9', 'Doctorado', 'Estudios doctorales', 8, true, '2025-09-05T03:38:50.866Z', '2025-09-05T03:38:50.866Z', NULL);

-- Tabla: parentescos
DROP TABLE IF EXISTS "parentescos" CASCADE;
CREATE TABLE parentescos (id_parentesco BIGINT NOT NULL, nombre VARCHAR(255) NOT NULL, descripcion TEXT, activo BOOLEAN NOT NULL, createdAt TIMESTAMPTZ NOT NULL, updatedAt TIMESTAMPTZ NOT NULL);

-- Datos para parentescos
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('1', 'Abuelo', 'Abuelo paterno o materno', true, '2025-09-04T20:14:04.598Z', '2025-09-04T20:14:04.598Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('2', 'Padre', 'Padre biológico o adoptivo', true, '2025-09-11T04:09:39.366Z', '2025-09-11T04:09:39.366Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('3', 'Madre', 'Madre biológica o adoptiva', true, '2025-09-11T04:09:39.372Z', '2025-09-11T04:09:39.372Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('4', 'Hijo', 'Hijo biológico o adoptivo', true, '2025-09-11T04:09:39.374Z', '2025-09-11T04:09:39.374Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('5', 'Hija', 'Hija biológica o adoptiva', true, '2025-09-11T04:09:39.378Z', '2025-09-11T04:09:39.378Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('6', 'Hermano', 'Hermano', true, '2025-09-11T04:09:39.381Z', '2025-09-11T04:09:39.381Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('7', 'Hermana', 'Hermana', true, '2025-09-11T04:09:39.384Z', '2025-09-11T04:09:39.384Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('8', 'Abuela', 'Abuela paterna o materna', true, '2025-09-11T04:09:39.388Z', '2025-09-11T04:09:39.388Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('9', 'Esposo', 'Esposo', true, '2025-09-11T04:09:39.392Z', '2025-09-11T04:09:39.392Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('10', 'Esposa', 'Esposa', true, '2025-09-11T04:09:39.395Z', '2025-09-11T04:09:39.395Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('11', 'Nieto', 'Nieto', true, '2025-09-11T04:09:39.398Z', '2025-09-11T04:09:39.398Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('12', 'Nieta', 'Nieta', true, '2025-09-11T04:09:39.400Z', '2025-09-11T04:09:39.400Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('13', 'Tío', 'Tío', true, '2025-09-11T04:09:39.404Z', '2025-09-11T04:09:39.404Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('14', 'Tía', 'Tía', true, '2025-09-11T04:09:39.407Z', '2025-09-11T04:09:39.407Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('15', 'Primo', 'Primo', true, '2025-09-11T04:09:39.411Z', '2025-09-11T04:09:39.411Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('16', 'Prima', 'Prima', true, '2025-09-11T04:09:39.415Z', '2025-09-11T04:09:39.415Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('17', 'Suegro', 'Suegro', true, '2025-09-11T04:09:39.418Z', '2025-09-11T04:09:39.418Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('18', 'Suegra', 'Suegra', true, '2025-09-11T04:09:39.422Z', '2025-09-11T04:09:39.422Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('19', 'Yerno', 'Yerno', true, '2025-09-11T04:09:39.425Z', '2025-09-11T04:09:39.425Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('20', 'Nuera', 'Nuera', true, '2025-09-11T04:09:39.428Z', '2025-09-11T04:09:39.428Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('21', 'Cuñado', 'Cuñado', true, '2025-09-11T04:09:39.432Z', '2025-09-11T04:09:39.432Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('22', 'Cuñada', 'Cuñada', true, '2025-09-11T04:09:39.435Z', '2025-09-11T04:09:39.435Z');
INSERT INTO "parentescos" ("id_parentesco", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('23', 'Otro', 'Otro parentesco no especificado', true, '2025-09-11T04:09:39.438Z', '2025-09-11T04:09:39.438Z');

-- Tabla: parroquia
DROP TABLE IF EXISTS "parroquia" CASCADE;
CREATE TABLE parroquia (id_parroquia BIGINT NOT NULL, nombre VARCHAR(255) NOT NULL, id_municipio BIGINT NOT NULL, direccion VARCHAR(500), telefono VARCHAR(20), email VARCHAR(100), created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ);

-- Datos para parroquia
INSERT INTO "parroquia" ("id_parroquia", "nombre", "id_municipio", "direccion", "telefono", "email", "created_at", "updated_at") VALUES ('7', 'Parroquia San José', '1', 'Carrera 50 # 45-32, El Poblado', '+57 4 123-4567', 'contacto@parroquiasanjose.com', '2025-09-29T22:43:00.546Z', '2025-09-29T22:43:00.546Z');
INSERT INTO "parroquia" ("id_parroquia", "nombre", "id_municipio", "direccion", "telefono", "email", "created_at", "updated_at") VALUES ('8', 'Parroquia Sagrado Corazón', '1', 'Calle 10 # 23-45, Centro', '+57 4 567-8910', 'info@sagradocorazon.com', '2025-09-29T22:43:00.550Z', '2025-09-29T22:43:00.550Z');
INSERT INTO "parroquia" ("id_parroquia", "nombre", "id_municipio", "direccion", "telefono", "email", "created_at", "updated_at") VALUES ('9', 'Parroquia La Inmaculada', '2', 'Avenida 80 # 12-34, Laureles', '+57 4 890-1234', 'inmaculada@parroquia.org', '2025-09-29T22:43:00.555Z', '2025-09-29T22:43:00.555Z');
INSERT INTO "parroquia" ("id_parroquia", "nombre", "id_municipio", "direccion", "telefono", "email", "created_at", "updated_at") VALUES ('10', 'Parroquia de Prueba Diagnóstico', '3', 'Calle de Diagnóstico #123', '+57 300 555 0123', 'diagnostico@parroquia.test', '2025-09-29T23:00:36.305Z', '2025-09-29T23:00:36.305Z');
INSERT INTO "parroquia" ("id_parroquia", "nombre", "id_municipio", "direccion", "telefono", "email", "created_at", "updated_at") VALUES ('11', 'Parroquia San Pedro', '1', 'Carrera 50 # 45-32', '+57 4 123-4567', 'contacto@parroquiasanjose.com', '2025-09-29T23:00:58.651Z', '2025-09-29T23:00:58.651Z');
INSERT INTO "parroquia" ("id_parroquia", "nombre", "id_municipio", "direccion", "telefono", "email", "created_at", "updated_at") VALUES ('12', 'Parroquia Santa María - Prueba Formato', '1', 'Avenida Principal #456', '+57 4 987-6543', 'santamaria@parroquia.test', '2025-09-29T23:02:48.354Z', '2025-09-29T23:02:48.354Z');
INSERT INTO "parroquia" ("id_parroquia", "nombre", "id_municipio", "direccion", "telefono", "email", "created_at", "updated_at") VALUES ('13', 'Parroquia Santa María - Prueba Formato', '1', 'Avenida Principal #456', '+57 4 987-6543', 'santamaria@parroquia.test', '2025-09-29T23:04:55.041Z', '2025-09-29T23:04:55.041Z');
INSERT INTO "parroquia" ("id_parroquia", "nombre", "id_municipio", "direccion", "telefono", "email", "created_at", "updated_at") VALUES ('14', 'Parroquia San juancho', '1', 'Carrera 50 # 45-32', '+57 4 123-4567', 'contacto@parroquiasanjose.com', '2025-09-29T23:06:16.682Z', '2025-09-29T23:06:16.682Z');

-- Tabla: parroquias
DROP TABLE IF EXISTS "parroquias" CASCADE;
CREATE TABLE parroquias (id_parroquia BIGINT NOT NULL, nombre VARCHAR(100) NOT NULL, id_municipio BIGINT, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para parroquias
INSERT INTO "parroquias" ("id_parroquia", "nombre", "id_municipio", "created_at", "updated_at") VALUES ('1', 'San José', '1', '2025-09-29T22:05:27.523Z', '2025-09-29T22:05:27.523Z');
INSERT INTO "parroquias" ("id_parroquia", "nombre", "id_municipio", "created_at", "updated_at") VALUES ('2', 'Sagrado Corazón', '1', '2025-09-29T22:05:27.526Z', '2025-09-29T22:05:27.526Z');
INSERT INTO "parroquias" ("id_parroquia", "nombre", "id_municipio", "created_at", "updated_at") VALUES ('3', 'Nuestra Señora de Fátima', '2', '2025-09-29T22:05:27.528Z', '2025-09-29T22:05:27.528Z');
INSERT INTO "parroquias" ("id_parroquia", "nombre", "id_municipio", "created_at", "updated_at") VALUES ('4', 'La Inmaculada', '3', '2025-09-29T22:05:27.530Z', '2025-09-29T22:05:27.530Z');
INSERT INTO "parroquias" ("id_parroquia", "nombre", "id_municipio", "created_at", "updated_at") VALUES ('5', 'San Francisco', '4', '2025-09-29T22:05:27.532Z', '2025-09-29T22:05:27.532Z');

-- Tabla: persona_destreza
DROP TABLE IF EXISTS "persona_destreza" CASCADE;
CREATE TABLE persona_destreza (createdAt TIMESTAMPTZ NOT NULL, updatedAt TIMESTAMPTZ NOT NULL, id_destrezas_destrezas BIGINT NOT NULL, id_personas_personas BIGINT NOT NULL);

-- Tabla: persona_enfermedad
DROP TABLE IF EXISTS "persona_enfermedad" CASCADE;
CREATE TABLE persona_enfermedad (id_persona BIGINT NOT NULL, id_enfermedad BIGINT NOT NULL, createdAt TIMESTAMPTZ NOT NULL, updatedAt TIMESTAMPTZ NOT NULL);

-- Tabla: personas
DROP TABLE IF EXISTS "personas" CASCADE;
CREATE TABLE personas (id_personas BIGINT NOT NULL, primer_nombre VARCHAR(50), segundo_nombre VARCHAR(50), primer_apellido VARCHAR(50), segundo_apellido VARCHAR(50), id_tipo_identificacion_tipo_identificacion BIGINT, identificacion VARCHAR(20), telefono VARCHAR(20), correo_electronico VARCHAR(100), fecha_nacimiento TIMESTAMPTZ, direccion VARCHAR(200), id_familia_familias BIGINT, id_estado_civil_estado_civil BIGINT, estudios VARCHAR(100), en_que_eres_lider VARCHAR(200), necesidad_enfermo VARCHAR(200), id_profesion BIGINT, id_sexo BIGINT, talla_camisa VARCHAR(10), talla_pantalon VARCHAR(10), talla_zapato VARCHAR(10), id_familia BIGINT, id_parroquia BIGINT, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Tabla: profesiones
DROP TABLE IF EXISTS "profesiones" CASCADE;
CREATE TABLE profesiones (id_profesion BIGINT NOT NULL, nombre VARCHAR(255) NOT NULL, descripcion TEXT, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para profesiones
INSERT INTO "profesiones" ("id_profesion", "nombre", "descripcion", "created_at", "updated_at") VALUES ('1', 'Ingeniero', 'Profesión de Ingeniería', '2025-09-04T22:48:50.436Z', '2025-09-04T22:48:50.436Z');
INSERT INTO "profesiones" ("id_profesion", "nombre", "descripcion", "created_at", "updated_at") VALUES ('2', 'Contador', 'Profesión de Contaduría', '2025-09-04T22:48:50.436Z', '2025-09-04T22:48:50.436Z');

-- Tabla: roles
DROP TABLE IF EXISTS "roles" CASCADE;
CREATE TABLE roles (id INTEGER NOT NULL, nombre VARCHAR(50) NOT NULL, descripcion TEXT, activo BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ);

-- Datos para roles
INSERT INTO "roles" ("id", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES (1, 'admin', 'Administrador del sistema', true, '2025-09-29T22:43:00.436Z', '2025-09-29T22:43:00.436Z');
INSERT INTO "roles" ("id", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES (2, 'user', 'Usuario normal', true, '2025-09-29T22:43:00.444Z', '2025-09-29T22:43:00.444Z');

-- Tabla: sector
DROP TABLE IF EXISTS "sector" CASCADE;
CREATE TABLE sector (id_sector BIGINT NOT NULL, nombre VARCHAR(255) NOT NULL, createdAt TIMESTAMPTZ NOT NULL, updatedAt TIMESTAMPTZ NOT NULL);

-- Tabla: sectores
DROP TABLE IF EXISTS "sectores" CASCADE;
CREATE TABLE sectores (id_sector BIGINT NOT NULL, nombre VARCHAR(100) NOT NULL, id_parroquia BIGINT, activo BOOLEAN, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para sectores
INSERT INTO "sectores" ("id_sector", "nombre", "id_parroquia", "activo", "created_at", "updated_at") VALUES ('1', 'Centro', '1', true, '2025-09-29T22:05:27.536Z', '2025-09-29T22:05:27.536Z');
INSERT INTO "sectores" ("id_sector", "nombre", "id_parroquia", "activo", "created_at", "updated_at") VALUES ('2', 'Norte', '1', true, '2025-09-29T22:05:27.539Z', '2025-09-29T22:05:27.539Z');
INSERT INTO "sectores" ("id_sector", "nombre", "id_parroquia", "activo", "created_at", "updated_at") VALUES ('3', 'Sur', '2', true, '2025-09-29T22:05:27.541Z', '2025-09-29T22:05:27.541Z');
INSERT INTO "sectores" ("id_sector", "nombre", "id_parroquia", "activo", "created_at", "updated_at") VALUES ('4', 'Occidental', '3', true, '2025-09-29T22:05:27.543Z', '2025-09-29T22:05:27.543Z');

-- Tabla: sexo
DROP TABLE IF EXISTS "sexo" CASCADE;
CREATE TABLE sexo (id_sexo BIGINT NOT NULL, descripcion VARCHAR(255) NOT NULL, createdAt TIMESTAMPTZ NOT NULL, updatedAt TIMESTAMPTZ NOT NULL);

-- Tabla: sexos
DROP TABLE IF EXISTS "sexos" CASCADE;
CREATE TABLE sexos (id_sexo BIGINT NOT NULL, nombre VARCHAR(50) NOT NULL, codigo VARCHAR(1) NOT NULL, descripcion TEXT, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para sexos
INSERT INTO "sexos" ("id_sexo", "nombre", "codigo", "descripcion", "created_at", "updated_at") VALUES ('1', 'Masculino', 'M', 'Sexo masculino', '2025-09-04T20:06:15.858Z', '2025-09-04T20:06:15.858Z');

-- Tabla: sistemas_acueducto
DROP TABLE IF EXISTS "sistemas_acueducto" CASCADE;
CREATE TABLE sistemas_acueducto (id_sistema_acueducto BIGINT NOT NULL, nombre VARCHAR(255) NOT NULL, descripcion TEXT, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para sistemas_acueducto
INSERT INTO "sistemas_acueducto" ("id_sistema_acueducto", "nombre", "descripcion", "created_at", "updated_at") VALUES ('1', 'Acueducto Público', 'Sistema de acueducto municipal o público', '2025-08-08T03:30:57.476Z', '2025-08-08T03:30:57.476Z');
INSERT INTO "sistemas_acueducto" ("id_sistema_acueducto", "nombre", "descripcion", "created_at", "updated_at") VALUES ('2', 'Pozo Profundo', 'Agua extraída de pozo profundo', '2025-08-08T03:30:57.476Z', '2025-08-08T03:30:57.476Z');
INSERT INTO "sistemas_acueducto" ("id_sistema_acueducto", "nombre", "descripcion", "created_at", "updated_at") VALUES ('3', 'Aljibe', 'Depósito subterráneo para recoger y conservar agua', '2025-08-08T03:30:57.476Z', '2025-08-08T03:30:57.476Z');
INSERT INTO "sistemas_acueducto" ("id_sistema_acueducto", "nombre", "descripcion", "created_at", "updated_at") VALUES ('4', 'Río o Quebrada', 'Agua tomada directamente de fuente natural', '2025-08-08T03:30:57.476Z', '2025-08-08T03:30:57.476Z');
INSERT INTO "sistemas_acueducto" ("id_sistema_acueducto", "nombre", "descripcion", "created_at", "updated_at") VALUES ('5', 'Agua Lluvia', 'Recolección de agua de lluvia', '2025-08-08T03:30:57.476Z', '2025-08-08T03:30:57.476Z');
INSERT INTO "sistemas_acueducto" ("id_sistema_acueducto", "nombre", "descripcion", "created_at", "updated_at") VALUES ('6', 'Compra de Agua', 'Agua adquirida a terceros (carrotanques, etc.)', '2025-08-08T03:30:57.476Z', '2025-08-08T03:30:57.476Z');
INSERT INTO "sistemas_acueducto" ("id_sistema_acueducto", "nombre", "descripcion", "created_at", "updated_at") VALUES ('7', 'Otro', 'Otro sistema de abastecimiento no especificado', '2025-08-08T03:30:57.476Z', '2025-08-08T03:30:57.476Z');
INSERT INTO "sistemas_acueducto" ("id_sistema_acueducto", "nombre", "descripcion", "created_at", "updated_at") VALUES ('10', 'Test Sistema Actualizado', 'Este debería fallar', '2025-08-11T00:18:01.549Z', '2025-08-11T00:18:01.549Z');
INSERT INTO "sistemas_acueducto" ("id_sistema_acueducto", "nombre", "descripcion", "created_at", "updated_at") VALUES ('13', 'Test Sistema Automático', 'Sistema creado durante las pruebas automatizadas', '2025-08-11T00:21:37.924Z', '2025-08-11T00:21:37.924Z');
INSERT INTO "sistemas_acueducto" ("id_sistema_acueducto", "nombre", "descripcion", "created_at", "updated_at") VALUES ('21', 'Acueducsdto Público', 'Sistema de agua potable municipal con cobertura completa', '2025-08-11T00:57:53.736Z', '2025-08-11T00:57:53.736Z');
INSERT INTO "sistemas_acueducto" ("id_sistema_acueducto", "nombre", "descripcion", "created_at", "updated_at") VALUES ('22', 'Sistema Comunitario', 'Sistema de acueducto manejado por la comunidad local', '2025-08-13T03:57:23.829Z', '2025-08-13T03:57:23.829Z');
INSERT INTO "sistemas_acueducto" ("id_sistema_acueducto", "nombre", "descripcion", "created_at", "updated_at") VALUES ('25', 'Acueducto Municipal', NULL, '2025-09-04T06:06:36.145Z', '2025-09-04T06:06:36.145Z');
INSERT INTO "sistemas_acueducto" ("id_sistema_acueducto", "nombre", "descripcion", "created_at", "updated_at") VALUES ('26', 'Pozo Propio', NULL, '2025-09-04T06:06:36.151Z', '2025-09-04T06:06:36.151Z');
INSERT INTO "sistemas_acueducto" ("id_sistema_acueducto", "nombre", "descripcion", "created_at", "updated_at") VALUES ('27', 'Agua de Lluvia', NULL, '2025-09-04T06:06:36.155Z', '2025-09-04T06:06:36.155Z');
INSERT INTO "sistemas_acueducto" ("id_sistema_acueducto", "nombre", "descripcion", "created_at", "updated_at") VALUES ('29', 'Carro Tanque', NULL, '2025-09-04T06:06:36.159Z', '2025-09-04T06:06:36.159Z');

-- Tabla: sistemas_acueductos
DROP TABLE IF EXISTS "sistemas_acueductos" CASCADE;
CREATE TABLE sistemas_acueductos (id_sistema BIGINT NOT NULL, descripcion VARCHAR(100) NOT NULL, activo BOOLEAN, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para sistemas_acueductos
INSERT INTO "sistemas_acueductos" ("id_sistema", "descripcion", "activo", "created_at", "updated_at") VALUES ('1', 'Acueducto Municipal', true, '2025-09-29T22:05:27.558Z', '2025-09-29T22:05:27.558Z');
INSERT INTO "sistemas_acueductos" ("id_sistema", "descripcion", "activo", "created_at", "updated_at") VALUES ('2', 'Pozo Propio', true, '2025-09-29T22:05:27.561Z', '2025-09-29T22:05:27.561Z');
INSERT INTO "sistemas_acueductos" ("id_sistema", "descripcion", "activo", "created_at", "updated_at") VALUES ('3', 'Agua Lluvia', true, '2025-09-29T22:05:27.563Z', '2025-09-29T22:05:27.563Z');
INSERT INTO "sistemas_acueductos" ("id_sistema", "descripcion", "activo", "created_at", "updated_at") VALUES ('4', 'Carrotanque', true, '2025-09-29T22:05:27.564Z', '2025-09-29T22:05:27.564Z');
INSERT INTO "sistemas_acueductos" ("id_sistema", "descripcion", "activo", "created_at", "updated_at") VALUES ('5', 'Nacimiento', true, '2025-09-29T22:05:27.565Z', '2025-09-29T22:05:27.565Z');
INSERT INTO "sistemas_acueductos" ("id_sistema", "descripcion", "activo", "created_at", "updated_at") VALUES ('6', 'Otro', true, '2025-09-29T22:05:27.567Z', '2025-09-29T22:05:27.567Z');

-- Tabla: situaciones_civiles
DROP TABLE IF EXISTS "situaciones_civiles" CASCADE;
CREATE TABLE situaciones_civiles (id_situacion_civil INTEGER NOT NULL, nombre VARCHAR(100) NOT NULL, descripcion TEXT, codigo VARCHAR(10), orden INTEGER, activo BOOLEAN NOT NULL, createdAt TIMESTAMPTZ NOT NULL, updatedAt TIMESTAMPTZ NOT NULL, fechaEliminacion TIMESTAMPTZ);

-- Datos para situaciones_civiles
INSERT INTO "situaciones_civiles" ("id_situacion_civil", "nombre", "descripcion", "codigo", "orden", "activo", "createdAt", "updatedAt", "fechaEliminacion") VALUES (1, 'Soltero(a)', 'Persona que no ha contraído matrimonio', 'SOL', 1, true, '2025-09-04T20:17:08.310Z', '2025-09-04T20:17:08.310Z', NULL);

-- Tabla: tallas
DROP TABLE IF EXISTS "tallas" CASCADE;
CREATE TABLE tallas (id_talla BIGINT NOT NULL, tipo_prenda VARCHAR(20) NOT NULL, talla VARCHAR(20) NOT NULL, descripcion TEXT, genero VARCHAR(20) NOT NULL, equivalencia_numerica INTEGER, activo BOOLEAN NOT NULL, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Tabla: tipo_identificacion
DROP TABLE IF EXISTS "tipo_identificacion" CASCADE;
CREATE TABLE tipo_identificacion (id_tipo_identificacion BIGINT NOT NULL, descripcion VARCHAR(255) NOT NULL, codigo VARCHAR(10) NOT NULL);

-- Tabla: tipos_aguas_residuales
DROP TABLE IF EXISTS "tipos_aguas_residuales" CASCADE;
CREATE TABLE tipos_aguas_residuales (id_tipo_aguas_residuales BIGINT NOT NULL, nombre VARCHAR(100) NOT NULL, descripcion VARCHAR(200), activo BOOLEAN, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para tipos_aguas_residuales
INSERT INTO "tipos_aguas_residuales" ("id_tipo_aguas_residuales", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('1', 'Alcantarillado', 'Conectado a red de alcantarillado municipal', true, '2025-09-29T22:05:27.615Z', '2025-09-29T22:05:27.615Z');
INSERT INTO "tipos_aguas_residuales" ("id_tipo_aguas_residuales", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('2', 'Pozo Séptico', 'Sistema de tratamiento individual', true, '2025-09-29T22:05:27.623Z', '2025-09-29T22:05:27.623Z');
INSERT INTO "tipos_aguas_residuales" ("id_tipo_aguas_residuales", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('3', 'Letrina', 'Sistema básico de saneamiento', true, '2025-09-29T22:05:27.627Z', '2025-09-29T22:05:27.627Z');
INSERT INTO "tipos_aguas_residuales" ("id_tipo_aguas_residuales", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('4', 'Campo Abierto', 'Sin sistema de tratamiento', true, '2025-09-29T22:05:27.629Z', '2025-09-29T22:05:27.629Z');
INSERT INTO "tipos_aguas_residuales" ("id_tipo_aguas_residuales", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('5', 'Río/Quebrada', 'Descarga directa a fuente hídrica', true, '2025-09-29T22:05:27.630Z', '2025-09-29T22:05:27.630Z');
INSERT INTO "tipos_aguas_residuales" ("id_tipo_aguas_residuales", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('6', 'Otro', 'Otro sistema no especificado', true, '2025-09-29T22:05:27.632Z', '2025-09-29T22:05:27.632Z');

-- Tabla: tipos_disposicion_basura
DROP TABLE IF EXISTS "tipos_disposicion_basura" CASCADE;
CREATE TABLE tipos_disposicion_basura (id_tipo_disposicion_basura BIGINT NOT NULL, nombre VARCHAR(255) NOT NULL, descripcion TEXT, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para tipos_disposicion_basura
INSERT INTO "tipos_disposicion_basura" ("id_tipo_disposicion_basura", "nombre", "descripcion", "created_at", "updated_at") VALUES ('1', 'Recolección Pública', 'Servicio municipal de recolección', '2025-09-04T19:09:22.979Z', '2025-09-04T19:09:22.979Z');
INSERT INTO "tipos_disposicion_basura" ("id_tipo_disposicion_basura", "nombre", "descripcion", "created_at", "updated_at") VALUES ('2', 'Quema', 'Quema de residuos', '2025-09-04T19:09:22.983Z', '2025-09-04T19:09:22.983Z');
INSERT INTO "tipos_disposicion_basura" ("id_tipo_disposicion_basura", "nombre", "descripcion", "created_at", "updated_at") VALUES ('3', 'Entierro', 'Enterrar los residuos', '2025-09-04T19:09:22.986Z', '2025-09-04T19:09:22.986Z');
INSERT INTO "tipos_disposicion_basura" ("id_tipo_disposicion_basura", "nombre", "descripcion", "created_at", "updated_at") VALUES ('4', 'Reciclaje', 'Separación y reciclaje', '2025-09-04T19:09:22.989Z', '2025-09-04T19:09:22.989Z');
INSERT INTO "tipos_disposicion_basura" ("id_tipo_disposicion_basura", "nombre", "descripcion", "created_at", "updated_at") VALUES ('5', 'Compostaje', 'Compostaje de orgánicos', '2025-09-04T19:09:22.993Z', '2025-09-04T19:09:22.993Z');
INSERT INTO "tipos_disposicion_basura" ("id_tipo_disposicion_basura", "nombre", "descripcion", "created_at", "updated_at") VALUES ('6', 'Botadero', 'Disposición en botadero', '2025-09-04T19:09:22.997Z', '2025-09-04T19:09:22.997Z');
INSERT INTO "tipos_disposicion_basura" ("id_tipo_disposicion_basura", "nombre", "descripcion", "created_at", "updated_at") VALUES ('7', 'Separación por Colores', 'Separación clasificada por colores', '2025-09-04T19:09:23.001Z', '2025-09-04T19:09:23.001Z');
INSERT INTO "tipos_disposicion_basura" ("id_tipo_disposicion_basura", "nombre", "descripcion", "created_at", "updated_at") VALUES ('8', 'Otro', 'Otro método no especificado', '2025-09-04T19:09:23.004Z', '2025-09-04T19:09:23.004Z');

-- Tabla: tipos_identificacion
DROP TABLE IF EXISTS "tipos_identificacion" CASCADE;
CREATE TABLE tipos_identificacion (id_tipo_identificacion BIGINT NOT NULL, nombre VARCHAR(255) NOT NULL, codigo VARCHAR(10) NOT NULL, descripcion TEXT, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para tipos_identificacion
INSERT INTO "tipos_identificacion" ("id_tipo_identificacion", "nombre", "codigo", "descripcion", "created_at", "updated_at") VALUES ('1', 'Cédula de Ciudadanía', 'CC', 'Cédula de Ciudadanía', '2025-09-04T21:48:57.451Z', '2025-09-04T21:48:57.451Z');

-- Tabla: tipos_vivienda
DROP TABLE IF EXISTS "tipos_vivienda" CASCADE;
CREATE TABLE tipos_vivienda (id_tipo_vivienda BIGINT NOT NULL, nombre VARCHAR(255) NOT NULL, descripcion VARCHAR(255), activo BOOLEAN NOT NULL, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para tipos_vivienda
INSERT INTO "tipos_vivienda" ("id_tipo_vivienda", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('1', 'Casa', 'Vivienda tipo casa', true, '2025-09-04T19:09:23.009Z', '2025-09-04T19:09:23.009Z');
INSERT INTO "tipos_vivienda" ("id_tipo_vivienda", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('2', 'Apartamento', 'Vivienda tipo apartamento', true, '2025-09-04T19:09:23.012Z', '2025-09-04T19:09:23.012Z');
INSERT INTO "tipos_vivienda" ("id_tipo_vivienda", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('3', 'Finca', 'Vivienda rural tipo finca', true, '2025-09-04T19:09:23.015Z', '2025-09-04T19:09:23.015Z');
INSERT INTO "tipos_vivienda" ("id_tipo_vivienda", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('4', 'Rancho', 'Vivienda tipo rancho', true, '2025-09-04T19:09:23.018Z', '2025-09-04T19:09:23.018Z');
INSERT INTO "tipos_vivienda" ("id_tipo_vivienda", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('5', 'Inquilinato', 'Vivienda en inquilinato', true, '2025-09-04T19:09:23.022Z', '2025-09-04T19:09:23.022Z');
INSERT INTO "tipos_vivienda" ("id_tipo_vivienda", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('6', 'Otro', 'Otro tipo de vivienda', true, '2025-09-04T19:09:23.025Z', '2025-09-04T19:09:23.025Z');

-- Tabla: tipos_viviendas
DROP TABLE IF EXISTS "tipos_viviendas" CASCADE;
CREATE TABLE tipos_viviendas (id_tipo BIGINT NOT NULL, descripcion VARCHAR(100) NOT NULL, activo BOOLEAN, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para tipos_viviendas
INSERT INTO "tipos_viviendas" ("id_tipo", "descripcion", "activo", "created_at", "updated_at") VALUES ('1', 'Casa Propia', true, '2025-09-29T22:05:27.571Z', '2025-09-29T22:05:27.571Z');
INSERT INTO "tipos_viviendas" ("id_tipo", "descripcion", "activo", "created_at", "updated_at") VALUES ('2', 'Casa Familiar', true, '2025-09-29T22:05:27.575Z', '2025-09-29T22:05:27.575Z');
INSERT INTO "tipos_viviendas" ("id_tipo", "descripcion", "activo", "created_at", "updated_at") VALUES ('3', 'Casa Arrendada', true, '2025-09-29T22:05:27.576Z', '2025-09-29T22:05:27.576Z');
INSERT INTO "tipos_viviendas" ("id_tipo", "descripcion", "activo", "created_at", "updated_at") VALUES ('4', 'Apartamento', true, '2025-09-29T22:05:27.579Z', '2025-09-29T22:05:27.579Z');
INSERT INTO "tipos_viviendas" ("id_tipo", "descripcion", "activo", "created_at", "updated_at") VALUES ('5', 'Cuarto', true, '2025-09-29T22:05:27.581Z', '2025-09-29T22:05:27.581Z');
INSERT INTO "tipos_viviendas" ("id_tipo", "descripcion", "activo", "created_at", "updated_at") VALUES ('6', 'Otro', true, '2025-09-29T22:05:27.583Z', '2025-09-29T22:05:27.583Z');

-- Tabla: usuarios
DROP TABLE IF EXISTS "usuarios" CASCADE;
CREATE TABLE usuarios (id UUID NOT NULL, correo_electronico VARCHAR(255) NOT NULL, contrasena VARCHAR(255) NOT NULL, primer_nombre VARCHAR(100), segundo_nombre VARCHAR(100), primer_apellido VARCHAR(100), segundo_apellido VARCHAR(100), numero_documento VARCHAR(20), telefono VARCHAR(20), activo BOOLEAN, fecha_ultimo_acceso TIMESTAMPTZ, intentos_fallidos INTEGER, bloqueado_hasta TIMESTAMPTZ, token_recuperacion VARCHAR(255), token_expiracion TIMESTAMPTZ, email_verificado BOOLEAN, token_verificacion_email VARCHAR(255), fecha_verificacion_email TIMESTAMPTZ, expira_token_reset TIMESTAMPTZ, refresh_token TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ);

-- Datos para usuarios
INSERT INTO "usuarios" ("id", "correo_electronico", "contrasena", "primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido", "numero_documento", "telefono", "activo", "fecha_ultimo_acceso", "intentos_fallidos", "bloqueado_hasta", "token_recuperacion", "token_expiracion", "email_verificado", "token_verificacion_email", "fecha_verificacion_email", "expira_token_reset", "refresh_token", "created_at", "updated_at") VALUES ('be39851d-fe07-4f95-adf3-25f2b90eace5', 'admin@parroquia.com', '$2b$10$PuiLUJFhcFYckanEnFpEvetIZ607EYNPxz3MdnC0qfvjyq5Xxqui6', 'Administrador', NULL, NULL, NULL, NULL, NULL, true, '2025-09-29T23:04:54.984Z', 0, NULL, NULL, NULL, true, NULL, NULL, NULL, NULL, '2025-09-29T22:43:00.525Z', '2025-09-29T23:04:54.986Z');

-- Tabla: usuarios_roles
DROP TABLE IF EXISTS "usuarios_roles" CASCADE;
CREATE TABLE usuarios_roles (id INTEGER NOT NULL, usuario_id UUID, rol_id INTEGER, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ);

-- Datos para usuarios_roles
INSERT INTO "usuarios_roles" ("id", "usuario_id", "rol_id", "created_at", "updated_at") VALUES (2, 'be39851d-fe07-4f95-adf3-25f2b90eace5', 1, '2025-09-29T22:43:00.532Z', '2025-09-29T22:43:00.532Z');

-- Tabla: veredas
DROP TABLE IF EXISTS "veredas" CASCADE;
CREATE TABLE veredas (id_vereda BIGINT NOT NULL, nombre VARCHAR(100) NOT NULL, id_sector BIGINT, activo BOOLEAN, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);

-- Datos para veredas
INSERT INTO "veredas" ("id_vereda", "nombre", "id_sector", "activo", "created_at", "updated_at") VALUES ('1', 'La Esperanza', '1', true, '2025-09-29T22:05:27.545Z', '2025-09-29T22:05:27.545Z');
INSERT INTO "veredas" ("id_vereda", "nombre", "id_sector", "activo", "created_at", "updated_at") VALUES ('2', 'El Progreso', '1', true, '2025-09-29T22:05:27.548Z', '2025-09-29T22:05:27.548Z');
INSERT INTO "veredas" ("id_vereda", "nombre", "id_sector", "activo", "created_at", "updated_at") VALUES ('3', 'San Antonio', '2', true, '2025-09-29T22:05:27.549Z', '2025-09-29T22:05:27.549Z');
INSERT INTO "veredas" ("id_vereda", "nombre", "id_sector", "activo", "created_at", "updated_at") VALUES ('4', 'Las Flores', '3', true, '2025-09-29T22:05:27.554Z', '2025-09-29T22:05:27.554Z');


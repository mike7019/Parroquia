-- Backup de parroquia_db
-- Fecha: 2025-09-29T19:14:56.232Z
-- Generado por backup-database.js

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- Tabla: SequelizeMeta
DROP TABLE IF EXISTS "SequelizeMeta" CASCADE;
CREATE TABLE "SequelizeMeta" (
  "name" CHARACTER VARYING NOT NULL
);

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
CREATE TABLE "comunidades_culturales" (
  "id_comunidad_cultural" BIGINT NOT NULL DEFAULT nextval('comunidades_culturales_id_comunidad_cultural_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "descripcion" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para comunidades_culturales
INSERT INTO "comunidades_culturales" ("id_comunidad_cultural", "nombre", "descripcion", "activo", "createdAt", "updatedAt") VALUES ('1', 'Afrodescendiente', 'Comunidad de personas afrodescendientes', true, '2025-09-04T20:16:22.126Z', '2025-09-04T20:16:22.126Z');

-- Tabla: departamentos
DROP TABLE IF EXISTS "departamentos" CASCADE;
CREATE TABLE "departamentos" (
  "id_departamento" BIGINT NOT NULL DEFAULT nextval('departamentos_id_departamento_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "codigo" CHARACTER VARYING,
  "activo" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para departamentos
INSERT INTO "departamentos" ("id_departamento", "nombre", "codigo", "activo", "created_at", "updated_at") VALUES ('1', 'Antioquia', '05', true, '2025-09-29T18:47:07.463Z', '2025-09-29T18:47:07.463Z');
INSERT INTO "departamentos" ("id_departamento", "nombre", "codigo", "activo", "created_at", "updated_at") VALUES ('2', 'Cundinamarca', '25', true, '2025-09-29T18:47:07.471Z', '2025-09-29T18:47:07.471Z');
INSERT INTO "departamentos" ("id_departamento", "nombre", "codigo", "activo", "created_at", "updated_at") VALUES ('3', 'Valle del Cauca', '76', true, '2025-09-29T18:47:07.474Z', '2025-09-29T18:47:07.474Z');

-- Tabla: destrezas
DROP TABLE IF EXISTS "destrezas" CASCADE;
CREATE TABLE "destrezas" (
  "id_destreza" BIGINT NOT NULL DEFAULT nextval('destrezas_id_destreza_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: difuntos_familia
DROP TABLE IF EXISTS "difuntos_familia" CASCADE;
CREATE TABLE "difuntos_familia" (
  "id_difunto" BIGINT NOT NULL DEFAULT nextval('difuntos_familia_id_difunto_seq'::regclass),
  "nombre_completo" CHARACTER VARYING NOT NULL,
  "fecha_fallecimiento" DATE NOT NULL,
  "observaciones" TEXT,
  "id_familia_familias" BIGINT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "id_sexo" BIGINT,
  "id_parentesco" BIGINT,
  "causa_fallecimiento" TEXT
);

-- Datos para difuntos_familia
INSERT INTO "difuntos_familia" ("id_difunto", "nombre_completo", "fecha_fallecimiento", "observaciones", "id_familia_familias", "createdAt", "updatedAt", "id_sexo", "id_parentesco", "causa_fallecimiento") VALUES ('1', 'Pedro Antonio Los Alvarez', '2020-05-15T05:00:00.000Z', 'Enfermedad cardiovascular', NULL, '2025-09-11T05:16:42.952Z', '2025-09-11T05:16:42.953Z', '1', '2', 'Enfermedad cardiovascular');
INSERT INTO "difuntos_familia" ("id_difunto", "nombre_completo", "fecha_fallecimiento", "observaciones", "id_familia_familias", "createdAt", "updatedAt", "id_sexo", "id_parentesco", "causa_fallecimiento") VALUES ('2', 'Pecas Garzon Rodriguez', '2020-05-15T05:00:00.000Z', 'Enfermedad cardiovascular', NULL, '2025-09-11T05:23:25.674Z', '2025-09-11T05:23:25.674Z', '1', '2', 'Enfermedad cardiovascular');

-- Tabla: encuestas
DROP TABLE IF EXISTS "encuestas" CASCADE;
CREATE TABLE "encuestas" (
  "id_encuesta" BIGINT NOT NULL DEFAULT nextval('encuestas_id_encuesta_seq'::regclass),
  "id_parroquia" BIGINT NOT NULL,
  "id_municipio" BIGINT NOT NULL,
  "fecha" DATE NOT NULL,
  "id_sector" BIGINT NOT NULL,
  "id_vereda" BIGINT NOT NULL,
  "observaciones" TEXT,
  "tratamiento_datos" BOOLEAN NOT NULL DEFAULT false,
  "firma" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: enfermedades
DROP TABLE IF EXISTS "enfermedades" CASCADE;
CREATE TABLE "enfermedades" (
  "id_enfermedad" BIGINT NOT NULL DEFAULT nextval('enfermedades_id_enfermedad_seq'::regclass),
  "descripcion" CHARACTER VARYING NOT NULL,
  "activo" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para enfermedades
INSERT INTO "enfermedades" ("id_enfermedad", "descripcion", "activo", "created_at", "updated_at") VALUES ('1', 'Diabetes', true, '2025-09-29T18:47:07.623Z', '2025-09-29T18:47:07.623Z');
INSERT INTO "enfermedades" ("id_enfermedad", "descripcion", "activo", "created_at", "updated_at") VALUES ('2', 'Hipertensión', true, '2025-09-29T18:47:07.627Z', '2025-09-29T18:47:07.627Z');
INSERT INTO "enfermedades" ("id_enfermedad", "descripcion", "activo", "created_at", "updated_at") VALUES ('3', 'Cardiopatía', true, '2025-09-29T18:47:07.629Z', '2025-09-29T18:47:07.629Z');
INSERT INTO "enfermedades" ("id_enfermedad", "descripcion", "activo", "created_at", "updated_at") VALUES ('4', 'Asma', true, '2025-09-29T18:47:07.631Z', '2025-09-29T18:47:07.631Z');
INSERT INTO "enfermedades" ("id_enfermedad", "descripcion", "activo", "created_at", "updated_at") VALUES ('5', 'Artritis', true, '2025-09-29T18:47:07.636Z', '2025-09-29T18:47:07.636Z');
INSERT INTO "enfermedades" ("id_enfermedad", "descripcion", "activo", "created_at", "updated_at") VALUES ('6', 'Otra', true, '2025-09-29T18:47:07.639Z', '2025-09-29T18:47:07.639Z');

-- Tabla: estados_civiles
DROP TABLE IF EXISTS "estados_civiles" CASCADE;
CREATE TABLE "estados_civiles" (
  "id_estado" BIGINT NOT NULL DEFAULT nextval('estados_civiles_id_estado_seq'::regclass),
  "descripcion" CHARACTER VARYING NOT NULL,
  "activo" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para estados_civiles
INSERT INTO "estados_civiles" ("id_estado", "descripcion", "activo", "created_at", "updated_at") VALUES ('1', 'Soltero(a)', true, '2025-09-29T18:47:07.598Z', '2025-09-29T18:47:07.598Z');
INSERT INTO "estados_civiles" ("id_estado", "descripcion", "activo", "created_at", "updated_at") VALUES ('2', 'Casado(a)', true, '2025-09-29T18:47:07.604Z', '2025-09-29T18:47:07.604Z');
INSERT INTO "estados_civiles" ("id_estado", "descripcion", "activo", "created_at", "updated_at") VALUES ('3', 'Unión Libre', true, '2025-09-29T18:47:07.607Z', '2025-09-29T18:47:07.607Z');
INSERT INTO "estados_civiles" ("id_estado", "descripcion", "activo", "created_at", "updated_at") VALUES ('4', 'Divorciado(a)', true, '2025-09-29T18:47:07.610Z', '2025-09-29T18:47:07.610Z');
INSERT INTO "estados_civiles" ("id_estado", "descripcion", "activo", "created_at", "updated_at") VALUES ('5', 'Viudo(a)', true, '2025-09-29T18:47:07.612Z', '2025-09-29T18:47:07.612Z');
INSERT INTO "estados_civiles" ("id_estado", "descripcion", "activo", "created_at", "updated_at") VALUES ('6', 'Separado(a)', true, '2025-09-29T18:47:07.615Z', '2025-09-29T18:47:07.615Z');

-- Tabla: familia_aguas_residuales
DROP TABLE IF EXISTS "familia_aguas_residuales" CASCADE;
CREATE TABLE "familia_aguas_residuales" (
  "id" INTEGER NOT NULL DEFAULT nextval('familia_aguas_residuales_id_seq'::regclass),
  "id_familia" INTEGER NOT NULL,
  "tipo_tratamiento" CHARACTER VARYING NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: familia_disposicion_basura
DROP TABLE IF EXISTS "familia_disposicion_basura" CASCADE;
CREATE TABLE "familia_disposicion_basura" (
  "id" BIGINT NOT NULL DEFAULT nextval('familia_disposicion_basura_id_seq'::regclass),
  "id_familia" BIGINT NOT NULL,
  "id_tipo_disposicion_basura" BIGINT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: familia_disposicion_basuras
DROP TABLE IF EXISTS "familia_disposicion_basuras" CASCADE;
CREATE TABLE "familia_disposicion_basuras" (
  "id" INTEGER NOT NULL DEFAULT nextval('familia_disposicion_basuras_id_seq'::regclass),
  "id_familia" INTEGER NOT NULL,
  "disposicion" CHARACTER VARYING NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: familia_sistema_acueducto
DROP TABLE IF EXISTS "familia_sistema_acueducto" CASCADE;
CREATE TABLE "familia_sistema_acueducto" (
  "id_familia" BIGINT NOT NULL,
  "id_sistema_acueducto" BIGINT NOT NULL,
  "id" BIGINT NOT NULL DEFAULT nextval('familia_sistema_acueducto_id_seq'::regclass),
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: familia_sistema_acueductos
DROP TABLE IF EXISTS "familia_sistema_acueductos" CASCADE;
CREATE TABLE "familia_sistema_acueductos" (
  "id" BIGINT NOT NULL DEFAULT nextval('familia_sistema_acueductos_id_seq'::regclass),
  "id_familia" BIGINT NOT NULL,
  "id_sistema_acueducto" BIGINT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: familia_sistema_aguas_residuales
DROP TABLE IF EXISTS "familia_sistema_aguas_residuales" CASCADE;
CREATE TABLE "familia_sistema_aguas_residuales" (
  "id" BIGINT NOT NULL DEFAULT nextval('familia_sistema_aguas_residuales_id_seq'::regclass),
  "id_familia" BIGINT NOT NULL,
  "id_tipo_aguas_residuales" BIGINT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: familia_tipo_vivienda
DROP TABLE IF EXISTS "familia_tipo_vivienda" CASCADE;
CREATE TABLE "familia_tipo_vivienda" (
  "id_familia" BIGINT NOT NULL,
  "id_tipo_vivienda" BIGINT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: familia_tipo_viviendas
DROP TABLE IF EXISTS "familia_tipo_viviendas" CASCADE;
CREATE TABLE "familia_tipo_viviendas" (
  "id" BIGINT NOT NULL DEFAULT nextval('familia_tipo_viviendas_id_seq'::regclass),
  "id_familia" BIGINT NOT NULL,
  "id_tipo_vivienda" BIGINT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: familias
DROP TABLE IF EXISTS "familias" CASCADE;
CREATE TABLE "familias" (
  "id_familia" BIGINT NOT NULL DEFAULT nextval('familias_id_familia_seq'::regclass),
  "apellido_familiar" CHARACTER VARYING,
  "sector" CHARACTER VARYING,
  "direccion_familia" CHARACTER VARYING,
  "numero_contacto" CHARACTER VARYING,
  "telefono" CHARACTER VARYING,
  "email" CHARACTER VARYING,
  "tamaño_familia" INTEGER DEFAULT 0,
  "tipo_vivienda" CHARACTER VARYING,
  "estado_encuesta" CHARACTER VARYING DEFAULT 'pendiente'::character varying,
  "numero_encuestas" INTEGER DEFAULT 0,
  "fecha_ultima_encuesta" TIMESTAMP WITH TIME ZONE,
  "codigo_familia" CHARACTER VARYING,
  "tutor_responsable" BOOLEAN DEFAULT false,
  "id_municipio" BIGINT,
  "id_vereda" BIGINT,
  "id_sector" BIGINT,
  "comunionEnCasa" BOOLEAN DEFAULT false,
  "numero_contrato_epm" CHARACTER VARYING,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: municipios
DROP TABLE IF EXISTS "municipios" CASCADE;
CREATE TABLE "municipios" (
  "id_municipio" BIGINT NOT NULL DEFAULT nextval('municipios_id_municipio_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "codigo" CHARACTER VARYING,
  "id_departamento" BIGINT,
  "activo" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para municipios
INSERT INTO "municipios" ("id_municipio", "nombre", "codigo", "id_departamento", "activo", "created_at", "updated_at") VALUES ('1', 'Medellín', '05001', '1', true, '2025-09-29T18:47:07.480Z', '2025-09-29T18:47:07.480Z');
INSERT INTO "municipios" ("id_municipio", "nombre", "codigo", "id_departamento", "activo", "created_at", "updated_at") VALUES ('2', 'Envigado', '05266', '1', true, '2025-09-29T18:47:07.486Z', '2025-09-29T18:47:07.486Z');
INSERT INTO "municipios" ("id_municipio", "nombre", "codigo", "id_departamento", "activo", "created_at", "updated_at") VALUES ('3', 'Bogotá D.C.', '25001', '2', true, '2025-09-29T18:47:07.490Z', '2025-09-29T18:47:07.490Z');
INSERT INTO "municipios" ("id_municipio", "nombre", "codigo", "id_departamento", "activo", "created_at", "updated_at") VALUES ('4', 'Cali', '76001', '3', true, '2025-09-29T18:47:07.493Z', '2025-09-29T18:47:07.493Z');

-- Tabla: niveles_educativos
DROP TABLE IF EXISTS "niveles_educativos" CASCADE;
CREATE TABLE "niveles_educativos" (
  "id_niveles_educativos" BIGINT NOT NULL DEFAULT nextval('niveles_educativos_id_niveles_educativos_seq'::regclass),
  "nivel" CHARACTER VARYING NOT NULL,
  "descripcion" TEXT,
  "orden_nivel" INTEGER,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "deletedAt" TIMESTAMP WITH TIME ZONE
);

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
CREATE TABLE "parentescos" (
  "id_parentesco" BIGINT NOT NULL DEFAULT nextval('parentescos_id_parentesco_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "descripcion" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

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
CREATE TABLE "parroquia" (
  "id_parroquia" BIGINT NOT NULL DEFAULT nextval('parroquia_id_parroquia_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "id_municipio" BIGINT NOT NULL,
  "direccion" CHARACTER VARYING,
  "telefono" CHARACTER VARYING,
  "email" CHARACTER VARYING
);

-- Datos para parroquia
INSERT INTO "parroquia" ("id_parroquia", "nombre", "id_municipio", "direccion", "telefono", "email") VALUES ('2', 'Parroquia Prueba Completa', '1', 'Carrera 123 # 45-67', '+57 4 555-1234', 'completa@parroquia.com');
INSERT INTO "parroquia" ("id_parroquia", "nombre", "id_municipio", "direccion", "telefono", "email") VALUES ('3', 'Parroquia San Loro', '1', 'Carrera 50 # 45-32', '+57 4 123-4567', 'contacto@parroquiasanjose.com');
INSERT INTO "parroquia" ("id_parroquia", "nombre", "id_municipio", "direccion", "telefono", "email") VALUES ('4', 'Parroquia San Juan de Dios', '1', 'Carrera 50 # 45-32', '+57 4 123-4567', 'contacto@parroquiasanjose.com');

-- Tabla: parroquias
DROP TABLE IF EXISTS "parroquias" CASCADE;
CREATE TABLE "parroquias" (
  "id_parroquia" BIGINT NOT NULL DEFAULT nextval('parroquias_id_parroquia_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "id_municipio" BIGINT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para parroquias
INSERT INTO "parroquias" ("id_parroquia", "nombre", "id_municipio", "created_at", "updated_at") VALUES ('1', 'San José', '1', '2025-09-29T18:47:07.494Z', '2025-09-29T18:47:07.494Z');
INSERT INTO "parroquias" ("id_parroquia", "nombre", "id_municipio", "created_at", "updated_at") VALUES ('2', 'Sagrado Corazón', '1', '2025-09-29T18:47:07.498Z', '2025-09-29T18:47:07.498Z');
INSERT INTO "parroquias" ("id_parroquia", "nombre", "id_municipio", "created_at", "updated_at") VALUES ('3', 'Nuestra Señora de Fátima', '2', '2025-09-29T18:47:07.503Z', '2025-09-29T18:47:07.503Z');
INSERT INTO "parroquias" ("id_parroquia", "nombre", "id_municipio", "created_at", "updated_at") VALUES ('4', 'La Inmaculada', '3', '2025-09-29T18:47:07.506Z', '2025-09-29T18:47:07.506Z');
INSERT INTO "parroquias" ("id_parroquia", "nombre", "id_municipio", "created_at", "updated_at") VALUES ('5', 'San Francisco', '4', '2025-09-29T18:47:07.510Z', '2025-09-29T18:47:07.510Z');

-- Tabla: persona_destreza
DROP TABLE IF EXISTS "persona_destreza" CASCADE;
CREATE TABLE "persona_destreza" (
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "id_destrezas_destrezas" BIGINT NOT NULL,
  "id_personas_personas" BIGINT NOT NULL
);

-- Tabla: persona_enfermedad
DROP TABLE IF EXISTS "persona_enfermedad" CASCADE;
CREATE TABLE "persona_enfermedad" (
  "id_persona" BIGINT NOT NULL,
  "id_enfermedad" BIGINT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: personas
DROP TABLE IF EXISTS "personas" CASCADE;
CREATE TABLE "personas" (
  "id_personas" BIGINT NOT NULL DEFAULT nextval('personas_id_personas_seq'::regclass),
  "primer_nombre" CHARACTER VARYING,
  "segundo_nombre" CHARACTER VARYING,
  "primer_apellido" CHARACTER VARYING,
  "segundo_apellido" CHARACTER VARYING,
  "id_tipo_identificacion_tipo_identificacion" BIGINT,
  "identificacion" CHARACTER VARYING,
  "telefono" CHARACTER VARYING,
  "correo_electronico" CHARACTER VARYING,
  "fecha_nacimiento" TIMESTAMP WITH TIME ZONE,
  "direccion" CHARACTER VARYING,
  "id_familia_familias" BIGINT,
  "id_estado_civil_estado_civil" BIGINT,
  "estudios" CHARACTER VARYING,
  "en_que_eres_lider" CHARACTER VARYING,
  "necesidad_enfermo" CHARACTER VARYING,
  "id_profesion" BIGINT,
  "id_sexo" BIGINT,
  "talla_camisa" CHARACTER VARYING,
  "talla_pantalon" CHARACTER VARYING,
  "talla_zapato" CHARACTER VARYING,
  "id_familia" BIGINT,
  "id_parroquia" BIGINT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: profesiones
DROP TABLE IF EXISTS "profesiones" CASCADE;
CREATE TABLE "profesiones" (
  "id_profesion" BIGINT NOT NULL DEFAULT nextval('profesiones_id_profesion_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "descripcion" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para profesiones
INSERT INTO "profesiones" ("id_profesion", "nombre", "descripcion", "created_at", "updated_at") VALUES ('1', 'Ingeniero', 'Profesión de Ingeniería', '2025-09-04T22:48:50.436Z', '2025-09-04T22:48:50.436Z');
INSERT INTO "profesiones" ("id_profesion", "nombre", "descripcion", "created_at", "updated_at") VALUES ('2', 'Contador', 'Profesión de Contaduría', '2025-09-04T22:48:50.436Z', '2025-09-04T22:48:50.436Z');

-- Tabla: roles
DROP TABLE IF EXISTS "roles" CASCADE;
CREATE TABLE "roles" (
  "id" UUID NOT NULL,
  "nombre" CHARACTER VARYING NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para roles
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('8dc7484f-7a0e-43ba-9337-0feea3a1b9ba', 'admin', '2025-09-04T19:09:47.510Z', '2025-09-04T19:09:47.510Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('18d1054d-85d4-4f92-a214-eb9a5d05f677', 'Administrador', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('2a122c2a-2aaf-458a-b9fe-914c79df1ff7', 'Super Administrador', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('4bad7653-2099-4c20-8864-7f939adddb39', 'Párroco', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('36e36874-8ee2-458f-a566-02d538974a30', 'Vicario', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('7b242b3d-5a86-45d9-8a34-2e5ff49d9de4', 'Coordinador General', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('a97ee02f-dc57-43f9-8c85-03257deaefe5', 'Secretario Parroquial', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('5845b4f8-76cf-47e0-944e-55de08b7abf0', 'Encuestador', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('62e75c80-8154-439c-b06b-1582d6e08b07', 'Supervisor de Campo', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('5a1356c1-0d44-4951-a5f4-9f37c1a68c75', 'Líder Comunitario', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('68745906-29f6-4af0-9bcd-b4cd716f5f53', 'Agente Pastoral', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('96ee6a4b-dc4e-405d-a94f-053f47f242f7', 'Consultor', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('633f5790-713e-4451-a2c7-98230f00532e', 'Analista de Datos', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('e50e30a1-abae-4739-8b63-54f9c45d6170', 'Auditor', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('29da26e4-cd2b-402c-95fd-eb65be51b42e', 'Coordinador de Liturgia', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('f1f91a7e-6685-4403-89c2-835d00848815', 'Coordinador de Catequesis', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('8b0b6a24-f454-4efe-8e3c-4051f5bc9b92', 'Coordinador de Juventud', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('dad297e2-da44-4765-b62c-6ed97eac5bf0', 'Coordinador de Caridad', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('0a458020-fa8b-4a69-8183-a51a3529f976', 'Coordinador de Familia', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('c4f8f102-1695-46d5-901e-2268d0345371', 'Ministro Extraordinario', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('29bf2e69-be36-4511-b350-9e403e96ef20', 'Soporte Técnico', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('886593c7-3d8f-420a-a91c-3fd85f1633f6', 'Operador de Sistema', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('63f50524-7c1d-4342-a9ed-49d6c0897dc5', 'Usuario', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');
INSERT INTO "roles" ("id", "nombre", "created_at", "updated_at") VALUES ('3fef83f9-0c57-4263-abd3-7865eab19d58', 'Invitado', '2025-09-04T19:46:38.120Z', '2025-09-04T19:46:38.120Z');

-- Tabla: sector
DROP TABLE IF EXISTS "sector" CASCADE;
CREATE TABLE "sector" (
  "id_sector" BIGINT NOT NULL DEFAULT nextval('sector_id_sector_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: sectores
DROP TABLE IF EXISTS "sectores" CASCADE;
CREATE TABLE "sectores" (
  "id_sector" BIGINT NOT NULL DEFAULT nextval('sectores_id_sector_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "id_parroquia" BIGINT,
  "activo" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para sectores
INSERT INTO "sectores" ("id_sector", "nombre", "id_parroquia", "activo", "created_at", "updated_at") VALUES ('1', 'Centro', '1', true, '2025-09-29T18:47:07.513Z', '2025-09-29T18:47:07.513Z');
INSERT INTO "sectores" ("id_sector", "nombre", "id_parroquia", "activo", "created_at", "updated_at") VALUES ('2', 'Norte', '1', true, '2025-09-29T18:47:07.517Z', '2025-09-29T18:47:07.517Z');
INSERT INTO "sectores" ("id_sector", "nombre", "id_parroquia", "activo", "created_at", "updated_at") VALUES ('3', 'Sur', '2', true, '2025-09-29T18:47:07.524Z', '2025-09-29T18:47:07.524Z');
INSERT INTO "sectores" ("id_sector", "nombre", "id_parroquia", "activo", "created_at", "updated_at") VALUES ('4', 'Occidental', '3', true, '2025-09-29T18:47:07.527Z', '2025-09-29T18:47:07.527Z');

-- Tabla: sexo
DROP TABLE IF EXISTS "sexo" CASCADE;
CREATE TABLE "sexo" (
  "id_sexo" BIGINT NOT NULL DEFAULT nextval('sexo_id_sexo_seq'::regclass),
  "descripcion" CHARACTER VARYING NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: sexos
DROP TABLE IF EXISTS "sexos" CASCADE;
CREATE TABLE "sexos" (
  "id_sexo" BIGINT NOT NULL DEFAULT nextval('sexos_id_sexo_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "codigo" CHARACTER VARYING NOT NULL,
  "descripcion" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para sexos
INSERT INTO "sexos" ("id_sexo", "nombre", "codigo", "descripcion", "created_at", "updated_at") VALUES ('1', 'Masculino', 'M', 'Sexo masculino', '2025-09-04T20:06:15.858Z', '2025-09-04T20:06:15.858Z');

-- Tabla: sistemas_acueducto
DROP TABLE IF EXISTS "sistemas_acueducto" CASCADE;
CREATE TABLE "sistemas_acueducto" (
  "id_sistema_acueducto" BIGINT NOT NULL DEFAULT nextval('sistemas_acueducto_id_sistema_acueducto_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "descripcion" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

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
CREATE TABLE "sistemas_acueductos" (
  "id_sistema" BIGINT NOT NULL DEFAULT nextval('sistemas_acueductos_id_sistema_seq'::regclass),
  "descripcion" CHARACTER VARYING NOT NULL,
  "activo" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para sistemas_acueductos
INSERT INTO "sistemas_acueductos" ("id_sistema", "descripcion", "activo", "created_at", "updated_at") VALUES ('1', 'Acueducto Municipal', true, '2025-09-29T18:47:07.546Z', '2025-09-29T18:47:07.546Z');
INSERT INTO "sistemas_acueductos" ("id_sistema", "descripcion", "activo", "created_at", "updated_at") VALUES ('2', 'Pozo Propio', true, '2025-09-29T18:47:07.552Z', '2025-09-29T18:47:07.552Z');
INSERT INTO "sistemas_acueductos" ("id_sistema", "descripcion", "activo", "created_at", "updated_at") VALUES ('3', 'Agua Lluvia', true, '2025-09-29T18:47:07.558Z', '2025-09-29T18:47:07.558Z');
INSERT INTO "sistemas_acueductos" ("id_sistema", "descripcion", "activo", "created_at", "updated_at") VALUES ('4', 'Carrotanque', true, '2025-09-29T18:47:07.561Z', '2025-09-29T18:47:07.561Z');
INSERT INTO "sistemas_acueductos" ("id_sistema", "descripcion", "activo", "created_at", "updated_at") VALUES ('5', 'Nacimiento', true, '2025-09-29T18:47:07.564Z', '2025-09-29T18:47:07.564Z');
INSERT INTO "sistemas_acueductos" ("id_sistema", "descripcion", "activo", "created_at", "updated_at") VALUES ('6', 'Otro', true, '2025-09-29T18:47:07.568Z', '2025-09-29T18:47:07.568Z');

-- Tabla: situaciones_civiles
DROP TABLE IF EXISTS "situaciones_civiles" CASCADE;
CREATE TABLE "situaciones_civiles" (
  "id_situacion_civil" INTEGER NOT NULL DEFAULT nextval('situaciones_civiles_id_situacion_civil_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "descripcion" TEXT,
  "codigo" CHARACTER VARYING,
  "orden" INTEGER DEFAULT 0,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "fechaEliminacion" TIMESTAMP WITH TIME ZONE
);

-- Datos para situaciones_civiles
INSERT INTO "situaciones_civiles" ("id_situacion_civil", "nombre", "descripcion", "codigo", "orden", "activo", "createdAt", "updatedAt", "fechaEliminacion") VALUES (1, 'Soltero(a)', 'Persona que no ha contraído matrimonio', 'SOL', 1, true, '2025-09-04T20:17:08.310Z', '2025-09-04T20:17:08.310Z', NULL);

-- Tabla: tallas
DROP TABLE IF EXISTS "tallas" CASCADE;
CREATE TABLE "tallas" (
  "id_talla" BIGINT NOT NULL DEFAULT nextval('tallas_id_talla_seq'::regclass),
  "tipo_prenda" CHARACTER VARYING NOT NULL,
  "talla" CHARACTER VARYING NOT NULL,
  "descripcion" TEXT,
  "genero" CHARACTER VARYING NOT NULL DEFAULT 'unisex'::character varying,
  "equivalencia_numerica" INTEGER,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: tipo_identificacion
DROP TABLE IF EXISTS "tipo_identificacion" CASCADE;
CREATE TABLE "tipo_identificacion" (
  "id_tipo_identificacion" BIGINT NOT NULL DEFAULT nextval('tipo_identificacion_id_tipo_identificacion_seq'::regclass),
  "descripcion" CHARACTER VARYING NOT NULL,
  "codigo" CHARACTER VARYING NOT NULL
);

-- Tabla: tipos_aguas_residuales
DROP TABLE IF EXISTS "tipos_aguas_residuales" CASCADE;
CREATE TABLE "tipos_aguas_residuales" (
  "id_tipo_aguas_residuales" BIGINT NOT NULL DEFAULT nextval('tipos_aguas_residuales_id_tipo_aguas_residuales_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "descripcion" CHARACTER VARYING,
  "activo" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para tipos_aguas_residuales
INSERT INTO "tipos_aguas_residuales" ("id_tipo_aguas_residuales", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('1', 'Alcantarillado', 'Conectado a red de alcantarillado municipal', true, '2025-09-29T18:47:07.642Z', '2025-09-29T18:47:07.642Z');
INSERT INTO "tipos_aguas_residuales" ("id_tipo_aguas_residuales", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('2', 'Pozo Séptico', 'Sistema de tratamiento individual', true, '2025-09-29T18:47:07.647Z', '2025-09-29T18:47:07.647Z');
INSERT INTO "tipos_aguas_residuales" ("id_tipo_aguas_residuales", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('3', 'Letrina', 'Sistema básico de saneamiento', true, '2025-09-29T18:47:07.651Z', '2025-09-29T18:47:07.651Z');
INSERT INTO "tipos_aguas_residuales" ("id_tipo_aguas_residuales", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('4', 'Campo Abierto', 'Sin sistema de tratamiento', true, '2025-09-29T18:47:07.656Z', '2025-09-29T18:47:07.656Z');
INSERT INTO "tipos_aguas_residuales" ("id_tipo_aguas_residuales", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('5', 'Río/Quebrada', 'Descarga directa a fuente hídrica', true, '2025-09-29T18:47:07.659Z', '2025-09-29T18:47:07.659Z');
INSERT INTO "tipos_aguas_residuales" ("id_tipo_aguas_residuales", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('6', 'Otro', 'Otro sistema no especificado', true, '2025-09-29T18:47:07.661Z', '2025-09-29T18:47:07.661Z');

-- Tabla: tipos_disposicion_basura
DROP TABLE IF EXISTS "tipos_disposicion_basura" CASCADE;
CREATE TABLE "tipos_disposicion_basura" (
  "id_tipo_disposicion_basura" BIGINT NOT NULL DEFAULT nextval('tipos_disposicion_basura_id_tipo_disposicion_basura_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "descripcion" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

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
CREATE TABLE "tipos_identificacion" (
  "id_tipo_identificacion" BIGINT NOT NULL DEFAULT nextval('tipos_identificacion_id_tipo_identificacion_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "codigo" CHARACTER VARYING NOT NULL,
  "descripcion" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para tipos_identificacion
INSERT INTO "tipos_identificacion" ("id_tipo_identificacion", "nombre", "codigo", "descripcion", "created_at", "updated_at") VALUES ('1', 'Cédula de Ciudadanía', 'CC', 'Cédula de Ciudadanía', '2025-09-04T21:48:57.451Z', '2025-09-04T21:48:57.451Z');

-- Tabla: tipos_vivienda
DROP TABLE IF EXISTS "tipos_vivienda" CASCADE;
CREATE TABLE "tipos_vivienda" (
  "id_tipo_vivienda" BIGINT NOT NULL DEFAULT nextval('tipos_vivienda_id_tipo_vivienda_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "descripcion" CHARACTER VARYING,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para tipos_vivienda
INSERT INTO "tipos_vivienda" ("id_tipo_vivienda", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('1', 'Casa', 'Vivienda tipo casa', true, '2025-09-04T19:09:23.009Z', '2025-09-04T19:09:23.009Z');
INSERT INTO "tipos_vivienda" ("id_tipo_vivienda", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('2', 'Apartamento', 'Vivienda tipo apartamento', true, '2025-09-04T19:09:23.012Z', '2025-09-04T19:09:23.012Z');
INSERT INTO "tipos_vivienda" ("id_tipo_vivienda", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('3', 'Finca', 'Vivienda rural tipo finca', true, '2025-09-04T19:09:23.015Z', '2025-09-04T19:09:23.015Z');
INSERT INTO "tipos_vivienda" ("id_tipo_vivienda", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('4', 'Rancho', 'Vivienda tipo rancho', true, '2025-09-04T19:09:23.018Z', '2025-09-04T19:09:23.018Z');
INSERT INTO "tipos_vivienda" ("id_tipo_vivienda", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('5', 'Inquilinato', 'Vivienda en inquilinato', true, '2025-09-04T19:09:23.022Z', '2025-09-04T19:09:23.022Z');
INSERT INTO "tipos_vivienda" ("id_tipo_vivienda", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES ('6', 'Otro', 'Otro tipo de vivienda', true, '2025-09-04T19:09:23.025Z', '2025-09-04T19:09:23.025Z');

-- Tabla: tipos_viviendas
DROP TABLE IF EXISTS "tipos_viviendas" CASCADE;
CREATE TABLE "tipos_viviendas" (
  "id_tipo" BIGINT NOT NULL DEFAULT nextval('tipos_viviendas_id_tipo_seq'::regclass),
  "descripcion" CHARACTER VARYING NOT NULL,
  "activo" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para tipos_viviendas
INSERT INTO "tipos_viviendas" ("id_tipo", "descripcion", "activo", "created_at", "updated_at") VALUES ('1', 'Casa Propia', true, '2025-09-29T18:47:07.573Z', '2025-09-29T18:47:07.573Z');
INSERT INTO "tipos_viviendas" ("id_tipo", "descripcion", "activo", "created_at", "updated_at") VALUES ('2', 'Casa Familiar', true, '2025-09-29T18:47:07.578Z', '2025-09-29T18:47:07.578Z');
INSERT INTO "tipos_viviendas" ("id_tipo", "descripcion", "activo", "created_at", "updated_at") VALUES ('3', 'Casa Arrendada', true, '2025-09-29T18:47:07.582Z', '2025-09-29T18:47:07.582Z');
INSERT INTO "tipos_viviendas" ("id_tipo", "descripcion", "activo", "created_at", "updated_at") VALUES ('4', 'Apartamento', true, '2025-09-29T18:47:07.588Z', '2025-09-29T18:47:07.588Z');
INSERT INTO "tipos_viviendas" ("id_tipo", "descripcion", "activo", "created_at", "updated_at") VALUES ('5', 'Cuarto', true, '2025-09-29T18:47:07.592Z', '2025-09-29T18:47:07.592Z');
INSERT INTO "tipos_viviendas" ("id_tipo", "descripcion", "activo", "created_at", "updated_at") VALUES ('6', 'Otro', true, '2025-09-29T18:47:07.594Z', '2025-09-29T18:47:07.594Z');

-- Tabla: usuarios
DROP TABLE IF EXISTS "usuarios" CASCADE;
CREATE TABLE "usuarios" (
  "id" UUID NOT NULL,
  "correo_electronico" CHARACTER VARYING NOT NULL,
  "contrasena" CHARACTER VARYING NOT NULL,
  "primer_nombre" CHARACTER VARYING NOT NULL,
  "segundo_nombre" CHARACTER VARYING,
  "primer_apellido" CHARACTER VARYING NOT NULL,
  "segundo_apellido" CHARACTER VARYING,
  "numero_documento" CHARACTER VARYING,
  "telefono" CHARACTER VARYING,
  "activo" BOOLEAN DEFAULT true,
  "fecha_ultimo_acceso" TIMESTAMP WITH TIME ZONE,
  "intentos_fallidos" INTEGER NOT NULL DEFAULT 0,
  "bloqueado_hasta" TIMESTAMP WITH TIME ZONE,
  "token_recuperacion" CHARACTER VARYING,
  "token_expiracion" TIMESTAMP WITH TIME ZONE,
  "email_verificado" BOOLEAN NOT NULL DEFAULT false,
  "token_verificacion_email" CHARACTER VARYING,
  "fecha_verificacion_email" TIMESTAMP WITH TIME ZONE,
  "expira_token_reset" TIMESTAMP WITH TIME ZONE,
  "refresh_token" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para usuarios
INSERT INTO "usuarios" ("id", "correo_electronico", "contrasena", "primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido", "numero_documento", "telefono", "activo", "fecha_ultimo_acceso", "intentos_fallidos", "bloqueado_hasta", "token_recuperacion", "token_expiracion", "email_verificado", "token_verificacion_email", "fecha_verificacion_email", "expira_token_reset", "refresh_token", "created_at", "updated_at") VALUES ('6bcdd89f-bc97-4c93-a3b3-9bff7fc55854', 'test@test.com', '$2b$10$.YtEeV4ENKHnrecSR7HR7OuUrbNW.I7PCzyMSn7XjGhW9Ux5/waya', 'Test', NULL, 'User', NULL, NULL, NULL, true, NULL, 0, NULL, NULL, NULL, true, NULL, NULL, NULL, NULL, '2025-09-29T18:54:41.013Z', '2025-09-29T18:54:41.013Z');
INSERT INTO "usuarios" ("id", "correo_electronico", "contrasena", "primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido", "numero_documento", "telefono", "activo", "fecha_ultimo_acceso", "intentos_fallidos", "bloqueado_hasta", "token_recuperacion", "token_expiracion", "email_verificado", "token_verificacion_email", "fecha_verificacion_email", "expira_token_reset", "refresh_token", "created_at", "updated_at") VALUES ('c231627f-b6d9-469f-8e45-3faee61f6ec3', 'admin@parroquia.com', '$2b$10$K5lUsOml.PX61n.D516e1.rKvJw24H9yoEVzS/hJrP5P2r9Bsmhx6', 'Admin', NULL, 'Sistema', NULL, NULL, NULL, true, '2025-09-29T19:05:53.648Z', 0, NULL, NULL, NULL, true, NULL, NULL, NULL, NULL, '2025-09-29T18:49:42.807Z', '2025-09-29T19:05:53.649Z');

-- Tabla: usuarios_roles
DROP TABLE IF EXISTS "usuarios_roles" CASCADE;
CREATE TABLE "usuarios_roles" (
  "id_usuarios" UUID NOT NULL,
  "id_roles" UUID NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para usuarios_roles
INSERT INTO "usuarios_roles" ("id_usuarios", "id_roles", "created_at", "updated_at") VALUES ('163c77aa-ca7b-4676-81e5-60fcd9c19229', '18d1054d-85d4-4f92-a214-eb9a5d05f677', '2025-09-04T19:52:56.042Z', '2025-09-04T19:52:56.042Z');
INSERT INTO "usuarios_roles" ("id_usuarios", "id_roles", "created_at", "updated_at") VALUES ('acdb6fc5-ac64-4936-b756-0498873986c1', '18d1054d-85d4-4f92-a214-eb9a5d05f677', '2025-09-04T19:54:50.955Z', '2025-09-04T19:54:50.955Z');
INSERT INTO "usuarios_roles" ("id_usuarios", "id_roles", "created_at", "updated_at") VALUES ('c231627f-b6d9-469f-8e45-3faee61f6ec3', '8dc7484f-7a0e-43ba-9337-0feea3a1b9ba', '2025-09-29T18:52:06.542Z', '2025-09-29T18:52:06.542Z');

-- Tabla: veredas
DROP TABLE IF EXISTS "veredas" CASCADE;
CREATE TABLE "veredas" (
  "id_vereda" BIGINT NOT NULL DEFAULT nextval('veredas_id_vereda_seq'::regclass),
  "nombre" CHARACTER VARYING NOT NULL,
  "id_sector" BIGINT,
  "activo" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Datos para veredas
INSERT INTO "veredas" ("id_vereda", "nombre", "id_sector", "activo", "created_at", "updated_at") VALUES ('1', 'La Esperanza', '1', true, '2025-09-29T18:47:07.530Z', '2025-09-29T18:47:07.530Z');
INSERT INTO "veredas" ("id_vereda", "nombre", "id_sector", "activo", "created_at", "updated_at") VALUES ('2', 'El Progreso', '1', true, '2025-09-29T18:47:07.535Z', '2025-09-29T18:47:07.535Z');
INSERT INTO "veredas" ("id_vereda", "nombre", "id_sector", "activo", "created_at", "updated_at") VALUES ('3', 'San Antonio', '2', true, '2025-09-29T18:47:07.540Z', '2025-09-29T18:47:07.540Z');
INSERT INTO "veredas" ("id_vereda", "nombre", "id_sector", "activo", "created_at", "updated_at") VALUES ('4', 'Las Flores', '3', true, '2025-09-29T18:47:07.543Z', '2025-09-29T18:47:07.543Z');


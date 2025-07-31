-- Continuation of database schema - Main tables and relationships

-- object: public.personas | type: TABLE --
-- DROP TABLE IF EXISTS public.personas CASCADE;
CREATE TABLE public.personas (
	id_personas bigserial NOT NULL,
	primer_nombre character varying(255) NOT NULL,
	segundo_nombre character varying(255),
	primer_apellido character varying(255) NOT NULL,
	segundo_apellido character varying(255),
	id_tipo_identificacion_tipo_identificacion bigint,
	identificacion character varying(255) NOT NULL,
	telefono character varying(255) NOT NULL,
	correo_electronico character varying(255) NOT NULL,
	fecha_nacimiento date NOT NULL,
	sexo character varying(255) NOT NULL,
	direccion character varying(255) NOT NULL,
	id_familia_familias bigint,
	id_estado_civil_estado_civil bigint,
	id_parroquia_parroquia bigint,
	id_sexo_sexo bigint,
	id_comunidades_culturales_comunidades_culturales bigint,
	CONSTRAINT personas_pk PRIMARY KEY (id_personas),
	CONSTRAINT personas_identificacion_unique UNIQUE (identificacion),
	CONSTRAINT personas_correo_electronico_unique UNIQUE (correo_electronico)
);
-- ddl-end --
ALTER TABLE public.personas OWNER TO parroquia_user;
-- ddl-end --

-- object: public.parroquias | type: TABLE --
-- DROP TABLE IF EXISTS public.parroquias CASCADE;
CREATE TABLE public.parroquias (
	id_parroquia bigint NOT NULL,
	nombre character varying(255) NOT NULL,
	id_familia_familias bigint,
	CONSTRAINT parroquias_pk PRIMARY KEY (id_parroquia)
);
-- ddl-end --
ALTER TABLE public.parroquias OWNER TO parroquia_user;
-- ddl-end --

-- object: public.areas_liderazgo | type: TABLE --
-- DROP TABLE IF EXISTS public.areas_liderazgo CASCADE;
CREATE TABLE public.areas_liderazgo (
	id_areas_liderazgo bigint NOT NULL,
	nombre character varying(255) NOT NULL,
	descripcion character varying(255) NOT NULL,
	CONSTRAINT areas_liderazgo_pk PRIMARY KEY (id_areas_liderazgo)
);
-- ddl-end --
ALTER TABLE public.areas_liderazgo OWNER TO parroquia_user;
-- ddl-end --

-- object: public.liderazgos | type: TABLE --
-- DROP TABLE IF EXISTS public.liderazgos CASCADE;
CREATE TABLE public.liderazgos (
	id_liderazgos bigint NOT NULL,
	fecha_inicio date NOT NULL,
	fecha_fin date,
	activo boolean DEFAULT TRUE,
	id_personas_personas bigint,
	id_areas_liderazgo_areas_liderazgo bigint,
	CONSTRAINT liderazgos_pk PRIMARY KEY (id_liderazgos)
);
-- ddl-end --
ALTER TABLE public.liderazgos OWNER TO parroquia_user;
-- ddl-end --

-- object: public.destrezas | type: TABLE --
-- DROP TABLE IF EXISTS public.destrezas CASCADE;
CREATE TABLE public.destrezas (
	id_destrezas bigint NOT NULL,
	nombre character varying(255) NOT NULL,
	CONSTRAINT destrezas_pk PRIMARY KEY (id_destrezas)
);
-- ddl-end --
ALTER TABLE public.destrezas OWNER TO parroquia_user;
-- ddl-end --

-- object: public.enfermedades | type: TABLE --
-- DROP TABLE IF EXISTS public.enfermedades CASCADE;
CREATE TABLE public.enfermedades (
	id_enfermedades smallint NOT NULL,
	nombre character varying(255) NOT NULL,
	CONSTRAINT enfermedades_pk PRIMARY KEY (id_enfermedades)
);
-- ddl-end --
ALTER TABLE public.enfermedades OWNER TO parroquia_user;
-- ddl-end --

-- object: public.enfermedades_persona | type: TABLE --
-- DROP TABLE IF EXISTS public.enfermedades_persona CASCADE;
CREATE TABLE public.enfermedades_persona (
	id_enfermedades_persona bigint NOT NULL,
	id_personas_personas bigint,
	id_enfermedades_enfermedades smallint,
	CONSTRAINT enfermedades_persona_pk PRIMARY KEY (id_enfermedades_persona)
);
-- ddl-end --
ALTER TABLE public.enfermedades_persona OWNER TO parroquia_user;
-- ddl-end --

-- object: public.municipios | type: TABLE --
-- DROP TABLE IF EXISTS public.municipios CASCADE;
CREATE TABLE public.municipios (
	id_municipio bigint NOT NULL,
	nombre_municipio character varying(255) NOT NULL,
	CONSTRAINT municipios_pk PRIMARY KEY (id_municipio)
);
-- ddl-end --
ALTER TABLE public.municipios OWNER TO parroquia_user;
-- ddl-end --

-- object: public.veredas | type: TABLE --
-- DROP TABLE IF EXISTS public.veredas CASCADE;
CREATE TABLE public.veredas (
	id_vereda bigint NOT NULL,
	nombre character varying(255) NOT NULL,
	id_municipio_municipios bigint,
	id_sector_sector bigint,
	CONSTRAINT veredas_pk PRIMARY KEY (id_vereda)
);
-- ddl-end --
ALTER TABLE public.veredas OWNER TO parroquia_user;
-- ddl-end --

-- object: public.sector | type: TABLE --
-- DROP TABLE IF EXISTS public.sector CASCADE;
CREATE TABLE public.sector (
	id_sector bigint NOT NULL,
	nombre character varying(255) NOT NULL,
	CONSTRAINT sector_pk PRIMARY KEY (id_sector)
);
-- ddl-end --
ALTER TABLE public.sector OWNER TO parroquia_user;
-- ddl-end --

-- object: public.usuarios | type: TABLE --
-- DROP TABLE IF EXISTS public.usuarios CASCADE;
CREATE TABLE public.usuarios (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	primer_nombre character varying(255) NOT NULL,
	segundo_nombre character varying(255),
	primer_apellido character varying(255) NOT NULL,
	segundo_apellido character varying(255),
	correo_electronico character varying(255) NOT NULL,
	contrasena character varying(255) NOT NULL,
	activo boolean DEFAULT TRUE,
	CONSTRAINT usuarios_pk PRIMARY KEY (id),
	CONSTRAINT usuarios_correo_electronico_unique UNIQUE (correo_electronico)
);
-- ddl-end --
ALTER TABLE public.usuarios OWNER TO parroquia_user;
-- ddl-end --

-- object: public.roles | type: TABLE --
-- DROP TABLE IF EXISTS public.roles CASCADE;
CREATE TABLE public.roles (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	nombre character varying(255) NOT NULL,
	CONSTRAINT roles_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.roles OWNER TO parroquia_user;
-- ddl-end --

-- object: public.difuntos_familia | type: TABLE --
-- DROP TABLE IF EXISTS public.difuntos_familia CASCADE;
CREATE TABLE public.difuntos_familia (
	id_difunto bigint NOT NULL,
	nombre_completo character varying(255) NOT NULL,
	fecha_fallecimiento date NOT NULL,
	observaciones text,
	id_familia_familias bigint,
	CONSTRAINT difuntos_familia_pk PRIMARY KEY (id_difunto)
);
-- ddl-end --
ALTER TABLE public.difuntos_familia OWNER TO parroquia_user;
-- ddl-end --

-- object: public.celebraciones_personales | type: TABLE --
-- DROP TABLE IF EXISTS public.celebraciones_personales CASCADE;
CREATE TABLE public.celebraciones_personales (
	id_celebracion bigint NOT NULL,
	profesion character varying(255) NOT NULL,
	motivo character varying(255) NOT NULL,
	fecha date NOT NULL,
	id_personas_personas bigint,
	CONSTRAINT celebraciones_personales_pk PRIMARY KEY (id_celebracion)
);
-- ddl-end --
ALTER TABLE public.celebraciones_personales OWNER TO parroquia_user;
-- ddl-end --

-- object: public.celebraciones_familia | type: TABLE --
-- DROP TABLE IF EXISTS public.celebraciones_familia CASCADE;
CREATE TABLE public.celebraciones_familia (
	id_celebracion bigint NOT NULL,
	motivo character varying(255) NOT NULL,
	fecha date NOT NULL,
	id_familia_familias bigint,
	CONSTRAINT celebraciones_familia_pk PRIMARY KEY (id_celebracion)
);
-- ddl-end --
ALTER TABLE public.celebraciones_familia OWNER TO parroquia_user;
-- ddl-end --

-- object: public.celebraciones_padre_madre | type: TABLE --
-- DROP TABLE IF EXISTS public.celebraciones_padre_madre CASCADE;
CREATE TABLE public.celebraciones_padre_madre (
	id_celebracion bigint NOT NULL,
	rol varchar(10) NOT NULL,
	fecha_celebracion date NOT NULL,
	es_difunto boolean NOT NULL,
	observaciones text,
	id_parentesco_parentesco bigint,
	CONSTRAINT celebraciones_padre_madre_pk PRIMARY KEY (id_celebracion)
);
-- ddl-end --
ALTER TABLE public.celebraciones_padre_madre OWNER TO parroquia_user;
-- ddl-end --

-- object: public.necesidades_enfermo | type: TABLE --
-- DROP TABLE IF EXISTS public.necesidades_enfermo CASCADE;
CREATE TABLE public.necesidades_enfermo (
	id_necesidad bigint NOT NULL,
	solicita_comunion boolean NOT NULL DEFAULT FALSE,
	otras_necesidades text NOT NULL,
	fecha_registro timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	id_personas_personas bigint,
	CONSTRAINT necesidades_enfermo_pk PRIMARY KEY (id_necesidad)
);
-- ddl-end --
ALTER TABLE public.necesidades_enfermo OWNER TO parroquia_user;
-- ddl-end --

-- object: public.familias | type: TABLE --
-- DROP TABLE IF EXISTS public.familias CASCADE;
CREATE TABLE public.familias (
	id_familia bigint NOT NULL,
	uuid_familia char(36) NOT NULL,
	nombre_familia character varying(255) NOT NULL,
	direccion_familia character varying(255) NOT NULL,
	numero_contrato_epm character varying(255) NOT NULL,
	tratamiento_datos boolean DEFAULT FALSE,
	observaciones character varying(255),
	id_vereda_veredas bigint,
	CONSTRAINT familias_pk PRIMARY KEY (id_familia)
);
-- ddl-end --
ALTER TABLE public.familias OWNER TO parroquia_user;
-- ddl-end --

-- object: public.persona_destreza | type: TABLE --
-- DROP TABLE IF EXISTS public.persona_destreza CASCADE;
CREATE TABLE public.persona_destreza (
	id_personas_personas bigint,
	id_destrezas_destrezas bigint
);
-- ddl-end --
ALTER TABLE public.persona_destreza OWNER TO parroquia_user;
-- ddl-end --

-- object: public.usuarios_roles | type: TABLE --
-- DROP TABLE IF EXISTS public.usuarios_roles CASCADE;
CREATE TABLE public.usuarios_roles (
	id_usuarios uuid,
	id_roles uuid
);
-- ddl-end --
ALTER TABLE public.usuarios_roles OWNER TO parroquia_user;
-- ddl-end --

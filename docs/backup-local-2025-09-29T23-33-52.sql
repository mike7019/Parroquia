--
-- PostgreSQL database dump
--

\restrict ajDaju8vn1P75mrgsE6BAZjV2XZK2Vm1OSh0vLIIH9E8rttmXDyo5K6vUpqIAjw

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-09-29 23:33:52 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.veredas DROP CONSTRAINT IF EXISTS veredas_id_sector_fkey;
ALTER TABLE IF EXISTS ONLY public.usuarios_roles DROP CONSTRAINT IF EXISTS usuarios_roles_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.usuarios_roles DROP CONSTRAINT IF EXISTS usuarios_roles_rol_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sectores DROP CONSTRAINT IF EXISTS sectores_id_parroquia_fkey;
ALTER TABLE IF EXISTS ONLY public.persona_destreza DROP CONSTRAINT IF EXISTS persona_destreza_id_destrezas_destrezas_fkey;
ALTER TABLE IF EXISTS ONLY public.parroquias DROP CONSTRAINT IF EXISTS parroquias_id_municipio_fkey;
ALTER TABLE IF EXISTS ONLY public.municipios DROP CONSTRAINT IF EXISTS municipios_id_departamento_fkey;
ALTER TABLE IF EXISTS ONLY public.difuntos_familia DROP CONSTRAINT IF EXISTS fk_difuntos_familia_sexo;
ALTER TABLE IF EXISTS ONLY public.difuntos_familia DROP CONSTRAINT IF EXISTS fk_difuntos_familia_parentesco;
ALTER TABLE IF EXISTS ONLY public.familia_sistema_acueducto DROP CONSTRAINT IF EXISTS familia_sistema_acueducto_id_sistema_acueducto_fkey;
ALTER TABLE IF EXISTS ONLY public.familia_disposicion_basura DROP CONSTRAINT IF EXISTS familia_disposicion_basura_id_tipo_disposicion_basura_fkey;
DROP INDEX IF EXISTS public.unique_persona_enfermedad;
DROP INDEX IF EXISTS public.unique_familia_tipo_vivienda;
DROP INDEX IF EXISTS public.unique_familia_sistema_acueducto;
DROP INDEX IF EXISTS public.tipos_vivienda_nombre;
DROP INDEX IF EXISTS public.tipos_disposicion_basura_nombre;
DROP INDEX IF EXISTS public.situaciones_civiles_orden;
DROP INDEX IF EXISTS public.situaciones_civiles_nombre;
DROP INDEX IF EXISTS public.situaciones_civiles_codigo;
DROP INDEX IF EXISTS public.situaciones_civiles_activo;
DROP INDEX IF EXISTS public.sistemas_acueducto_nombre;
DROP INDEX IF EXISTS public.profesiones_nombre;
DROP INDEX IF EXISTS public.persona_enfermedad_id_persona_id_enfermedad;
DROP INDEX IF EXISTS public.persona_enfermedad_id_persona;
DROP INDEX IF EXISTS public.persona_enfermedad_id_enfermedad;
DROP INDEX IF EXISTS public.niveles_educativos_orden_nivel;
DROP INDEX IF EXISTS public.niveles_educativos_nivel;
DROP INDEX IF EXISTS public.niveles_educativos_created_at;
DROP INDEX IF EXISTS public.niveles_educativos_activo;
DROP INDEX IF EXISTS public.idx_parroquia_nombre;
DROP INDEX IF EXISTS public.idx_parroquia_municipio;
DROP INDEX IF EXISTS public.idx_parentesco_nombre;
DROP INDEX IF EXISTS public.idx_parentesco_activo;
DROP INDEX IF EXISTS public.idx_difuntos_fecha_fallecimiento;
DROP INDEX IF EXISTS public.idx_difuntos_familia_familia;
DROP INDEX IF EXISTS public.idx_destrezas_nombre_unique;
DROP INDEX IF EXISTS public.familia_tipo_vivienda_id_tipo_vivienda;
DROP INDEX IF EXISTS public.familia_tipo_vivienda_id_familia_id_tipo_vivienda;
DROP INDEX IF EXISTS public.familia_tipo_vivienda_id_familia;
DROP INDEX IF EXISTS public.familia_sistema_acueducto_id_sistema_acueducto;
DROP INDEX IF EXISTS public.familia_sistema_acueducto_id_familia_id_sistema_acueducto;
DROP INDEX IF EXISTS public.familia_sistema_acueducto_id_familia;
DROP INDEX IF EXISTS public.encuestas_id_vereda;
DROP INDEX IF EXISTS public.encuestas_id_parroquia;
DROP INDEX IF EXISTS public.encuestas_id_municipio_id_sector;
DROP INDEX IF EXISTS public.encuestas_fecha_id_parroquia;
DROP INDEX IF EXISTS public.encuestas_fecha;
DROP INDEX IF EXISTS public.comunidades_culturales_nombre;
DROP INDEX IF EXISTS public.comunidades_culturales_created_at;
DROP INDEX IF EXISTS public.comunidades_culturales_activo;
ALTER TABLE IF EXISTS ONLY public.veredas DROP CONSTRAINT IF EXISTS veredas_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios_roles DROP CONSTRAINT IF EXISTS usuarios_roles_usuario_id_rol_id_key;
ALTER TABLE IF EXISTS ONLY public.usuarios_roles DROP CONSTRAINT IF EXISTS usuarios_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_correo_electronico_key;
ALTER TABLE IF EXISTS ONLY public.tipos_viviendas DROP CONSTRAINT IF EXISTS tipos_viviendas_pkey;
ALTER TABLE IF EXISTS ONLY public.tipos_vivienda DROP CONSTRAINT IF EXISTS tipos_vivienda_pkey;
ALTER TABLE IF EXISTS ONLY public.tipos_identificacion DROP CONSTRAINT IF EXISTS tipos_identificacion_pkey;
ALTER TABLE IF EXISTS ONLY public.tipos_identificacion DROP CONSTRAINT IF EXISTS tipos_identificacion_codigo_key;
ALTER TABLE IF EXISTS ONLY public.tipos_disposicion_basura DROP CONSTRAINT IF EXISTS tipos_disposicion_basura_pkey;
ALTER TABLE IF EXISTS ONLY public.tipos_aguas_residuales DROP CONSTRAINT IF EXISTS tipos_aguas_residuales_pkey;
ALTER TABLE IF EXISTS ONLY public.tipo_identificacion DROP CONSTRAINT IF EXISTS tipo_identificacion_pkey;
ALTER TABLE IF EXISTS ONLY public.tipo_identificacion DROP CONSTRAINT IF EXISTS tipo_identificacion_codigo_key;
ALTER TABLE IF EXISTS ONLY public.tallas DROP CONSTRAINT IF EXISTS tallas_pkey;
ALTER TABLE IF EXISTS ONLY public.situaciones_civiles DROP CONSTRAINT IF EXISTS situaciones_civiles_pkey;
ALTER TABLE IF EXISTS ONLY public.situaciones_civiles DROP CONSTRAINT IF EXISTS situaciones_civiles_nombre_key;
ALTER TABLE IF EXISTS ONLY public.situaciones_civiles DROP CONSTRAINT IF EXISTS situaciones_civiles_codigo_key;
ALTER TABLE IF EXISTS ONLY public.sistemas_acueductos DROP CONSTRAINT IF EXISTS sistemas_acueductos_pkey;
ALTER TABLE IF EXISTS ONLY public.sistemas_acueducto DROP CONSTRAINT IF EXISTS sistemas_acueducto_pkey;
ALTER TABLE IF EXISTS ONLY public.sistemas_acueducto DROP CONSTRAINT IF EXISTS sistemas_acueducto_nombre_key;
ALTER TABLE IF EXISTS ONLY public.sexos DROP CONSTRAINT IF EXISTS sexos_pkey;
ALTER TABLE IF EXISTS ONLY public.sexos DROP CONSTRAINT IF EXISTS sexos_nombre_key;
ALTER TABLE IF EXISTS ONLY public.sexos DROP CONSTRAINT IF EXISTS sexos_codigo_key;
ALTER TABLE IF EXISTS ONLY public.sexo DROP CONSTRAINT IF EXISTS sexo_pkey;
ALTER TABLE IF EXISTS ONLY public.sectores DROP CONSTRAINT IF EXISTS sectores_pkey;
ALTER TABLE IF EXISTS ONLY public.sector DROP CONSTRAINT IF EXISTS sector_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_nombre_key;
ALTER TABLE IF EXISTS ONLY public.profesiones DROP CONSTRAINT IF EXISTS profesiones_pkey;
ALTER TABLE IF EXISTS ONLY public.profesiones DROP CONSTRAINT IF EXISTS profesiones_nombre_key;
ALTER TABLE IF EXISTS ONLY public.personas DROP CONSTRAINT IF EXISTS personas_pkey;
ALTER TABLE IF EXISTS ONLY public.persona_destreza DROP CONSTRAINT IF EXISTS persona_destreza_pkey;
ALTER TABLE IF EXISTS ONLY public.parroquias DROP CONSTRAINT IF EXISTS parroquias_pkey;
ALTER TABLE IF EXISTS ONLY public.parroquia DROP CONSTRAINT IF EXISTS parroquia_pkey;
ALTER TABLE IF EXISTS ONLY public.parentescos DROP CONSTRAINT IF EXISTS parentescos_pkey;
ALTER TABLE IF EXISTS ONLY public.parentescos DROP CONSTRAINT IF EXISTS parentescos_nombre_key;
ALTER TABLE IF EXISTS ONLY public.niveles_educativos DROP CONSTRAINT IF EXISTS niveles_educativos_pkey;
ALTER TABLE IF EXISTS ONLY public.niveles_educativos DROP CONSTRAINT IF EXISTS niveles_educativos_nivel_key;
ALTER TABLE IF EXISTS ONLY public.municipios DROP CONSTRAINT IF EXISTS municipios_pkey;
ALTER TABLE IF EXISTS ONLY public.familias DROP CONSTRAINT IF EXISTS familias_pkey;
ALTER TABLE IF EXISTS ONLY public.familia_tipo_viviendas DROP CONSTRAINT IF EXISTS familia_tipo_viviendas_pkey;
ALTER TABLE IF EXISTS ONLY public.familia_sistema_aguas_residuales DROP CONSTRAINT IF EXISTS familia_sistema_aguas_residuales_pkey;
ALTER TABLE IF EXISTS ONLY public.familia_sistema_acueductos DROP CONSTRAINT IF EXISTS familia_sistema_acueductos_pkey;
ALTER TABLE IF EXISTS ONLY public.familia_disposicion_basuras DROP CONSTRAINT IF EXISTS familia_disposicion_basuras_pkey;
ALTER TABLE IF EXISTS ONLY public.familia_disposicion_basura DROP CONSTRAINT IF EXISTS familia_disposicion_basura_pkey;
ALTER TABLE IF EXISTS ONLY public.familia_aguas_residuales DROP CONSTRAINT IF EXISTS familia_aguas_residuales_pkey;
ALTER TABLE IF EXISTS ONLY public.estados_civiles DROP CONSTRAINT IF EXISTS estados_civiles_pkey;
ALTER TABLE IF EXISTS ONLY public.enfermedades DROP CONSTRAINT IF EXISTS enfermedades_pkey;
ALTER TABLE IF EXISTS ONLY public.encuestas DROP CONSTRAINT IF EXISTS encuestas_pkey;
ALTER TABLE IF EXISTS ONLY public.difuntos_familia DROP CONSTRAINT IF EXISTS difuntos_familia_pkey;
ALTER TABLE IF EXISTS ONLY public.destrezas DROP CONSTRAINT IF EXISTS destrezas_pkey;
ALTER TABLE IF EXISTS ONLY public.departamentos DROP CONSTRAINT IF EXISTS departamentos_pkey;
ALTER TABLE IF EXISTS ONLY public.comunidades_culturales DROP CONSTRAINT IF EXISTS comunidades_culturales_pkey;
ALTER TABLE IF EXISTS ONLY public.comunidades_culturales DROP CONSTRAINT IF EXISTS comunidades_culturales_nombre_key;
ALTER TABLE IF EXISTS ONLY public."SequelizeMeta" DROP CONSTRAINT IF EXISTS "SequelizeMeta_pkey";
ALTER TABLE IF EXISTS public.veredas ALTER COLUMN id_vereda DROP DEFAULT;
ALTER TABLE IF EXISTS public.usuarios_roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tipos_viviendas ALTER COLUMN id_tipo DROP DEFAULT;
ALTER TABLE IF EXISTS public.tipos_vivienda ALTER COLUMN id_tipo_vivienda DROP DEFAULT;
ALTER TABLE IF EXISTS public.tipos_identificacion ALTER COLUMN id_tipo_identificacion DROP DEFAULT;
ALTER TABLE IF EXISTS public.tipos_disposicion_basura ALTER COLUMN id_tipo_disposicion_basura DROP DEFAULT;
ALTER TABLE IF EXISTS public.tipos_aguas_residuales ALTER COLUMN id_tipo_aguas_residuales DROP DEFAULT;
ALTER TABLE IF EXISTS public.tipo_identificacion ALTER COLUMN id_tipo_identificacion DROP DEFAULT;
ALTER TABLE IF EXISTS public.tallas ALTER COLUMN id_talla DROP DEFAULT;
ALTER TABLE IF EXISTS public.situaciones_civiles ALTER COLUMN id_situacion_civil DROP DEFAULT;
ALTER TABLE IF EXISTS public.sistemas_acueductos ALTER COLUMN id_sistema DROP DEFAULT;
ALTER TABLE IF EXISTS public.sistemas_acueducto ALTER COLUMN id_sistema_acueducto DROP DEFAULT;
ALTER TABLE IF EXISTS public.sexos ALTER COLUMN id_sexo DROP DEFAULT;
ALTER TABLE IF EXISTS public.sexo ALTER COLUMN id_sexo DROP DEFAULT;
ALTER TABLE IF EXISTS public.sectores ALTER COLUMN id_sector DROP DEFAULT;
ALTER TABLE IF EXISTS public.sector ALTER COLUMN id_sector DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.profesiones ALTER COLUMN id_profesion DROP DEFAULT;
ALTER TABLE IF EXISTS public.personas ALTER COLUMN id_personas DROP DEFAULT;
ALTER TABLE IF EXISTS public.parroquias ALTER COLUMN id_parroquia DROP DEFAULT;
ALTER TABLE IF EXISTS public.parroquia ALTER COLUMN id_parroquia DROP DEFAULT;
ALTER TABLE IF EXISTS public.parentescos ALTER COLUMN id_parentesco DROP DEFAULT;
ALTER TABLE IF EXISTS public.niveles_educativos ALTER COLUMN id_niveles_educativos DROP DEFAULT;
ALTER TABLE IF EXISTS public.municipios ALTER COLUMN id_municipio DROP DEFAULT;
ALTER TABLE IF EXISTS public.familias ALTER COLUMN id_familia DROP DEFAULT;
ALTER TABLE IF EXISTS public.familia_tipo_viviendas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.familia_sistema_aguas_residuales ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.familia_sistema_acueductos ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.familia_sistema_acueducto ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.familia_disposicion_basuras ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.familia_disposicion_basura ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.familia_aguas_residuales ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.estados_civiles ALTER COLUMN id_estado DROP DEFAULT;
ALTER TABLE IF EXISTS public.enfermedades ALTER COLUMN id_enfermedad DROP DEFAULT;
ALTER TABLE IF EXISTS public.encuestas ALTER COLUMN id_encuesta DROP DEFAULT;
ALTER TABLE IF EXISTS public.difuntos_familia ALTER COLUMN id_difunto DROP DEFAULT;
ALTER TABLE IF EXISTS public.destrezas ALTER COLUMN id_destreza DROP DEFAULT;
ALTER TABLE IF EXISTS public.departamentos ALTER COLUMN id_departamento DROP DEFAULT;
ALTER TABLE IF EXISTS public.comunidades_culturales ALTER COLUMN id_comunidad_cultural DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.veredas_id_vereda_seq;
DROP TABLE IF EXISTS public.veredas;
DROP SEQUENCE IF EXISTS public.usuarios_roles_id_seq;
DROP TABLE IF EXISTS public.usuarios_roles;
DROP TABLE IF EXISTS public.usuarios;
DROP SEQUENCE IF EXISTS public.tipos_viviendas_id_tipo_seq;
DROP TABLE IF EXISTS public.tipos_viviendas;
DROP SEQUENCE IF EXISTS public.tipos_vivienda_id_tipo_vivienda_seq;
DROP TABLE IF EXISTS public.tipos_vivienda;
DROP SEQUENCE IF EXISTS public.tipos_identificacion_id_tipo_identificacion_seq;
DROP TABLE IF EXISTS public.tipos_identificacion;
DROP SEQUENCE IF EXISTS public.tipos_disposicion_basura_id_tipo_disposicion_basura_seq;
DROP TABLE IF EXISTS public.tipos_disposicion_basura;
DROP SEQUENCE IF EXISTS public.tipos_aguas_residuales_id_tipo_aguas_residuales_seq;
DROP TABLE IF EXISTS public.tipos_aguas_residuales;
DROP SEQUENCE IF EXISTS public.tipo_identificacion_id_tipo_identificacion_seq;
DROP TABLE IF EXISTS public.tipo_identificacion;
DROP SEQUENCE IF EXISTS public.tallas_id_talla_seq;
DROP TABLE IF EXISTS public.tallas;
DROP SEQUENCE IF EXISTS public.situaciones_civiles_id_situacion_civil_seq;
DROP TABLE IF EXISTS public.situaciones_civiles;
DROP SEQUENCE IF EXISTS public.sistemas_acueductos_id_sistema_seq;
DROP TABLE IF EXISTS public.sistemas_acueductos;
DROP SEQUENCE IF EXISTS public.sistemas_acueducto_id_sistema_acueducto_seq;
DROP TABLE IF EXISTS public.sistemas_acueducto;
DROP SEQUENCE IF EXISTS public.sexos_id_sexo_seq;
DROP TABLE IF EXISTS public.sexos;
DROP SEQUENCE IF EXISTS public.sexo_id_sexo_seq;
DROP TABLE IF EXISTS public.sexo;
DROP SEQUENCE IF EXISTS public.sectores_id_sector_seq;
DROP TABLE IF EXISTS public.sectores;
DROP SEQUENCE IF EXISTS public.sector_id_sector_seq;
DROP TABLE IF EXISTS public.sector;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP SEQUENCE IF EXISTS public.profesiones_id_profesion_seq;
DROP TABLE IF EXISTS public.profesiones;
DROP SEQUENCE IF EXISTS public.personas_id_personas_seq;
DROP TABLE IF EXISTS public.personas;
DROP TABLE IF EXISTS public.persona_enfermedad;
DROP TABLE IF EXISTS public.persona_destreza;
DROP SEQUENCE IF EXISTS public.parroquias_id_parroquia_seq;
DROP TABLE IF EXISTS public.parroquias;
DROP SEQUENCE IF EXISTS public.parroquia_id_parroquia_seq;
DROP TABLE IF EXISTS public.parroquia;
DROP SEQUENCE IF EXISTS public.parentescos_id_parentesco_seq;
DROP TABLE IF EXISTS public.parentescos;
DROP SEQUENCE IF EXISTS public.niveles_educativos_id_niveles_educativos_seq;
DROP TABLE IF EXISTS public.niveles_educativos;
DROP SEQUENCE IF EXISTS public.municipios_id_municipio_seq;
DROP TABLE IF EXISTS public.municipios;
DROP SEQUENCE IF EXISTS public.familias_id_familia_seq;
DROP TABLE IF EXISTS public.familias;
DROP SEQUENCE IF EXISTS public.familia_tipo_viviendas_id_seq;
DROP TABLE IF EXISTS public.familia_tipo_viviendas;
DROP TABLE IF EXISTS public.familia_tipo_vivienda;
DROP SEQUENCE IF EXISTS public.familia_sistema_aguas_residuales_id_seq;
DROP TABLE IF EXISTS public.familia_sistema_aguas_residuales;
DROP SEQUENCE IF EXISTS public.familia_sistema_acueductos_id_seq;
DROP TABLE IF EXISTS public.familia_sistema_acueductos;
DROP SEQUENCE IF EXISTS public.familia_sistema_acueducto_id_seq;
DROP TABLE IF EXISTS public.familia_sistema_acueducto;
DROP SEQUENCE IF EXISTS public.familia_disposicion_basuras_id_seq;
DROP TABLE IF EXISTS public.familia_disposicion_basuras;
DROP SEQUENCE IF EXISTS public.familia_disposicion_basura_id_seq;
DROP TABLE IF EXISTS public.familia_disposicion_basura;
DROP SEQUENCE IF EXISTS public.familia_aguas_residuales_id_seq;
DROP TABLE IF EXISTS public.familia_aguas_residuales;
DROP SEQUENCE IF EXISTS public.estados_civiles_id_estado_seq;
DROP TABLE IF EXISTS public.estados_civiles;
DROP SEQUENCE IF EXISTS public.enfermedades_id_enfermedad_seq;
DROP TABLE IF EXISTS public.enfermedades;
DROP SEQUENCE IF EXISTS public.encuestas_id_encuesta_seq;
DROP TABLE IF EXISTS public.encuestas;
DROP SEQUENCE IF EXISTS public.difuntos_familia_id_difunto_seq;
DROP TABLE IF EXISTS public.difuntos_familia;
DROP SEQUENCE IF EXISTS public.destrezas_id_destreza_seq;
DROP TABLE IF EXISTS public.destrezas;
DROP SEQUENCE IF EXISTS public.departamentos_id_departamento_seq;
DROP TABLE IF EXISTS public.departamentos;
DROP SEQUENCE IF EXISTS public.comunidades_culturales_id_comunidad_cultural_seq;
DROP TABLE IF EXISTS public.comunidades_culturales;
DROP TABLE IF EXISTS public."SequelizeMeta";
DROP TYPE IF EXISTS public.enum_usuarios_rol;
DROP TYPE IF EXISTS public.enum_tallas_tipo_prenda;
DROP TYPE IF EXISTS public.enum_tallas_genero;
DROP TYPE IF EXISTS public.enum_surveys_status;
DROP TYPE IF EXISTS public.enum_profesiones_nivel_educativo_requerido;
DROP TYPE IF EXISTS public.enum_persona_destreza_nivel_habilidad;
DROP TYPE IF EXISTS public.enum_families_survey_status;
DROP TYPE IF EXISTS public.enum_familias_estado_encuesta;
--
-- TOC entry 934 (class 1247 OID 16390)
-- Name: enum_familias_estado_encuesta; Type: TYPE; Schema: public; Owner: parroquia_user
--

CREATE TYPE public.enum_familias_estado_encuesta AS ENUM (
    'pending',
    'in_progress',
    'completed'
);


ALTER TYPE public.enum_familias_estado_encuesta OWNER TO parroquia_user;

--
-- TOC entry 937 (class 1247 OID 16398)
-- Name: enum_families_survey_status; Type: TYPE; Schema: public; Owner: parroquia_user
--

CREATE TYPE public.enum_families_survey_status AS ENUM (
    'pending',
    'in_progress',
    'completed'
);


ALTER TYPE public.enum_families_survey_status OWNER TO parroquia_user;

--
-- TOC entry 940 (class 1247 OID 16406)
-- Name: enum_persona_destreza_nivel_habilidad; Type: TYPE; Schema: public; Owner: parroquia_user
--

CREATE TYPE public.enum_persona_destreza_nivel_habilidad AS ENUM (
    'basico',
    'intermedio',
    'avanzado',
    'experto'
);


ALTER TYPE public.enum_persona_destreza_nivel_habilidad OWNER TO parroquia_user;

--
-- TOC entry 943 (class 1247 OID 16416)
-- Name: enum_profesiones_nivel_educativo_requerido; Type: TYPE; Schema: public; Owner: parroquia_user
--

CREATE TYPE public.enum_profesiones_nivel_educativo_requerido AS ENUM (
    'Primaria',
    'Secundaria',
    'Técnico',
    'Tecnológico',
    'Universitario',
    'Especialización',
    'Maestría',
    'Doctorado',
    'No requerido'
);


ALTER TYPE public.enum_profesiones_nivel_educativo_requerido OWNER TO parroquia_user;

--
-- TOC entry 946 (class 1247 OID 16436)
-- Name: enum_surveys_status; Type: TYPE; Schema: public; Owner: parroquia_user
--

CREATE TYPE public.enum_surveys_status AS ENUM (
    'draft',
    'in_progress',
    'completed',
    'cancelled'
);


ALTER TYPE public.enum_surveys_status OWNER TO parroquia_user;

--
-- TOC entry 949 (class 1247 OID 16446)
-- Name: enum_tallas_genero; Type: TYPE; Schema: public; Owner: parroquia_user
--

CREATE TYPE public.enum_tallas_genero AS ENUM (
    'masculino',
    'femenino',
    'unisex'
);


ALTER TYPE public.enum_tallas_genero OWNER TO parroquia_user;

--
-- TOC entry 952 (class 1247 OID 16454)
-- Name: enum_tallas_tipo_prenda; Type: TYPE; Schema: public; Owner: parroquia_user
--

CREATE TYPE public.enum_tallas_tipo_prenda AS ENUM (
    'zapato',
    'camisa',
    'pantalon'
);


ALTER TYPE public.enum_tallas_tipo_prenda OWNER TO parroquia_user;

--
-- TOC entry 955 (class 1247 OID 16462)
-- Name: enum_usuarios_rol; Type: TYPE; Schema: public; Owner: parroquia_user
--

CREATE TYPE public.enum_usuarios_rol AS ENUM (
    'admin',
    'coordinador',
    'encuestador'
);


ALTER TYPE public.enum_usuarios_rol OWNER TO parroquia_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16469)
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO parroquia_user;

--
-- TOC entry 220 (class 1259 OID 16473)
-- Name: comunidades_culturales; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.comunidades_culturales (
    id_comunidad_cultural bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.comunidades_culturales OWNER TO parroquia_user;

--
-- TOC entry 221 (class 1259 OID 16484)
-- Name: comunidades_culturales_id_comunidad_cultural_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.comunidades_culturales_id_comunidad_cultural_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comunidades_culturales_id_comunidad_cultural_seq OWNER TO parroquia_user;

--
-- TOC entry 3994 (class 0 OID 0)
-- Dependencies: 221
-- Name: comunidades_culturales_id_comunidad_cultural_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.comunidades_culturales_id_comunidad_cultural_seq OWNED BY public.comunidades_culturales.id_comunidad_cultural;


--
-- TOC entry 268 (class 1259 OID 17745)
-- Name: departamentos; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.departamentos (
    id_departamento bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    codigo character varying(10),
    activo boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.departamentos OWNER TO parroquia_user;

--
-- TOC entry 267 (class 1259 OID 17744)
-- Name: departamentos_id_departamento_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.departamentos_id_departamento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departamentos_id_departamento_seq OWNER TO parroquia_user;

--
-- TOC entry 3995 (class 0 OID 0)
-- Dependencies: 267
-- Name: departamentos_id_departamento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.departamentos_id_departamento_seq OWNED BY public.departamentos.id_departamento;


--
-- TOC entry 222 (class 1259 OID 16494)
-- Name: destrezas; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.destrezas (
    id_destreza bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.destrezas OWNER TO parroquia_user;

--
-- TOC entry 223 (class 1259 OID 16501)
-- Name: destrezas_id_destreza_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.destrezas_id_destreza_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destrezas_id_destreza_seq OWNER TO parroquia_user;

--
-- TOC entry 3996 (class 0 OID 0)
-- Dependencies: 223
-- Name: destrezas_id_destreza_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.destrezas_id_destreza_seq OWNED BY public.destrezas.id_destreza;


--
-- TOC entry 224 (class 1259 OID 16502)
-- Name: difuntos_familia; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.difuntos_familia (
    id_difunto bigint NOT NULL,
    nombre_completo character varying(255) NOT NULL,
    fecha_fallecimiento date NOT NULL,
    observaciones text,
    id_familia_familias bigint,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    id_sexo bigint,
    id_parentesco bigint,
    causa_fallecimiento text
);


ALTER TABLE public.difuntos_familia OWNER TO parroquia_user;

--
-- TOC entry 225 (class 1259 OID 16512)
-- Name: difuntos_familia_id_difunto_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.difuntos_familia_id_difunto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.difuntos_familia_id_difunto_seq OWNER TO parroquia_user;

--
-- TOC entry 3997 (class 0 OID 0)
-- Dependencies: 225
-- Name: difuntos_familia_id_difunto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.difuntos_familia_id_difunto_seq OWNED BY public.difuntos_familia.id_difunto;


--
-- TOC entry 226 (class 1259 OID 16513)
-- Name: encuestas; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.encuestas (
    id_encuesta bigint NOT NULL,
    id_parroquia bigint NOT NULL,
    id_municipio bigint NOT NULL,
    fecha date NOT NULL,
    id_sector bigint NOT NULL,
    id_vereda bigint NOT NULL,
    observaciones text,
    tratamiento_datos boolean DEFAULT false NOT NULL,
    firma text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.encuestas OWNER TO parroquia_user;

--
-- TOC entry 3998 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN encuestas.firma; Type: COMMENT; Schema: public; Owner: parroquia_user
--

COMMENT ON COLUMN public.encuestas.firma IS 'Firma digital o ruta de imagen de firma';


--
-- TOC entry 227 (class 1259 OID 16528)
-- Name: encuestas_id_encuesta_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.encuestas_id_encuesta_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.encuestas_id_encuesta_seq OWNER TO parroquia_user;

--
-- TOC entry 3999 (class 0 OID 0)
-- Dependencies: 227
-- Name: encuestas_id_encuesta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.encuestas_id_encuesta_seq OWNED BY public.encuestas.id_encuesta;


--
-- TOC entry 284 (class 1259 OID 17860)
-- Name: enfermedades; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.enfermedades (
    id_enfermedad bigint NOT NULL,
    descripcion character varying(100) NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.enfermedades OWNER TO parroquia_user;

--
-- TOC entry 283 (class 1259 OID 17859)
-- Name: enfermedades_id_enfermedad_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.enfermedades_id_enfermedad_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.enfermedades_id_enfermedad_seq OWNER TO parroquia_user;

--
-- TOC entry 4000 (class 0 OID 0)
-- Dependencies: 283
-- Name: enfermedades_id_enfermedad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.enfermedades_id_enfermedad_seq OWNED BY public.enfermedades.id_enfermedad;


--
-- TOC entry 282 (class 1259 OID 17848)
-- Name: estados_civiles; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.estados_civiles (
    id_estado bigint NOT NULL,
    descripcion character varying(50) NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.estados_civiles OWNER TO parroquia_user;

--
-- TOC entry 281 (class 1259 OID 17847)
-- Name: estados_civiles_id_estado_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.estados_civiles_id_estado_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estados_civiles_id_estado_seq OWNER TO parroquia_user;

--
-- TOC entry 4001 (class 0 OID 0)
-- Dependencies: 281
-- Name: estados_civiles_id_estado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.estados_civiles_id_estado_seq OWNED BY public.estados_civiles.id_estado;


--
-- TOC entry 228 (class 1259 OID 16548)
-- Name: familia_aguas_residuales; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.familia_aguas_residuales (
    id integer NOT NULL,
    id_familia integer NOT NULL,
    tipo_tratamiento character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.familia_aguas_residuales OWNER TO parroquia_user;

--
-- TOC entry 229 (class 1259 OID 16556)
-- Name: familia_aguas_residuales_id_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.familia_aguas_residuales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.familia_aguas_residuales_id_seq OWNER TO parroquia_user;

--
-- TOC entry 4002 (class 0 OID 0)
-- Dependencies: 229
-- Name: familia_aguas_residuales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.familia_aguas_residuales_id_seq OWNED BY public.familia_aguas_residuales.id;


--
-- TOC entry 230 (class 1259 OID 16557)
-- Name: familia_disposicion_basura; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.familia_disposicion_basura (
    id bigint NOT NULL,
    id_familia bigint NOT NULL,
    id_tipo_disposicion_basura bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.familia_disposicion_basura OWNER TO parroquia_user;

--
-- TOC entry 231 (class 1259 OID 16565)
-- Name: familia_disposicion_basura_id_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.familia_disposicion_basura_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.familia_disposicion_basura_id_seq OWNER TO parroquia_user;

--
-- TOC entry 4003 (class 0 OID 0)
-- Dependencies: 231
-- Name: familia_disposicion_basura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.familia_disposicion_basura_id_seq OWNED BY public.familia_disposicion_basura.id;


--
-- TOC entry 232 (class 1259 OID 16566)
-- Name: familia_disposicion_basuras; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.familia_disposicion_basuras (
    id integer NOT NULL,
    id_familia integer NOT NULL,
    disposicion character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.familia_disposicion_basuras OWNER TO parroquia_user;

--
-- TOC entry 233 (class 1259 OID 16574)
-- Name: familia_disposicion_basuras_id_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.familia_disposicion_basuras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.familia_disposicion_basuras_id_seq OWNER TO parroquia_user;

--
-- TOC entry 4004 (class 0 OID 0)
-- Dependencies: 233
-- Name: familia_disposicion_basuras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.familia_disposicion_basuras_id_seq OWNED BY public.familia_disposicion_basuras.id;


--
-- TOC entry 234 (class 1259 OID 16575)
-- Name: familia_sistema_acueducto; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.familia_sistema_acueducto (
    id_familia bigint NOT NULL,
    id_sistema_acueducto bigint NOT NULL,
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.familia_sistema_acueducto OWNER TO parroquia_user;

--
-- TOC entry 235 (class 1259 OID 16583)
-- Name: familia_sistema_acueducto_id_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.familia_sistema_acueducto_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.familia_sistema_acueducto_id_seq OWNER TO parroquia_user;

--
-- TOC entry 4005 (class 0 OID 0)
-- Dependencies: 235
-- Name: familia_sistema_acueducto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.familia_sistema_acueducto_id_seq OWNED BY public.familia_sistema_acueducto.id;


--
-- TOC entry 290 (class 1259 OID 17901)
-- Name: familia_sistema_acueductos; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.familia_sistema_acueductos (
    id bigint NOT NULL,
    id_familia bigint NOT NULL,
    id_sistema_acueducto bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.familia_sistema_acueductos OWNER TO parroquia_user;

--
-- TOC entry 289 (class 1259 OID 17900)
-- Name: familia_sistema_acueductos_id_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.familia_sistema_acueductos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.familia_sistema_acueductos_id_seq OWNER TO parroquia_user;

--
-- TOC entry 4006 (class 0 OID 0)
-- Dependencies: 289
-- Name: familia_sistema_acueductos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.familia_sistema_acueductos_id_seq OWNED BY public.familia_sistema_acueductos.id;


--
-- TOC entry 294 (class 1259 OID 17925)
-- Name: familia_sistema_aguas_residuales; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.familia_sistema_aguas_residuales (
    id bigint NOT NULL,
    id_familia bigint NOT NULL,
    id_tipo_aguas_residuales bigint CONSTRAINT familia_sistema_aguas_residua_id_tipo_aguas_residuales_not_null NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.familia_sistema_aguas_residuales OWNER TO parroquia_user;

--
-- TOC entry 293 (class 1259 OID 17924)
-- Name: familia_sistema_aguas_residuales_id_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.familia_sistema_aguas_residuales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.familia_sistema_aguas_residuales_id_seq OWNER TO parroquia_user;

--
-- TOC entry 4007 (class 0 OID 0)
-- Dependencies: 293
-- Name: familia_sistema_aguas_residuales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.familia_sistema_aguas_residuales_id_seq OWNED BY public.familia_sistema_aguas_residuales.id;


--
-- TOC entry 236 (class 1259 OID 16602)
-- Name: familia_tipo_vivienda; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.familia_tipo_vivienda (
    id_familia bigint NOT NULL,
    id_tipo_vivienda bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.familia_tipo_vivienda OWNER TO parroquia_user;

--
-- TOC entry 292 (class 1259 OID 17913)
-- Name: familia_tipo_viviendas; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.familia_tipo_viviendas (
    id bigint NOT NULL,
    id_familia bigint NOT NULL,
    id_tipo_vivienda bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.familia_tipo_viviendas OWNER TO parroquia_user;

--
-- TOC entry 291 (class 1259 OID 17912)
-- Name: familia_tipo_viviendas_id_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.familia_tipo_viviendas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.familia_tipo_viviendas_id_seq OWNER TO parroquia_user;

--
-- TOC entry 4008 (class 0 OID 0)
-- Dependencies: 291
-- Name: familia_tipo_viviendas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.familia_tipo_viviendas_id_seq OWNED BY public.familia_tipo_viviendas.id;


--
-- TOC entry 286 (class 1259 OID 17872)
-- Name: familias; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.familias (
    id_familia bigint NOT NULL,
    apellido_familiar character varying(100),
    sector character varying(100),
    direccion_familia character varying(200),
    numero_contacto character varying(20),
    telefono character varying(20),
    email character varying(100),
    "tamaño_familia" integer DEFAULT 0,
    tipo_vivienda character varying(50),
    estado_encuesta character varying(50) DEFAULT 'pendiente'::character varying,
    numero_encuestas integer DEFAULT 0,
    fecha_ultima_encuesta timestamp with time zone,
    codigo_familia character varying(50),
    tutor_responsable boolean DEFAULT false,
    id_municipio bigint,
    id_vereda bigint,
    id_sector bigint,
    "comunionEnCasa" boolean DEFAULT false,
    numero_contrato_epm character varying(50),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.familias OWNER TO parroquia_user;

--
-- TOC entry 285 (class 1259 OID 17871)
-- Name: familias_id_familia_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.familias_id_familia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.familias_id_familia_seq OWNER TO parroquia_user;

--
-- TOC entry 4009 (class 0 OID 0)
-- Dependencies: 285
-- Name: familias_id_familia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.familias_id_familia_seq OWNED BY public.familias.id_familia;


--
-- TOC entry 270 (class 1259 OID 17757)
-- Name: municipios; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.municipios (
    id_municipio bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    codigo character varying(10),
    id_departamento bigint,
    activo boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.municipios OWNER TO parroquia_user;

--
-- TOC entry 269 (class 1259 OID 17756)
-- Name: municipios_id_municipio_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.municipios_id_municipio_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.municipios_id_municipio_seq OWNER TO parroquia_user;

--
-- TOC entry 4010 (class 0 OID 0)
-- Dependencies: 269
-- Name: municipios_id_municipio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.municipios_id_municipio_seq OWNED BY public.municipios.id_municipio;


--
-- TOC entry 237 (class 1259 OID 16656)
-- Name: niveles_educativos; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.niveles_educativos (
    id_niveles_educativos bigint NOT NULL,
    nivel character varying(255) NOT NULL,
    descripcion text,
    orden_nivel integer,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public.niveles_educativos OWNER TO parroquia_user;

--
-- TOC entry 238 (class 1259 OID 16667)
-- Name: niveles_educativos_id_niveles_educativos_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.niveles_educativos_id_niveles_educativos_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.niveles_educativos_id_niveles_educativos_seq OWNER TO parroquia_user;

--
-- TOC entry 4011 (class 0 OID 0)
-- Dependencies: 238
-- Name: niveles_educativos_id_niveles_educativos_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.niveles_educativos_id_niveles_educativos_seq OWNED BY public.niveles_educativos.id_niveles_educativos;


--
-- TOC entry 239 (class 1259 OID 16668)
-- Name: parentescos; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.parentescos (
    id_parentesco bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.parentescos OWNER TO parroquia_user;

--
-- TOC entry 240 (class 1259 OID 16679)
-- Name: parentescos_id_parentesco_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.parentescos_id_parentesco_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parentescos_id_parentesco_seq OWNER TO parroquia_user;

--
-- TOC entry 4012 (class 0 OID 0)
-- Dependencies: 240
-- Name: parentescos_id_parentesco_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.parentescos_id_parentesco_seq OWNED BY public.parentescos.id_parentesco;


--
-- TOC entry 241 (class 1259 OID 16680)
-- Name: parroquia; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.parroquia (
    id_parroquia bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    id_municipio bigint NOT NULL,
    direccion character varying(500),
    telefono character varying(20),
    email character varying(100),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.parroquia OWNER TO parroquia_user;

--
-- TOC entry 4013 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN parroquia.id_municipio; Type: COMMENT; Schema: public; Owner: parroquia_user
--

COMMENT ON COLUMN public.parroquia.id_municipio IS 'ID del municipio al que pertenece la parroquia';


--
-- TOC entry 4014 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN parroquia.direccion; Type: COMMENT; Schema: public; Owner: parroquia_user
--

COMMENT ON COLUMN public.parroquia.direccion IS 'Dirección física de la parroquia';


--
-- TOC entry 4015 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN parroquia.telefono; Type: COMMENT; Schema: public; Owner: parroquia_user
--

COMMENT ON COLUMN public.parroquia.telefono IS 'Número de teléfono de contacto';


--
-- TOC entry 4016 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN parroquia.email; Type: COMMENT; Schema: public; Owner: parroquia_user
--

COMMENT ON COLUMN public.parroquia.email IS 'Correo electrónico de contacto';


--
-- TOC entry 242 (class 1259 OID 16686)
-- Name: parroquia_id_parroquia_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.parroquia_id_parroquia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parroquia_id_parroquia_seq OWNER TO parroquia_user;

--
-- TOC entry 4017 (class 0 OID 0)
-- Dependencies: 242
-- Name: parroquia_id_parroquia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.parroquia_id_parroquia_seq OWNED BY public.parroquia.id_parroquia;


--
-- TOC entry 272 (class 1259 OID 17774)
-- Name: parroquias; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.parroquias (
    id_parroquia bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    id_municipio bigint,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.parroquias OWNER TO parroquia_user;

--
-- TOC entry 271 (class 1259 OID 17773)
-- Name: parroquias_id_parroquia_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.parroquias_id_parroquia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parroquias_id_parroquia_seq OWNER TO parroquia_user;

--
-- TOC entry 4018 (class 0 OID 0)
-- Dependencies: 271
-- Name: parroquias_id_parroquia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.parroquias_id_parroquia_seq OWNED BY public.parroquias.id_parroquia;


--
-- TOC entry 243 (class 1259 OID 16695)
-- Name: persona_destreza; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.persona_destreza (
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    id_destrezas_destrezas bigint NOT NULL,
    id_personas_personas bigint NOT NULL
);


ALTER TABLE public.persona_destreza OWNER TO parroquia_user;

--
-- TOC entry 244 (class 1259 OID 16702)
-- Name: persona_enfermedad; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.persona_enfermedad (
    id_persona bigint NOT NULL,
    id_enfermedad bigint NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.persona_enfermedad OWNER TO parroquia_user;

--
-- TOC entry 288 (class 1259 OID 17889)
-- Name: personas; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.personas (
    id_personas bigint NOT NULL,
    primer_nombre character varying(50),
    segundo_nombre character varying(50),
    primer_apellido character varying(50),
    segundo_apellido character varying(50),
    id_tipo_identificacion_tipo_identificacion bigint,
    identificacion character varying(20),
    telefono character varying(20),
    correo_electronico character varying(100),
    fecha_nacimiento timestamp with time zone,
    direccion character varying(200),
    id_familia_familias bigint,
    id_estado_civil_estado_civil bigint,
    estudios character varying(100),
    en_que_eres_lider character varying(200),
    necesidad_enfermo character varying(200),
    id_profesion bigint,
    id_sexo bigint,
    talla_camisa character varying(10),
    talla_pantalon character varying(10),
    talla_zapato character varying(10),
    id_familia bigint,
    id_parroquia bigint,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.personas OWNER TO parroquia_user;

--
-- TOC entry 287 (class 1259 OID 17888)
-- Name: personas_id_personas_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.personas_id_personas_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personas_id_personas_seq OWNER TO parroquia_user;

--
-- TOC entry 4019 (class 0 OID 0)
-- Dependencies: 287
-- Name: personas_id_personas_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.personas_id_personas_seq OWNED BY public.personas.id_personas;


--
-- TOC entry 245 (class 1259 OID 16723)
-- Name: profesiones; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.profesiones (
    id_profesion bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.profesiones OWNER TO parroquia_user;

--
-- TOC entry 246 (class 1259 OID 16732)
-- Name: profesiones_id_profesion_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.profesiones_id_profesion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profesiones_id_profesion_seq OWNER TO parroquia_user;

--
-- TOC entry 4020 (class 0 OID 0)
-- Dependencies: 246
-- Name: profesiones_id_profesion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.profesiones_id_profesion_seq OWNED BY public.profesiones.id_profesion;


--
-- TOC entry 299 (class 1259 OID 17989)
-- Name: roles; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.roles OWNER TO parroquia_user;

--
-- TOC entry 298 (class 1259 OID 17988)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO parroquia_user;

--
-- TOC entry 4021 (class 0 OID 0)
-- Dependencies: 298
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 247 (class 1259 OID 16740)
-- Name: sector; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.sector (
    id_sector bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.sector OWNER TO parroquia_user;

--
-- TOC entry 248 (class 1259 OID 16747)
-- Name: sector_id_sector_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.sector_id_sector_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sector_id_sector_seq OWNER TO parroquia_user;

--
-- TOC entry 4022 (class 0 OID 0)
-- Dependencies: 248
-- Name: sector_id_sector_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.sector_id_sector_seq OWNED BY public.sector.id_sector;


--
-- TOC entry 274 (class 1259 OID 17790)
-- Name: sectores; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.sectores (
    id_sector bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    id_parroquia bigint,
    activo boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.sectores OWNER TO parroquia_user;

--
-- TOC entry 273 (class 1259 OID 17789)
-- Name: sectores_id_sector_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.sectores_id_sector_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sectores_id_sector_seq OWNER TO parroquia_user;

--
-- TOC entry 4023 (class 0 OID 0)
-- Dependencies: 273
-- Name: sectores_id_sector_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.sectores_id_sector_seq OWNED BY public.sectores.id_sector;


--
-- TOC entry 249 (class 1259 OID 16757)
-- Name: sexo; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.sexo (
    id_sexo bigint NOT NULL,
    descripcion character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.sexo OWNER TO parroquia_user;

--
-- TOC entry 4024 (class 0 OID 0)
-- Dependencies: 249
-- Name: COLUMN sexo.descripcion; Type: COMMENT; Schema: public; Owner: parroquia_user
--

COMMENT ON COLUMN public.sexo.descripcion IS 'Descripción del tipo de sexo';


--
-- TOC entry 250 (class 1259 OID 16764)
-- Name: sexo_id_sexo_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.sexo_id_sexo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sexo_id_sexo_seq OWNER TO parroquia_user;

--
-- TOC entry 4025 (class 0 OID 0)
-- Dependencies: 250
-- Name: sexo_id_sexo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.sexo_id_sexo_seq OWNED BY public.sexo.id_sexo;


--
-- TOC entry 251 (class 1259 OID 16765)
-- Name: sexos; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.sexos (
    id_sexo bigint NOT NULL,
    nombre character varying(50) NOT NULL,
    codigo character varying(1) NOT NULL,
    descripcion text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.sexos OWNER TO parroquia_user;

--
-- TOC entry 252 (class 1259 OID 16775)
-- Name: sexos_id_sexo_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.sexos_id_sexo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sexos_id_sexo_seq OWNER TO parroquia_user;

--
-- TOC entry 4026 (class 0 OID 0)
-- Dependencies: 252
-- Name: sexos_id_sexo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.sexos_id_sexo_seq OWNED BY public.sexos.id_sexo;


--
-- TOC entry 253 (class 1259 OID 16776)
-- Name: sistemas_acueducto; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.sistemas_acueducto (
    id_sistema_acueducto bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.sistemas_acueducto OWNER TO parroquia_user;

--
-- TOC entry 254 (class 1259 OID 16785)
-- Name: sistemas_acueducto_id_sistema_acueducto_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.sistemas_acueducto_id_sistema_acueducto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sistemas_acueducto_id_sistema_acueducto_seq OWNER TO parroquia_user;

--
-- TOC entry 4027 (class 0 OID 0)
-- Dependencies: 254
-- Name: sistemas_acueducto_id_sistema_acueducto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.sistemas_acueducto_id_sistema_acueducto_seq OWNED BY public.sistemas_acueducto.id_sistema_acueducto;


--
-- TOC entry 278 (class 1259 OID 17824)
-- Name: sistemas_acueductos; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.sistemas_acueductos (
    id_sistema bigint NOT NULL,
    descripcion character varying(100) NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.sistemas_acueductos OWNER TO parroquia_user;

--
-- TOC entry 277 (class 1259 OID 17823)
-- Name: sistemas_acueductos_id_sistema_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.sistemas_acueductos_id_sistema_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sistemas_acueductos_id_sistema_seq OWNER TO parroquia_user;

--
-- TOC entry 4028 (class 0 OID 0)
-- Dependencies: 277
-- Name: sistemas_acueductos_id_sistema_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.sistemas_acueductos_id_sistema_seq OWNED BY public.sistemas_acueductos.id_sistema;


--
-- TOC entry 255 (class 1259 OID 16795)
-- Name: situaciones_civiles; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.situaciones_civiles (
    id_situacion_civil integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    codigo character varying(10),
    orden integer DEFAULT 0,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "fechaEliminacion" timestamp with time zone
);


ALTER TABLE public.situaciones_civiles OWNER TO parroquia_user;

--
-- TOC entry 256 (class 1259 OID 16807)
-- Name: situaciones_civiles_id_situacion_civil_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.situaciones_civiles_id_situacion_civil_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.situaciones_civiles_id_situacion_civil_seq OWNER TO parroquia_user;

--
-- TOC entry 4029 (class 0 OID 0)
-- Dependencies: 256
-- Name: situaciones_civiles_id_situacion_civil_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.situaciones_civiles_id_situacion_civil_seq OWNED BY public.situaciones_civiles.id_situacion_civil;


--
-- TOC entry 257 (class 1259 OID 16808)
-- Name: tallas; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.tallas (
    id_talla bigint NOT NULL,
    tipo_prenda character varying(20) NOT NULL,
    talla character varying(20) NOT NULL,
    descripcion text,
    genero character varying(20) DEFAULT 'unisex'::character varying NOT NULL,
    equivalencia_numerica integer,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.tallas OWNER TO parroquia_user;

--
-- TOC entry 258 (class 1259 OID 16822)
-- Name: tallas_id_talla_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.tallas_id_talla_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tallas_id_talla_seq OWNER TO parroquia_user;

--
-- TOC entry 4030 (class 0 OID 0)
-- Dependencies: 258
-- Name: tallas_id_talla_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.tallas_id_talla_seq OWNED BY public.tallas.id_talla;


--
-- TOC entry 259 (class 1259 OID 16823)
-- Name: tipo_identificacion; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.tipo_identificacion (
    id_tipo_identificacion bigint NOT NULL,
    descripcion character varying(255) NOT NULL,
    codigo character varying(10) NOT NULL
);


ALTER TABLE public.tipo_identificacion OWNER TO parroquia_user;

--
-- TOC entry 260 (class 1259 OID 16829)
-- Name: tipo_identificacion_id_tipo_identificacion_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.tipo_identificacion_id_tipo_identificacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipo_identificacion_id_tipo_identificacion_seq OWNER TO parroquia_user;

--
-- TOC entry 4031 (class 0 OID 0)
-- Dependencies: 260
-- Name: tipo_identificacion_id_tipo_identificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.tipo_identificacion_id_tipo_identificacion_seq OWNED BY public.tipo_identificacion.id_tipo_identificacion;


--
-- TOC entry 296 (class 1259 OID 17937)
-- Name: tipos_aguas_residuales; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.tipos_aguas_residuales (
    id_tipo_aguas_residuales bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(200),
    activo boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.tipos_aguas_residuales OWNER TO parroquia_user;

--
-- TOC entry 295 (class 1259 OID 17936)
-- Name: tipos_aguas_residuales_id_tipo_aguas_residuales_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.tipos_aguas_residuales_id_tipo_aguas_residuales_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipos_aguas_residuales_id_tipo_aguas_residuales_seq OWNER TO parroquia_user;

--
-- TOC entry 4032 (class 0 OID 0)
-- Dependencies: 295
-- Name: tipos_aguas_residuales_id_tipo_aguas_residuales_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.tipos_aguas_residuales_id_tipo_aguas_residuales_seq OWNED BY public.tipos_aguas_residuales.id_tipo_aguas_residuales;


--
-- TOC entry 261 (class 1259 OID 16840)
-- Name: tipos_disposicion_basura; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.tipos_disposicion_basura (
    id_tipo_disposicion_basura bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.tipos_disposicion_basura OWNER TO parroquia_user;

--
-- TOC entry 262 (class 1259 OID 16849)
-- Name: tipos_disposicion_basura_id_tipo_disposicion_basura_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.tipos_disposicion_basura_id_tipo_disposicion_basura_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipos_disposicion_basura_id_tipo_disposicion_basura_seq OWNER TO parroquia_user;

--
-- TOC entry 4033 (class 0 OID 0)
-- Dependencies: 262
-- Name: tipos_disposicion_basura_id_tipo_disposicion_basura_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.tipos_disposicion_basura_id_tipo_disposicion_basura_seq OWNED BY public.tipos_disposicion_basura.id_tipo_disposicion_basura;


--
-- TOC entry 263 (class 1259 OID 16850)
-- Name: tipos_identificacion; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.tipos_identificacion (
    id_tipo_identificacion bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    codigo character varying(10) NOT NULL,
    descripcion text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.tipos_identificacion OWNER TO parroquia_user;

--
-- TOC entry 264 (class 1259 OID 16860)
-- Name: tipos_identificacion_id_tipo_identificacion_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.tipos_identificacion_id_tipo_identificacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipos_identificacion_id_tipo_identificacion_seq OWNER TO parroquia_user;

--
-- TOC entry 4034 (class 0 OID 0)
-- Dependencies: 264
-- Name: tipos_identificacion_id_tipo_identificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.tipos_identificacion_id_tipo_identificacion_seq OWNED BY public.tipos_identificacion.id_tipo_identificacion;


--
-- TOC entry 265 (class 1259 OID 16861)
-- Name: tipos_vivienda; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.tipos_vivienda (
    id_tipo_vivienda bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion character varying(255),
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.tipos_vivienda OWNER TO parroquia_user;

--
-- TOC entry 4035 (class 0 OID 0)
-- Dependencies: 265
-- Name: COLUMN tipos_vivienda.activo; Type: COMMENT; Schema: public; Owner: parroquia_user
--

COMMENT ON COLUMN public.tipos_vivienda.activo IS 'Indica si el tipo de vivienda está activo';


--
-- TOC entry 266 (class 1259 OID 16872)
-- Name: tipos_vivienda_id_tipo_vivienda_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.tipos_vivienda_id_tipo_vivienda_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipos_vivienda_id_tipo_vivienda_seq OWNER TO parroquia_user;

--
-- TOC entry 4036 (class 0 OID 0)
-- Dependencies: 266
-- Name: tipos_vivienda_id_tipo_vivienda_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.tipos_vivienda_id_tipo_vivienda_seq OWNED BY public.tipos_vivienda.id_tipo_vivienda;


--
-- TOC entry 280 (class 1259 OID 17836)
-- Name: tipos_viviendas; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.tipos_viviendas (
    id_tipo bigint NOT NULL,
    descripcion character varying(100) NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.tipos_viviendas OWNER TO parroquia_user;

--
-- TOC entry 279 (class 1259 OID 17835)
-- Name: tipos_viviendas_id_tipo_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.tipos_viviendas_id_tipo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipos_viviendas_id_tipo_seq OWNER TO parroquia_user;

--
-- TOC entry 4037 (class 0 OID 0)
-- Dependencies: 279
-- Name: tipos_viviendas_id_tipo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.tipos_viviendas_id_tipo_seq OWNED BY public.tipos_viviendas.id_tipo;


--
-- TOC entry 297 (class 1259 OID 17970)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.usuarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    correo_electronico character varying(255) NOT NULL,
    contrasena character varying(255) NOT NULL,
    primer_nombre character varying(100),
    segundo_nombre character varying(100),
    primer_apellido character varying(100),
    segundo_apellido character varying(100),
    numero_documento character varying(20),
    telefono character varying(20),
    activo boolean DEFAULT true,
    fecha_ultimo_acceso timestamp with time zone,
    intentos_fallidos integer DEFAULT 0,
    bloqueado_hasta timestamp with time zone,
    token_recuperacion character varying(255),
    token_expiracion timestamp with time zone,
    email_verificado boolean DEFAULT false,
    token_verificacion_email character varying(255),
    fecha_verificacion_email timestamp with time zone,
    expira_token_reset timestamp with time zone,
    refresh_token text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.usuarios OWNER TO parroquia_user;

--
-- TOC entry 301 (class 1259 OID 18005)
-- Name: usuarios_roles; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.usuarios_roles (
    id integer NOT NULL,
    usuario_id uuid,
    rol_id integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.usuarios_roles OWNER TO parroquia_user;

--
-- TOC entry 300 (class 1259 OID 18004)
-- Name: usuarios_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.usuarios_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_roles_id_seq OWNER TO parroquia_user;

--
-- TOC entry 4038 (class 0 OID 0)
-- Dependencies: 300
-- Name: usuarios_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.usuarios_roles_id_seq OWNED BY public.usuarios_roles.id;


--
-- TOC entry 276 (class 1259 OID 17807)
-- Name: veredas; Type: TABLE; Schema: public; Owner: parroquia_user
--

CREATE TABLE public.veredas (
    id_vereda bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    id_sector bigint,
    activo boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.veredas OWNER TO parroquia_user;

--
-- TOC entry 275 (class 1259 OID 17806)
-- Name: veredas_id_vereda_seq; Type: SEQUENCE; Schema: public; Owner: parroquia_user
--

CREATE SEQUENCE public.veredas_id_vereda_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.veredas_id_vereda_seq OWNER TO parroquia_user;

--
-- TOC entry 4039 (class 0 OID 0)
-- Dependencies: 275
-- Name: veredas_id_vereda_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: parroquia_user
--

ALTER SEQUENCE public.veredas_id_vereda_seq OWNED BY public.veredas.id_vereda;


--
-- TOC entry 3520 (class 2604 OID 16914)
-- Name: comunidades_culturales id_comunidad_cultural; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.comunidades_culturales ALTER COLUMN id_comunidad_cultural SET DEFAULT nextval('public.comunidades_culturales_id_comunidad_cultural_seq'::regclass);


--
-- TOC entry 3557 (class 2604 OID 17748)
-- Name: departamentos id_departamento; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.departamentos ALTER COLUMN id_departamento SET DEFAULT nextval('public.departamentos_id_departamento_seq'::regclass);


--
-- TOC entry 3522 (class 2604 OID 16916)
-- Name: destrezas id_destreza; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.destrezas ALTER COLUMN id_destreza SET DEFAULT nextval('public.destrezas_id_destreza_seq'::regclass);


--
-- TOC entry 3523 (class 2604 OID 16917)
-- Name: difuntos_familia id_difunto; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.difuntos_familia ALTER COLUMN id_difunto SET DEFAULT nextval('public.difuntos_familia_id_difunto_seq'::regclass);


--
-- TOC entry 3524 (class 2604 OID 16918)
-- Name: encuestas id_encuesta; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.encuestas ALTER COLUMN id_encuesta SET DEFAULT nextval('public.encuestas_id_encuesta_seq'::regclass);


--
-- TOC entry 3572 (class 2604 OID 17863)
-- Name: enfermedades id_enfermedad; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.enfermedades ALTER COLUMN id_enfermedad SET DEFAULT nextval('public.enfermedades_id_enfermedad_seq'::regclass);


--
-- TOC entry 3570 (class 2604 OID 17851)
-- Name: estados_civiles id_estado; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.estados_civiles ALTER COLUMN id_estado SET DEFAULT nextval('public.estados_civiles_id_estado_seq'::regclass);


--
-- TOC entry 3526 (class 2604 OID 16921)
-- Name: familia_aguas_residuales id; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familia_aguas_residuales ALTER COLUMN id SET DEFAULT nextval('public.familia_aguas_residuales_id_seq'::regclass);


--
-- TOC entry 3529 (class 2604 OID 16922)
-- Name: familia_disposicion_basura id; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familia_disposicion_basura ALTER COLUMN id SET DEFAULT nextval('public.familia_disposicion_basura_id_seq'::regclass);


--
-- TOC entry 3530 (class 2604 OID 16923)
-- Name: familia_disposicion_basuras id; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familia_disposicion_basuras ALTER COLUMN id SET DEFAULT nextval('public.familia_disposicion_basuras_id_seq'::regclass);


--
-- TOC entry 3533 (class 2604 OID 16924)
-- Name: familia_sistema_acueducto id; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familia_sistema_acueducto ALTER COLUMN id SET DEFAULT nextval('public.familia_sistema_acueducto_id_seq'::regclass);


--
-- TOC entry 3581 (class 2604 OID 17904)
-- Name: familia_sistema_acueductos id; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familia_sistema_acueductos ALTER COLUMN id SET DEFAULT nextval('public.familia_sistema_acueductos_id_seq'::regclass);


--
-- TOC entry 3583 (class 2604 OID 17928)
-- Name: familia_sistema_aguas_residuales id; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familia_sistema_aguas_residuales ALTER COLUMN id SET DEFAULT nextval('public.familia_sistema_aguas_residuales_id_seq'::regclass);


--
-- TOC entry 3582 (class 2604 OID 17916)
-- Name: familia_tipo_viviendas id; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familia_tipo_viviendas ALTER COLUMN id SET DEFAULT nextval('public.familia_tipo_viviendas_id_seq'::regclass);


--
-- TOC entry 3574 (class 2604 OID 17875)
-- Name: familias id_familia; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familias ALTER COLUMN id_familia SET DEFAULT nextval('public.familias_id_familia_seq'::regclass);


--
-- TOC entry 3559 (class 2604 OID 17760)
-- Name: municipios id_municipio; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.municipios ALTER COLUMN id_municipio SET DEFAULT nextval('public.municipios_id_municipio_seq'::regclass);


--
-- TOC entry 3534 (class 2604 OID 16930)
-- Name: niveles_educativos id_niveles_educativos; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.niveles_educativos ALTER COLUMN id_niveles_educativos SET DEFAULT nextval('public.niveles_educativos_id_niveles_educativos_seq'::regclass);


--
-- TOC entry 3536 (class 2604 OID 16931)
-- Name: parentescos id_parentesco; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.parentescos ALTER COLUMN id_parentesco SET DEFAULT nextval('public.parentescos_id_parentesco_seq'::regclass);


--
-- TOC entry 3538 (class 2604 OID 16932)
-- Name: parroquia id_parroquia; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.parroquia ALTER COLUMN id_parroquia SET DEFAULT nextval('public.parroquia_id_parroquia_seq'::regclass);


--
-- TOC entry 3561 (class 2604 OID 17777)
-- Name: parroquias id_parroquia; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.parroquias ALTER COLUMN id_parroquia SET DEFAULT nextval('public.parroquias_id_parroquia_seq'::regclass);


--
-- TOC entry 3580 (class 2604 OID 17892)
-- Name: personas id_personas; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.personas ALTER COLUMN id_personas SET DEFAULT nextval('public.personas_id_personas_seq'::regclass);


--
-- TOC entry 3541 (class 2604 OID 16935)
-- Name: profesiones id_profesion; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.profesiones ALTER COLUMN id_profesion SET DEFAULT nextval('public.profesiones_id_profesion_seq'::regclass);


--
-- TOC entry 3592 (class 2604 OID 17992)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 3542 (class 2604 OID 16936)
-- Name: sector id_sector; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sector ALTER COLUMN id_sector SET DEFAULT nextval('public.sector_id_sector_seq'::regclass);


--
-- TOC entry 3562 (class 2604 OID 17793)
-- Name: sectores id_sector; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sectores ALTER COLUMN id_sector SET DEFAULT nextval('public.sectores_id_sector_seq'::regclass);


--
-- TOC entry 3543 (class 2604 OID 16938)
-- Name: sexo id_sexo; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sexo ALTER COLUMN id_sexo SET DEFAULT nextval('public.sexo_id_sexo_seq'::regclass);


--
-- TOC entry 3544 (class 2604 OID 16939)
-- Name: sexos id_sexo; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sexos ALTER COLUMN id_sexo SET DEFAULT nextval('public.sexos_id_sexo_seq'::regclass);


--
-- TOC entry 3545 (class 2604 OID 16940)
-- Name: sistemas_acueducto id_sistema_acueducto; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sistemas_acueducto ALTER COLUMN id_sistema_acueducto SET DEFAULT nextval('public.sistemas_acueducto_id_sistema_acueducto_seq'::regclass);


--
-- TOC entry 3566 (class 2604 OID 17827)
-- Name: sistemas_acueductos id_sistema; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sistemas_acueductos ALTER COLUMN id_sistema SET DEFAULT nextval('public.sistemas_acueductos_id_sistema_seq'::regclass);


--
-- TOC entry 3546 (class 2604 OID 16942)
-- Name: situaciones_civiles id_situacion_civil; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.situaciones_civiles ALTER COLUMN id_situacion_civil SET DEFAULT nextval('public.situaciones_civiles_id_situacion_civil_seq'::regclass);


--
-- TOC entry 3549 (class 2604 OID 16943)
-- Name: tallas id_talla; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tallas ALTER COLUMN id_talla SET DEFAULT nextval('public.tallas_id_talla_seq'::regclass);


--
-- TOC entry 3552 (class 2604 OID 16944)
-- Name: tipo_identificacion id_tipo_identificacion; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tipo_identificacion ALTER COLUMN id_tipo_identificacion SET DEFAULT nextval('public.tipo_identificacion_id_tipo_identificacion_seq'::regclass);


--
-- TOC entry 3584 (class 2604 OID 17940)
-- Name: tipos_aguas_residuales id_tipo_aguas_residuales; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tipos_aguas_residuales ALTER COLUMN id_tipo_aguas_residuales SET DEFAULT nextval('public.tipos_aguas_residuales_id_tipo_aguas_residuales_seq'::regclass);


--
-- TOC entry 3553 (class 2604 OID 16946)
-- Name: tipos_disposicion_basura id_tipo_disposicion_basura; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tipos_disposicion_basura ALTER COLUMN id_tipo_disposicion_basura SET DEFAULT nextval('public.tipos_disposicion_basura_id_tipo_disposicion_basura_seq'::regclass);


--
-- TOC entry 3554 (class 2604 OID 16947)
-- Name: tipos_identificacion id_tipo_identificacion; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tipos_identificacion ALTER COLUMN id_tipo_identificacion SET DEFAULT nextval('public.tipos_identificacion_id_tipo_identificacion_seq'::regclass);


--
-- TOC entry 3555 (class 2604 OID 16948)
-- Name: tipos_vivienda id_tipo_vivienda; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tipos_vivienda ALTER COLUMN id_tipo_vivienda SET DEFAULT nextval('public.tipos_vivienda_id_tipo_vivienda_seq'::regclass);


--
-- TOC entry 3568 (class 2604 OID 17839)
-- Name: tipos_viviendas id_tipo; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tipos_viviendas ALTER COLUMN id_tipo SET DEFAULT nextval('public.tipos_viviendas_id_tipo_seq'::regclass);


--
-- TOC entry 3596 (class 2604 OID 18008)
-- Name: usuarios_roles id; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.usuarios_roles ALTER COLUMN id SET DEFAULT nextval('public.usuarios_roles_id_seq'::regclass);


--
-- TOC entry 3564 (class 2604 OID 17810)
-- Name: veredas id_vereda; Type: DEFAULT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.veredas ALTER COLUMN id_vereda SET DEFAULT nextval('public.veredas_id_vereda_seq'::regclass);


--
-- TOC entry 3906 (class 0 OID 16469)
-- Dependencies: 219
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public."SequelizeMeta" (name) FROM stdin;
20240101000001-create-departamentos.cjs
20240101000002-create-municipios.cjs
20240101000003-create-parroquias.cjs
20240101000004-create-veredas.cjs
20240101000005-create-sectores.cjs
20240101000006-create-profesiones.cjs
20240101000007-create-enfermedades.cjs
20240101000008-create-destrezas.cjs
20240101000009-create-tipos-vivienda.cjs
20240101000010-create-sistemas-acueducto.cjs
20240101000011-create-tipos-aguas-residuales.cjs
20240101000012-create-tipos-disposicion-basura.cjs
20240101000013-create-familias.cjs
20240101000014-create-personas.cjs
20240101000015-create-encuestas.cjs
20240101000016-create-persona-enfermedad.cjs
20240101000017-create-persona-destreza.cjs
20240101000018-create-familia-tipo-vivienda.cjs
20240101000019-create-familia-sistema-acueducto.cjs
20240101000020-create-familia-sistema-aguas-residuales.cjs
20240101000021-create-familia-disposicion-basura.cjs
20240101000022-create-tipos-identificacion.cjs
20240101000023-create-estados-civiles.cjs
20240101000024-add-foreign-keys-personas.cjs
20240101000025-create-sexos.cjs
20240101000026-add-id-sexo-to-personas.cjs
20240101000027-remove-sexo-field-from-personas.cjs
20240101000028-remove-fields-from-personas.cjs
20250803202624-remove-calzado-from-personas.cjs
20240101000029-create-roles.cjs
\.


--
-- TOC entry 3907 (class 0 OID 16473)
-- Dependencies: 220
-- Data for Name: comunidades_culturales; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.comunidades_culturales (id_comunidad_cultural, nombre, descripcion, activo, "createdAt", "updatedAt") FROM stdin;
1	Afrodescendiente	Comunidad de personas afrodescendientes	t	2025-09-04 20:16:22.126+00	2025-09-04 20:16:22.126+00
\.


--
-- TOC entry 3955 (class 0 OID 17745)
-- Dependencies: 268
-- Data for Name: departamentos; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.departamentos (id_departamento, nombre, codigo, activo, created_at, updated_at) FROM stdin;
1	Antioquia	05	t	2025-09-29 22:05:27.497+00	2025-09-29 22:05:27.497+00
2	Cundinamarca	25	t	2025-09-29 22:05:27.505+00	2025-09-29 22:05:27.505+00
3	Valle del Cauca	76	t	2025-09-29 22:05:27.507+00	2025-09-29 22:05:27.507+00
\.


--
-- TOC entry 3909 (class 0 OID 16494)
-- Dependencies: 222
-- Data for Name: destrezas; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.destrezas (id_destreza, nombre, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3911 (class 0 OID 16502)
-- Dependencies: 224
-- Data for Name: difuntos_familia; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.difuntos_familia (id_difunto, nombre_completo, fecha_fallecimiento, observaciones, id_familia_familias, "createdAt", "updatedAt", id_sexo, id_parentesco, causa_fallecimiento) FROM stdin;
1	Pedro Antonio Los Alvarez	2020-05-15	Enfermedad cardiovascular	\N	2025-09-11 05:16:42.952+00	2025-09-11 05:16:42.953+00	1	2	Enfermedad cardiovascular
2	Pecas Garzon Rodriguez	2020-05-15	Enfermedad cardiovascular	\N	2025-09-11 05:23:25.674+00	2025-09-11 05:23:25.674+00	1	2	Enfermedad cardiovascular
\.


--
-- TOC entry 3913 (class 0 OID 16513)
-- Dependencies: 226
-- Data for Name: encuestas; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.encuestas (id_encuesta, id_parroquia, id_municipio, fecha, id_sector, id_vereda, observaciones, tratamiento_datos, firma, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3971 (class 0 OID 17860)
-- Dependencies: 284
-- Data for Name: enfermedades; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.enfermedades (id_enfermedad, descripcion, activo, created_at, updated_at) FROM stdin;
1	Diabetes	t	2025-09-29 22:05:27.601+00	2025-09-29 22:05:27.601+00
2	Hipertensión	t	2025-09-29 22:05:27.606+00	2025-09-29 22:05:27.606+00
3	Cardiopatía	t	2025-09-29 22:05:27.608+00	2025-09-29 22:05:27.608+00
4	Asma	t	2025-09-29 22:05:27.609+00	2025-09-29 22:05:27.609+00
5	Artritis	t	2025-09-29 22:05:27.611+00	2025-09-29 22:05:27.611+00
6	Otra	t	2025-09-29 22:05:27.614+00	2025-09-29 22:05:27.614+00
\.


--
-- TOC entry 3969 (class 0 OID 17848)
-- Dependencies: 282
-- Data for Name: estados_civiles; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.estados_civiles (id_estado, descripcion, activo, created_at, updated_at) FROM stdin;
1	Soltero(a)	t	2025-09-29 22:05:27.587+00	2025-09-29 22:05:27.587+00
2	Casado(a)	t	2025-09-29 22:05:27.592+00	2025-09-29 22:05:27.592+00
3	Unión Libre	t	2025-09-29 22:05:27.594+00	2025-09-29 22:05:27.594+00
4	Divorciado(a)	t	2025-09-29 22:05:27.596+00	2025-09-29 22:05:27.596+00
5	Viudo(a)	t	2025-09-29 22:05:27.597+00	2025-09-29 22:05:27.597+00
6	Separado(a)	t	2025-09-29 22:05:27.598+00	2025-09-29 22:05:27.598+00
\.


--
-- TOC entry 3915 (class 0 OID 16548)
-- Dependencies: 228
-- Data for Name: familia_aguas_residuales; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.familia_aguas_residuales (id, id_familia, tipo_tratamiento, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3917 (class 0 OID 16557)
-- Dependencies: 230
-- Data for Name: familia_disposicion_basura; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.familia_disposicion_basura (id, id_familia, id_tipo_disposicion_basura, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3919 (class 0 OID 16566)
-- Dependencies: 232
-- Data for Name: familia_disposicion_basuras; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.familia_disposicion_basuras (id, id_familia, disposicion, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3921 (class 0 OID 16575)
-- Dependencies: 234
-- Data for Name: familia_sistema_acueducto; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.familia_sistema_acueducto (id_familia, id_sistema_acueducto, id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3977 (class 0 OID 17901)
-- Dependencies: 290
-- Data for Name: familia_sistema_acueductos; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.familia_sistema_acueductos (id, id_familia, id_sistema_acueducto, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3981 (class 0 OID 17925)
-- Dependencies: 294
-- Data for Name: familia_sistema_aguas_residuales; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.familia_sistema_aguas_residuales (id, id_familia, id_tipo_aguas_residuales, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3923 (class 0 OID 16602)
-- Dependencies: 236
-- Data for Name: familia_tipo_vivienda; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.familia_tipo_vivienda (id_familia, id_tipo_vivienda, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3979 (class 0 OID 17913)
-- Dependencies: 292
-- Data for Name: familia_tipo_viviendas; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.familia_tipo_viviendas (id, id_familia, id_tipo_vivienda, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3973 (class 0 OID 17872)
-- Dependencies: 286
-- Data for Name: familias; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.familias (id_familia, apellido_familiar, sector, direccion_familia, numero_contacto, telefono, email, "tamaño_familia", tipo_vivienda, estado_encuesta, numero_encuestas, fecha_ultima_encuesta, codigo_familia, tutor_responsable, id_municipio, id_vereda, id_sector, "comunionEnCasa", numero_contrato_epm, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3957 (class 0 OID 17757)
-- Dependencies: 270
-- Data for Name: municipios; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.municipios (id_municipio, nombre, codigo, id_departamento, activo, created_at, updated_at) FROM stdin;
1	Medellín	05001	1	t	2025-09-29 22:05:27.509+00	2025-09-29 22:05:27.509+00
2	Envigado	05266	1	t	2025-09-29 22:05:27.513+00	2025-09-29 22:05:27.513+00
3	Bogotá D.C.	25001	2	t	2025-09-29 22:05:27.515+00	2025-09-29 22:05:27.515+00
4	Cali	76001	3	t	2025-09-29 22:05:27.518+00	2025-09-29 22:05:27.518+00
\.


--
-- TOC entry 3924 (class 0 OID 16656)
-- Dependencies: 237
-- Data for Name: niveles_educativos; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.niveles_educativos (id_niveles_educativos, nivel, descripcion, orden_nivel, activo, "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	Educación Primaria	Nivel básico de educación formal	1	t	2025-09-04 20:14:48.526+00	2025-09-04 20:14:48.526+00	\N
2	Sin Educación Formal	Persona sin educación formal	0	t	2025-09-05 03:38:50.837208+00	2025-09-05 03:38:50.837208+00	\N
3	Educación Secundaria	Educación media o bachillerato	2	t	2025-09-05 03:38:50.844761+00	2025-09-05 03:38:50.844761+00	\N
4	Técnico	Formación técnica especializada	3	t	2025-09-05 03:38:50.848799+00	2025-09-05 03:38:50.848799+00	\N
5	Tecnológico	Formación tecnológica superior	4	t	2025-09-05 03:38:50.852867+00	2025-09-05 03:38:50.852867+00	\N
6	Universitario	Educación universitaria de pregrado	5	t	2025-09-05 03:38:50.856235+00	2025-09-05 03:38:50.856235+00	\N
7	Especialización	Estudios de especialización universitaria	6	t	2025-09-05 03:38:50.859568+00	2025-09-05 03:38:50.859568+00	\N
8	Maestría	Estudios de maestría o magíster	7	t	2025-09-05 03:38:50.862981+00	2025-09-05 03:38:50.862981+00	\N
9	Doctorado	Estudios doctorales	8	t	2025-09-05 03:38:50.866468+00	2025-09-05 03:38:50.866468+00	\N
\.


--
-- TOC entry 3926 (class 0 OID 16668)
-- Dependencies: 239
-- Data for Name: parentescos; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.parentescos (id_parentesco, nombre, descripcion, activo, "createdAt", "updatedAt") FROM stdin;
1	Abuelo	Abuelo paterno o materno	t	2025-09-04 20:14:04.598+00	2025-09-04 20:14:04.598+00
2	Padre	Padre biológico o adoptivo	t	2025-09-11 04:09:39.36679+00	2025-09-11 04:09:39.36679+00
3	Madre	Madre biológica o adoptiva	t	2025-09-11 04:09:39.372015+00	2025-09-11 04:09:39.372015+00
4	Hijo	Hijo biológico o adoptivo	t	2025-09-11 04:09:39.37491+00	2025-09-11 04:09:39.37491+00
5	Hija	Hija biológica o adoptiva	t	2025-09-11 04:09:39.378252+00	2025-09-11 04:09:39.378252+00
6	Hermano	Hermano	t	2025-09-11 04:09:39.381701+00	2025-09-11 04:09:39.381701+00
7	Hermana	Hermana	t	2025-09-11 04:09:39.384997+00	2025-09-11 04:09:39.384997+00
8	Abuela	Abuela paterna o materna	t	2025-09-11 04:09:39.388781+00	2025-09-11 04:09:39.388781+00
9	Esposo	Esposo	t	2025-09-11 04:09:39.392321+00	2025-09-11 04:09:39.392321+00
10	Esposa	Esposa	t	2025-09-11 04:09:39.395375+00	2025-09-11 04:09:39.395375+00
11	Nieto	Nieto	t	2025-09-11 04:09:39.398237+00	2025-09-11 04:09:39.398237+00
12	Nieta	Nieta	t	2025-09-11 04:09:39.400973+00	2025-09-11 04:09:39.400973+00
13	Tío	Tío	t	2025-09-11 04:09:39.40412+00	2025-09-11 04:09:39.40412+00
14	Tía	Tía	t	2025-09-11 04:09:39.40793+00	2025-09-11 04:09:39.40793+00
15	Primo	Primo	t	2025-09-11 04:09:39.411733+00	2025-09-11 04:09:39.411733+00
16	Prima	Prima	t	2025-09-11 04:09:39.415489+00	2025-09-11 04:09:39.415489+00
17	Suegro	Suegro	t	2025-09-11 04:09:39.418935+00	2025-09-11 04:09:39.418935+00
18	Suegra	Suegra	t	2025-09-11 04:09:39.422271+00	2025-09-11 04:09:39.422271+00
19	Yerno	Yerno	t	2025-09-11 04:09:39.425353+00	2025-09-11 04:09:39.425353+00
20	Nuera	Nuera	t	2025-09-11 04:09:39.428624+00	2025-09-11 04:09:39.428624+00
21	Cuñado	Cuñado	t	2025-09-11 04:09:39.432184+00	2025-09-11 04:09:39.432184+00
22	Cuñada	Cuñada	t	2025-09-11 04:09:39.435701+00	2025-09-11 04:09:39.435701+00
23	Otro	Otro parentesco no especificado	t	2025-09-11 04:09:39.438423+00	2025-09-11 04:09:39.438423+00
\.


--
-- TOC entry 3928 (class 0 OID 16680)
-- Dependencies: 241
-- Data for Name: parroquia; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.parroquia (id_parroquia, nombre, id_municipio, direccion, telefono, email, created_at, updated_at) FROM stdin;
7	Parroquia San José	1	Carrera 50 # 45-32, El Poblado	+57 4 123-4567	contacto@parroquiasanjose.com	2025-09-29 22:43:00.546099+00	2025-09-29 22:43:00.546099+00
8	Parroquia Sagrado Corazón	1	Calle 10 # 23-45, Centro	+57 4 567-8910	info@sagradocorazon.com	2025-09-29 22:43:00.550932+00	2025-09-29 22:43:00.550932+00
9	Parroquia La Inmaculada	2	Avenida 80 # 12-34, Laureles	+57 4 890-1234	inmaculada@parroquia.org	2025-09-29 22:43:00.555724+00	2025-09-29 22:43:00.555724+00
10	Parroquia de Prueba Diagnóstico	3	Calle de Diagnóstico #123	+57 300 555 0123	diagnostico@parroquia.test	2025-09-29 23:00:36.305215+00	2025-09-29 23:00:36.305215+00
11	Parroquia San Pedro	1	Carrera 50 # 45-32	+57 4 123-4567	contacto@parroquiasanjose.com	2025-09-29 23:00:58.651214+00	2025-09-29 23:00:58.651214+00
12	Parroquia Santa María - Prueba Formato	1	Avenida Principal #456	+57 4 987-6543	santamaria@parroquia.test	2025-09-29 23:02:48.354293+00	2025-09-29 23:02:48.354293+00
13	Parroquia Santa María - Prueba Formato	1	Avenida Principal #456	+57 4 987-6543	santamaria@parroquia.test	2025-09-29 23:04:55.041+00	2025-09-29 23:04:55.041+00
14	Parroquia San juancho	1	Carrera 50 # 45-32	+57 4 123-4567	contacto@parroquiasanjose.com	2025-09-29 23:06:16.682+00	2025-09-29 23:06:16.682+00
\.


--
-- TOC entry 3959 (class 0 OID 17774)
-- Dependencies: 272
-- Data for Name: parroquias; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.parroquias (id_parroquia, nombre, id_municipio, created_at, updated_at) FROM stdin;
1	San José	1	2025-09-29 22:05:27.523+00	2025-09-29 22:05:27.523+00
2	Sagrado Corazón	1	2025-09-29 22:05:27.526+00	2025-09-29 22:05:27.526+00
3	Nuestra Señora de Fátima	2	2025-09-29 22:05:27.528+00	2025-09-29 22:05:27.528+00
4	La Inmaculada	3	2025-09-29 22:05:27.53+00	2025-09-29 22:05:27.53+00
5	San Francisco	4	2025-09-29 22:05:27.532+00	2025-09-29 22:05:27.532+00
\.


--
-- TOC entry 3930 (class 0 OID 16695)
-- Dependencies: 243
-- Data for Name: persona_destreza; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.persona_destreza ("createdAt", "updatedAt", id_destrezas_destrezas, id_personas_personas) FROM stdin;
\.


--
-- TOC entry 3931 (class 0 OID 16702)
-- Dependencies: 244
-- Data for Name: persona_enfermedad; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.persona_enfermedad (id_persona, id_enfermedad, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3975 (class 0 OID 17889)
-- Dependencies: 288
-- Data for Name: personas; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.personas (id_personas, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, id_tipo_identificacion_tipo_identificacion, identificacion, telefono, correo_electronico, fecha_nacimiento, direccion, id_familia_familias, id_estado_civil_estado_civil, estudios, en_que_eres_lider, necesidad_enfermo, id_profesion, id_sexo, talla_camisa, talla_pantalon, talla_zapato, id_familia, id_parroquia, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3932 (class 0 OID 16723)
-- Dependencies: 245
-- Data for Name: profesiones; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.profesiones (id_profesion, nombre, descripcion, created_at, updated_at) FROM stdin;
1	Ingeniero	Profesión de Ingeniería	2025-09-04 22:48:50.4363+00	2025-09-04 22:48:50.4363+00
2	Contador	Profesión de Contaduría	2025-09-04 22:48:50.4363+00	2025-09-04 22:48:50.4363+00
\.


--
-- TOC entry 3986 (class 0 OID 17989)
-- Dependencies: 299
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.roles (id, nombre, descripcion, activo, created_at, updated_at) FROM stdin;
1	admin	Administrador del sistema	t	2025-09-29 22:43:00.436138+00	2025-09-29 22:43:00.436138+00
2	user	Usuario normal	t	2025-09-29 22:43:00.444172+00	2025-09-29 22:43:00.444172+00
\.


--
-- TOC entry 3934 (class 0 OID 16740)
-- Dependencies: 247
-- Data for Name: sector; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.sector (id_sector, nombre, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3961 (class 0 OID 17790)
-- Dependencies: 274
-- Data for Name: sectores; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.sectores (id_sector, nombre, id_parroquia, activo, created_at, updated_at) FROM stdin;
1	Centro	1	t	2025-09-29 22:05:27.536+00	2025-09-29 22:05:27.536+00
2	Norte	1	t	2025-09-29 22:05:27.539+00	2025-09-29 22:05:27.539+00
3	Sur	2	t	2025-09-29 22:05:27.541+00	2025-09-29 22:05:27.541+00
4	Occidental	3	t	2025-09-29 22:05:27.543+00	2025-09-29 22:05:27.543+00
\.


--
-- TOC entry 3936 (class 0 OID 16757)
-- Dependencies: 249
-- Data for Name: sexo; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.sexo (id_sexo, descripcion, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3938 (class 0 OID 16765)
-- Dependencies: 251
-- Data for Name: sexos; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.sexos (id_sexo, nombre, codigo, descripcion, created_at, updated_at) FROM stdin;
1	Masculino	M	Sexo masculino	2025-09-04 20:06:15.858+00	2025-09-04 20:06:15.858+00
\.


--
-- TOC entry 3940 (class 0 OID 16776)
-- Dependencies: 253
-- Data for Name: sistemas_acueducto; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.sistemas_acueducto (id_sistema_acueducto, nombre, descripcion, created_at, updated_at) FROM stdin;
1	Acueducto Público	Sistema de acueducto municipal o público	2025-08-08 03:30:57.476+00	2025-08-08 03:30:57.476+00
2	Pozo Profundo	Agua extraída de pozo profundo	2025-08-08 03:30:57.476+00	2025-08-08 03:30:57.476+00
3	Aljibe	Depósito subterráneo para recoger y conservar agua	2025-08-08 03:30:57.476+00	2025-08-08 03:30:57.476+00
4	Río o Quebrada	Agua tomada directamente de fuente natural	2025-08-08 03:30:57.476+00	2025-08-08 03:30:57.476+00
5	Agua Lluvia	Recolección de agua de lluvia	2025-08-08 03:30:57.476+00	2025-08-08 03:30:57.476+00
6	Compra de Agua	Agua adquirida a terceros (carrotanques, etc.)	2025-08-08 03:30:57.476+00	2025-08-08 03:30:57.476+00
7	Otro	Otro sistema de abastecimiento no especificado	2025-08-08 03:30:57.476+00	2025-08-08 03:30:57.476+00
10	Test Sistema Actualizado	Este debería fallar	2025-08-11 00:18:01.549+00	2025-08-11 00:18:01.549+00
13	Test Sistema Automático	Sistema creado durante las pruebas automatizadas	2025-08-11 00:21:37.924+00	2025-08-11 00:21:37.924+00
21	Acueducsdto Público	Sistema de agua potable municipal con cobertura completa	2025-08-11 00:57:53.736+00	2025-08-11 00:57:53.736+00
22	Sistema Comunitario	Sistema de acueducto manejado por la comunidad local	2025-08-13 03:57:23.829+00	2025-08-13 03:57:23.829+00
25	Acueducto Municipal	\N	2025-09-04 06:06:36.145783+00	2025-09-04 06:06:36.145783+00
26	Pozo Propio	\N	2025-09-04 06:06:36.151879+00	2025-09-04 06:06:36.151879+00
27	Agua de Lluvia	\N	2025-09-04 06:06:36.155036+00	2025-09-04 06:06:36.155036+00
29	Carro Tanque	\N	2025-09-04 06:06:36.15928+00	2025-09-04 06:06:36.15928+00
\.


--
-- TOC entry 3965 (class 0 OID 17824)
-- Dependencies: 278
-- Data for Name: sistemas_acueductos; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.sistemas_acueductos (id_sistema, descripcion, activo, created_at, updated_at) FROM stdin;
1	Acueducto Municipal	t	2025-09-29 22:05:27.558+00	2025-09-29 22:05:27.558+00
2	Pozo Propio	t	2025-09-29 22:05:27.561+00	2025-09-29 22:05:27.561+00
3	Agua Lluvia	t	2025-09-29 22:05:27.563+00	2025-09-29 22:05:27.563+00
4	Carrotanque	t	2025-09-29 22:05:27.564+00	2025-09-29 22:05:27.564+00
5	Nacimiento	t	2025-09-29 22:05:27.565+00	2025-09-29 22:05:27.565+00
6	Otro	t	2025-09-29 22:05:27.567+00	2025-09-29 22:05:27.567+00
\.


--
-- TOC entry 3942 (class 0 OID 16795)
-- Dependencies: 255
-- Data for Name: situaciones_civiles; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.situaciones_civiles (id_situacion_civil, nombre, descripcion, codigo, orden, activo, "createdAt", "updatedAt", "fechaEliminacion") FROM stdin;
1	Soltero(a)	Persona que no ha contraído matrimonio	SOL	1	t	2025-09-04 20:17:08.31+00	2025-09-04 20:17:08.31+00	\N
\.


--
-- TOC entry 3944 (class 0 OID 16808)
-- Dependencies: 257
-- Data for Name: tallas; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.tallas (id_talla, tipo_prenda, talla, descripcion, genero, equivalencia_numerica, activo, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3946 (class 0 OID 16823)
-- Dependencies: 259
-- Data for Name: tipo_identificacion; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.tipo_identificacion (id_tipo_identificacion, descripcion, codigo) FROM stdin;
\.


--
-- TOC entry 3983 (class 0 OID 17937)
-- Dependencies: 296
-- Data for Name: tipos_aguas_residuales; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.tipos_aguas_residuales (id_tipo_aguas_residuales, nombre, descripcion, activo, created_at, updated_at) FROM stdin;
1	Alcantarillado	Conectado a red de alcantarillado municipal	t	2025-09-29 22:05:27.615+00	2025-09-29 22:05:27.615+00
2	Pozo Séptico	Sistema de tratamiento individual	t	2025-09-29 22:05:27.623+00	2025-09-29 22:05:27.623+00
3	Letrina	Sistema básico de saneamiento	t	2025-09-29 22:05:27.627+00	2025-09-29 22:05:27.627+00
4	Campo Abierto	Sin sistema de tratamiento	t	2025-09-29 22:05:27.629+00	2025-09-29 22:05:27.629+00
5	Río/Quebrada	Descarga directa a fuente hídrica	t	2025-09-29 22:05:27.63+00	2025-09-29 22:05:27.63+00
6	Otro	Otro sistema no especificado	t	2025-09-29 22:05:27.632+00	2025-09-29 22:05:27.632+00
\.


--
-- TOC entry 3948 (class 0 OID 16840)
-- Dependencies: 261
-- Data for Name: tipos_disposicion_basura; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.tipos_disposicion_basura (id_tipo_disposicion_basura, nombre, descripcion, created_at, updated_at) FROM stdin;
1	Recolección Pública	Servicio municipal de recolección	2025-09-04 19:09:22.979+00	2025-09-04 19:09:22.979+00
2	Quema	Quema de residuos	2025-09-04 19:09:22.983+00	2025-09-04 19:09:22.983+00
3	Entierro	Enterrar los residuos	2025-09-04 19:09:22.986+00	2025-09-04 19:09:22.986+00
4	Reciclaje	Separación y reciclaje	2025-09-04 19:09:22.989+00	2025-09-04 19:09:22.989+00
5	Compostaje	Compostaje de orgánicos	2025-09-04 19:09:22.993+00	2025-09-04 19:09:22.993+00
6	Botadero	Disposición en botadero	2025-09-04 19:09:22.997+00	2025-09-04 19:09:22.997+00
7	Separación por Colores	Separación clasificada por colores	2025-09-04 19:09:23.001+00	2025-09-04 19:09:23.001+00
8	Otro	Otro método no especificado	2025-09-04 19:09:23.004+00	2025-09-04 19:09:23.004+00
\.


--
-- TOC entry 3950 (class 0 OID 16850)
-- Dependencies: 263
-- Data for Name: tipos_identificacion; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.tipos_identificacion (id_tipo_identificacion, nombre, codigo, descripcion, created_at, updated_at) FROM stdin;
1	Cédula de Ciudadanía	CC	Cédula de Ciudadanía	2025-09-04 21:48:57.451+00	2025-09-04 21:48:57.451+00
\.


--
-- TOC entry 3952 (class 0 OID 16861)
-- Dependencies: 265
-- Data for Name: tipos_vivienda; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.tipos_vivienda (id_tipo_vivienda, nombre, descripcion, activo, created_at, updated_at) FROM stdin;
1	Casa	Vivienda tipo casa	t	2025-09-04 19:09:23.009+00	2025-09-04 19:09:23.009+00
2	Apartamento	Vivienda tipo apartamento	t	2025-09-04 19:09:23.012+00	2025-09-04 19:09:23.012+00
3	Finca	Vivienda rural tipo finca	t	2025-09-04 19:09:23.015+00	2025-09-04 19:09:23.015+00
4	Rancho	Vivienda tipo rancho	t	2025-09-04 19:09:23.018+00	2025-09-04 19:09:23.018+00
5	Inquilinato	Vivienda en inquilinato	t	2025-09-04 19:09:23.022+00	2025-09-04 19:09:23.022+00
6	Otro	Otro tipo de vivienda	t	2025-09-04 19:09:23.025+00	2025-09-04 19:09:23.025+00
\.


--
-- TOC entry 3967 (class 0 OID 17836)
-- Dependencies: 280
-- Data for Name: tipos_viviendas; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.tipos_viviendas (id_tipo, descripcion, activo, created_at, updated_at) FROM stdin;
1	Casa Propia	t	2025-09-29 22:05:27.571+00	2025-09-29 22:05:27.571+00
2	Casa Familiar	t	2025-09-29 22:05:27.575+00	2025-09-29 22:05:27.575+00
3	Casa Arrendada	t	2025-09-29 22:05:27.576+00	2025-09-29 22:05:27.576+00
4	Apartamento	t	2025-09-29 22:05:27.579+00	2025-09-29 22:05:27.579+00
5	Cuarto	t	2025-09-29 22:05:27.581+00	2025-09-29 22:05:27.581+00
6	Otro	t	2025-09-29 22:05:27.583+00	2025-09-29 22:05:27.583+00
\.


--
-- TOC entry 3984 (class 0 OID 17970)
-- Dependencies: 297
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.usuarios (id, correo_electronico, contrasena, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, numero_documento, telefono, activo, fecha_ultimo_acceso, intentos_fallidos, bloqueado_hasta, token_recuperacion, token_expiracion, email_verificado, token_verificacion_email, fecha_verificacion_email, expira_token_reset, refresh_token, created_at, updated_at) FROM stdin;
be39851d-fe07-4f95-adf3-25f2b90eace5	admin@parroquia.com	$2b$10$PuiLUJFhcFYckanEnFpEvetIZ607EYNPxz3MdnC0qfvjyq5Xxqui6	Administrador	\N	\N	\N	\N	\N	t	2025-09-29 23:04:54.984+00	0	\N	\N	\N	t	\N	\N	\N	\N	2025-09-29 22:43:00.525415+00	2025-09-29 23:04:54.986+00
\.


--
-- TOC entry 3988 (class 0 OID 18005)
-- Dependencies: 301
-- Data for Name: usuarios_roles; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.usuarios_roles (id, usuario_id, rol_id, created_at, updated_at) FROM stdin;
2	be39851d-fe07-4f95-adf3-25f2b90eace5	1	2025-09-29 22:43:00.532488+00	2025-09-29 22:43:00.532488+00
\.


--
-- TOC entry 3963 (class 0 OID 17807)
-- Dependencies: 276
-- Data for Name: veredas; Type: TABLE DATA; Schema: public; Owner: parroquia_user
--

COPY public.veredas (id_vereda, nombre, id_sector, activo, created_at, updated_at) FROM stdin;
1	La Esperanza	1	t	2025-09-29 22:05:27.545+00	2025-09-29 22:05:27.545+00
2	El Progreso	1	t	2025-09-29 22:05:27.548+00	2025-09-29 22:05:27.548+00
3	San Antonio	2	t	2025-09-29 22:05:27.549+00	2025-09-29 22:05:27.549+00
4	Las Flores	3	t	2025-09-29 22:05:27.554+00	2025-09-29 22:05:27.554+00
\.


--
-- TOC entry 4040 (class 0 OID 0)
-- Dependencies: 221
-- Name: comunidades_culturales_id_comunidad_cultural_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.comunidades_culturales_id_comunidad_cultural_seq', 1, true);


--
-- TOC entry 4041 (class 0 OID 0)
-- Dependencies: 267
-- Name: departamentos_id_departamento_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.departamentos_id_departamento_seq', 3, true);


--
-- TOC entry 4042 (class 0 OID 0)
-- Dependencies: 223
-- Name: destrezas_id_destreza_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.destrezas_id_destreza_seq', 1, false);


--
-- TOC entry 4043 (class 0 OID 0)
-- Dependencies: 225
-- Name: difuntos_familia_id_difunto_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.difuntos_familia_id_difunto_seq', 3, true);


--
-- TOC entry 4044 (class 0 OID 0)
-- Dependencies: 227
-- Name: encuestas_id_encuesta_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.encuestas_id_encuesta_seq', 1, false);


--
-- TOC entry 4045 (class 0 OID 0)
-- Dependencies: 283
-- Name: enfermedades_id_enfermedad_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.enfermedades_id_enfermedad_seq', 6, true);


--
-- TOC entry 4046 (class 0 OID 0)
-- Dependencies: 281
-- Name: estados_civiles_id_estado_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.estados_civiles_id_estado_seq', 6, true);


--
-- TOC entry 4047 (class 0 OID 0)
-- Dependencies: 229
-- Name: familia_aguas_residuales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.familia_aguas_residuales_id_seq', 1, false);


--
-- TOC entry 4048 (class 0 OID 0)
-- Dependencies: 231
-- Name: familia_disposicion_basura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.familia_disposicion_basura_id_seq', 73, true);


--
-- TOC entry 4049 (class 0 OID 0)
-- Dependencies: 233
-- Name: familia_disposicion_basuras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.familia_disposicion_basuras_id_seq', 1, false);


--
-- TOC entry 4050 (class 0 OID 0)
-- Dependencies: 235
-- Name: familia_sistema_acueducto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.familia_sistema_acueducto_id_seq', 105, true);


--
-- TOC entry 4051 (class 0 OID 0)
-- Dependencies: 289
-- Name: familia_sistema_acueductos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.familia_sistema_acueductos_id_seq', 1, false);


--
-- TOC entry 4052 (class 0 OID 0)
-- Dependencies: 293
-- Name: familia_sistema_aguas_residuales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.familia_sistema_aguas_residuales_id_seq', 1, false);


--
-- TOC entry 4053 (class 0 OID 0)
-- Dependencies: 291
-- Name: familia_tipo_viviendas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.familia_tipo_viviendas_id_seq', 1, false);


--
-- TOC entry 4054 (class 0 OID 0)
-- Dependencies: 285
-- Name: familias_id_familia_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.familias_id_familia_seq', 1, false);


--
-- TOC entry 4055 (class 0 OID 0)
-- Dependencies: 269
-- Name: municipios_id_municipio_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.municipios_id_municipio_seq', 4, true);


--
-- TOC entry 4056 (class 0 OID 0)
-- Dependencies: 238
-- Name: niveles_educativos_id_niveles_educativos_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.niveles_educativos_id_niveles_educativos_seq', 9, true);


--
-- TOC entry 4057 (class 0 OID 0)
-- Dependencies: 240
-- Name: parentescos_id_parentesco_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.parentescos_id_parentesco_seq', 23, true);


--
-- TOC entry 4058 (class 0 OID 0)
-- Dependencies: 242
-- Name: parroquia_id_parroquia_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.parroquia_id_parroquia_seq', 14, true);


--
-- TOC entry 4059 (class 0 OID 0)
-- Dependencies: 271
-- Name: parroquias_id_parroquia_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.parroquias_id_parroquia_seq', 5, true);


--
-- TOC entry 4060 (class 0 OID 0)
-- Dependencies: 287
-- Name: personas_id_personas_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.personas_id_personas_seq', 1, false);


--
-- TOC entry 4061 (class 0 OID 0)
-- Dependencies: 246
-- Name: profesiones_id_profesion_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.profesiones_id_profesion_seq', 2, true);


--
-- TOC entry 4062 (class 0 OID 0)
-- Dependencies: 298
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- TOC entry 4063 (class 0 OID 0)
-- Dependencies: 248
-- Name: sector_id_sector_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.sector_id_sector_seq', 1, false);


--
-- TOC entry 4064 (class 0 OID 0)
-- Dependencies: 273
-- Name: sectores_id_sector_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.sectores_id_sector_seq', 4, true);


--
-- TOC entry 4065 (class 0 OID 0)
-- Dependencies: 250
-- Name: sexo_id_sexo_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.sexo_id_sexo_seq', 1, false);


--
-- TOC entry 4066 (class 0 OID 0)
-- Dependencies: 252
-- Name: sexos_id_sexo_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.sexos_id_sexo_seq', 1, true);


--
-- TOC entry 4067 (class 0 OID 0)
-- Dependencies: 254
-- Name: sistemas_acueducto_id_sistema_acueducto_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.sistemas_acueducto_id_sistema_acueducto_seq', 30, true);


--
-- TOC entry 4068 (class 0 OID 0)
-- Dependencies: 277
-- Name: sistemas_acueductos_id_sistema_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.sistemas_acueductos_id_sistema_seq', 6, true);


--
-- TOC entry 4069 (class 0 OID 0)
-- Dependencies: 256
-- Name: situaciones_civiles_id_situacion_civil_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.situaciones_civiles_id_situacion_civil_seq', 1, true);


--
-- TOC entry 4070 (class 0 OID 0)
-- Dependencies: 258
-- Name: tallas_id_talla_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.tallas_id_talla_seq', 1, false);


--
-- TOC entry 4071 (class 0 OID 0)
-- Dependencies: 260
-- Name: tipo_identificacion_id_tipo_identificacion_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.tipo_identificacion_id_tipo_identificacion_seq', 1, false);


--
-- TOC entry 4072 (class 0 OID 0)
-- Dependencies: 295
-- Name: tipos_aguas_residuales_id_tipo_aguas_residuales_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.tipos_aguas_residuales_id_tipo_aguas_residuales_seq', 6, true);


--
-- TOC entry 4073 (class 0 OID 0)
-- Dependencies: 262
-- Name: tipos_disposicion_basura_id_tipo_disposicion_basura_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.tipos_disposicion_basura_id_tipo_disposicion_basura_seq', 8, true);


--
-- TOC entry 4074 (class 0 OID 0)
-- Dependencies: 264
-- Name: tipos_identificacion_id_tipo_identificacion_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.tipos_identificacion_id_tipo_identificacion_seq', 1, true);


--
-- TOC entry 4075 (class 0 OID 0)
-- Dependencies: 266
-- Name: tipos_vivienda_id_tipo_vivienda_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.tipos_vivienda_id_tipo_vivienda_seq', 6, true);


--
-- TOC entry 4076 (class 0 OID 0)
-- Dependencies: 279
-- Name: tipos_viviendas_id_tipo_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.tipos_viviendas_id_tipo_seq', 6, true);


--
-- TOC entry 4077 (class 0 OID 0)
-- Dependencies: 300
-- Name: usuarios_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.usuarios_roles_id_seq', 2, true);


--
-- TOC entry 4078 (class 0 OID 0)
-- Dependencies: 275
-- Name: veredas_id_vereda_seq; Type: SEQUENCE SET; Schema: public; Owner: parroquia_user
--

SELECT pg_catalog.setval('public.veredas_id_vereda_seq', 4, true);


--
-- TOC entry 3600 (class 2606 OID 16952)
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- TOC entry 3605 (class 2606 OID 16954)
-- Name: comunidades_culturales comunidades_culturales_nombre_key; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.comunidades_culturales
    ADD CONSTRAINT comunidades_culturales_nombre_key UNIQUE (nombre);


--
-- TOC entry 3607 (class 2606 OID 16956)
-- Name: comunidades_culturales comunidades_culturales_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.comunidades_culturales
    ADD CONSTRAINT comunidades_culturales_pkey PRIMARY KEY (id_comunidad_cultural);


--
-- TOC entry 3707 (class 2606 OID 17755)
-- Name: departamentos departamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.departamentos
    ADD CONSTRAINT departamentos_pkey PRIMARY KEY (id_departamento);


--
-- TOC entry 3609 (class 2606 OID 16960)
-- Name: destrezas destrezas_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.destrezas
    ADD CONSTRAINT destrezas_pkey PRIMARY KEY (id_destreza);


--
-- TOC entry 3612 (class 2606 OID 16962)
-- Name: difuntos_familia difuntos_familia_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.difuntos_familia
    ADD CONSTRAINT difuntos_familia_pkey PRIMARY KEY (id_difunto);


--
-- TOC entry 3621 (class 2606 OID 16964)
-- Name: encuestas encuestas_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.encuestas
    ADD CONSTRAINT encuestas_pkey PRIMARY KEY (id_encuesta);


--
-- TOC entry 3723 (class 2606 OID 17870)
-- Name: enfermedades enfermedades_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.enfermedades
    ADD CONSTRAINT enfermedades_pkey PRIMARY KEY (id_enfermedad);


--
-- TOC entry 3721 (class 2606 OID 17858)
-- Name: estados_civiles estados_civiles_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.estados_civiles
    ADD CONSTRAINT estados_civiles_pkey PRIMARY KEY (id_estado);


--
-- TOC entry 3623 (class 2606 OID 16972)
-- Name: familia_aguas_residuales familia_aguas_residuales_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familia_aguas_residuales
    ADD CONSTRAINT familia_aguas_residuales_pkey PRIMARY KEY (id);


--
-- TOC entry 3625 (class 2606 OID 16974)
-- Name: familia_disposicion_basura familia_disposicion_basura_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familia_disposicion_basura
    ADD CONSTRAINT familia_disposicion_basura_pkey PRIMARY KEY (id);


--
-- TOC entry 3627 (class 2606 OID 16976)
-- Name: familia_disposicion_basuras familia_disposicion_basuras_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familia_disposicion_basuras
    ADD CONSTRAINT familia_disposicion_basuras_pkey PRIMARY KEY (id);


--
-- TOC entry 3729 (class 2606 OID 17911)
-- Name: familia_sistema_acueductos familia_sistema_acueductos_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familia_sistema_acueductos
    ADD CONSTRAINT familia_sistema_acueductos_pkey PRIMARY KEY (id);


--
-- TOC entry 3733 (class 2606 OID 17935)
-- Name: familia_sistema_aguas_residuales familia_sistema_aguas_residuales_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familia_sistema_aguas_residuales
    ADD CONSTRAINT familia_sistema_aguas_residuales_pkey PRIMARY KEY (id);


--
-- TOC entry 3731 (class 2606 OID 17923)
-- Name: familia_tipo_viviendas familia_tipo_viviendas_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familia_tipo_viviendas
    ADD CONSTRAINT familia_tipo_viviendas_pkey PRIMARY KEY (id);


--
-- TOC entry 3725 (class 2606 OID 17887)
-- Name: familias familias_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familias
    ADD CONSTRAINT familias_pkey PRIMARY KEY (id_familia);


--
-- TOC entry 3709 (class 2606 OID 17767)
-- Name: municipios municipios_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.municipios
    ADD CONSTRAINT municipios_pkey PRIMARY KEY (id_municipio);


--
-- TOC entry 3640 (class 2606 OID 16988)
-- Name: niveles_educativos niveles_educativos_nivel_key; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.niveles_educativos
    ADD CONSTRAINT niveles_educativos_nivel_key UNIQUE (nivel);


--
-- TOC entry 3643 (class 2606 OID 16990)
-- Name: niveles_educativos niveles_educativos_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.niveles_educativos
    ADD CONSTRAINT niveles_educativos_pkey PRIMARY KEY (id_niveles_educativos);


--
-- TOC entry 3647 (class 2606 OID 16992)
-- Name: parentescos parentescos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.parentescos
    ADD CONSTRAINT parentescos_nombre_key UNIQUE (nombre);


--
-- TOC entry 3649 (class 2606 OID 16994)
-- Name: parentescos parentescos_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.parentescos
    ADD CONSTRAINT parentescos_pkey PRIMARY KEY (id_parentesco);


--
-- TOC entry 3653 (class 2606 OID 16996)
-- Name: parroquia parroquia_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.parroquia
    ADD CONSTRAINT parroquia_pkey PRIMARY KEY (id_parroquia);


--
-- TOC entry 3711 (class 2606 OID 17783)
-- Name: parroquias parroquias_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.parroquias
    ADD CONSTRAINT parroquias_pkey PRIMARY KEY (id_parroquia);


--
-- TOC entry 3655 (class 2606 OID 17000)
-- Name: persona_destreza persona_destreza_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.persona_destreza
    ADD CONSTRAINT persona_destreza_pkey PRIMARY KEY (id_destrezas_destrezas, id_personas_personas);


--
-- TOC entry 3727 (class 2606 OID 17899)
-- Name: personas personas_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_pkey PRIMARY KEY (id_personas);


--
-- TOC entry 3662 (class 2606 OID 17006)
-- Name: profesiones profesiones_nombre_key; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.profesiones
    ADD CONSTRAINT profesiones_nombre_key UNIQUE (nombre);


--
-- TOC entry 3664 (class 2606 OID 17008)
-- Name: profesiones profesiones_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.profesiones
    ADD CONSTRAINT profesiones_pkey PRIMARY KEY (id_profesion);


--
-- TOC entry 3741 (class 2606 OID 18003)
-- Name: roles roles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);


--
-- TOC entry 3743 (class 2606 OID 18001)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3666 (class 2606 OID 17012)
-- Name: sector sector_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sector
    ADD CONSTRAINT sector_pkey PRIMARY KEY (id_sector);


--
-- TOC entry 3713 (class 2606 OID 17800)
-- Name: sectores sectores_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sectores
    ADD CONSTRAINT sectores_pkey PRIMARY KEY (id_sector);


--
-- TOC entry 3668 (class 2606 OID 17016)
-- Name: sexo sexo_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sexo
    ADD CONSTRAINT sexo_pkey PRIMARY KEY (id_sexo);


--
-- TOC entry 3670 (class 2606 OID 17018)
-- Name: sexos sexos_codigo_key; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sexos
    ADD CONSTRAINT sexos_codigo_key UNIQUE (codigo);


--
-- TOC entry 3672 (class 2606 OID 17020)
-- Name: sexos sexos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sexos
    ADD CONSTRAINT sexos_nombre_key UNIQUE (nombre);


--
-- TOC entry 3674 (class 2606 OID 17022)
-- Name: sexos sexos_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sexos
    ADD CONSTRAINT sexos_pkey PRIMARY KEY (id_sexo);


--
-- TOC entry 3677 (class 2606 OID 17024)
-- Name: sistemas_acueducto sistemas_acueducto_nombre_key; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sistemas_acueducto
    ADD CONSTRAINT sistemas_acueducto_nombre_key UNIQUE (nombre);


--
-- TOC entry 3679 (class 2606 OID 17026)
-- Name: sistemas_acueducto sistemas_acueducto_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sistemas_acueducto
    ADD CONSTRAINT sistemas_acueducto_pkey PRIMARY KEY (id_sistema_acueducto);


--
-- TOC entry 3717 (class 2606 OID 17834)
-- Name: sistemas_acueductos sistemas_acueductos_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sistemas_acueductos
    ADD CONSTRAINT sistemas_acueductos_pkey PRIMARY KEY (id_sistema);


--
-- TOC entry 3683 (class 2606 OID 17030)
-- Name: situaciones_civiles situaciones_civiles_codigo_key; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.situaciones_civiles
    ADD CONSTRAINT situaciones_civiles_codigo_key UNIQUE (codigo);


--
-- TOC entry 3686 (class 2606 OID 17032)
-- Name: situaciones_civiles situaciones_civiles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.situaciones_civiles
    ADD CONSTRAINT situaciones_civiles_nombre_key UNIQUE (nombre);


--
-- TOC entry 3689 (class 2606 OID 17034)
-- Name: situaciones_civiles situaciones_civiles_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.situaciones_civiles
    ADD CONSTRAINT situaciones_civiles_pkey PRIMARY KEY (id_situacion_civil);


--
-- TOC entry 3691 (class 2606 OID 17036)
-- Name: tallas tallas_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tallas
    ADD CONSTRAINT tallas_pkey PRIMARY KEY (id_talla);


--
-- TOC entry 3693 (class 2606 OID 17038)
-- Name: tipo_identificacion tipo_identificacion_codigo_key; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tipo_identificacion
    ADD CONSTRAINT tipo_identificacion_codigo_key UNIQUE (codigo);


--
-- TOC entry 3695 (class 2606 OID 17040)
-- Name: tipo_identificacion tipo_identificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tipo_identificacion
    ADD CONSTRAINT tipo_identificacion_pkey PRIMARY KEY (id_tipo_identificacion);


--
-- TOC entry 3735 (class 2606 OID 17947)
-- Name: tipos_aguas_residuales tipos_aguas_residuales_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tipos_aguas_residuales
    ADD CONSTRAINT tipos_aguas_residuales_pkey PRIMARY KEY (id_tipo_aguas_residuales);


--
-- TOC entry 3698 (class 2606 OID 17044)
-- Name: tipos_disposicion_basura tipos_disposicion_basura_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tipos_disposicion_basura
    ADD CONSTRAINT tipos_disposicion_basura_pkey PRIMARY KEY (id_tipo_disposicion_basura);


--
-- TOC entry 3700 (class 2606 OID 17046)
-- Name: tipos_identificacion tipos_identificacion_codigo_key; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tipos_identificacion
    ADD CONSTRAINT tipos_identificacion_codigo_key UNIQUE (codigo);


--
-- TOC entry 3702 (class 2606 OID 17048)
-- Name: tipos_identificacion tipos_identificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tipos_identificacion
    ADD CONSTRAINT tipos_identificacion_pkey PRIMARY KEY (id_tipo_identificacion);


--
-- TOC entry 3705 (class 2606 OID 17050)
-- Name: tipos_vivienda tipos_vivienda_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tipos_vivienda
    ADD CONSTRAINT tipos_vivienda_pkey PRIMARY KEY (id_tipo_vivienda);


--
-- TOC entry 3719 (class 2606 OID 17846)
-- Name: tipos_viviendas tipos_viviendas_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.tipos_viviendas
    ADD CONSTRAINT tipos_viviendas_pkey PRIMARY KEY (id_tipo);


--
-- TOC entry 3737 (class 2606 OID 17987)
-- Name: usuarios usuarios_correo_electronico_key; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_electronico_key UNIQUE (correo_electronico);


--
-- TOC entry 3739 (class 2606 OID 17985)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 3745 (class 2606 OID 18013)
-- Name: usuarios_roles usuarios_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.usuarios_roles
    ADD CONSTRAINT usuarios_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3747 (class 2606 OID 18015)
-- Name: usuarios_roles usuarios_roles_usuario_id_rol_id_key; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.usuarios_roles
    ADD CONSTRAINT usuarios_roles_usuario_id_rol_id_key UNIQUE (usuario_id, rol_id);


--
-- TOC entry 3715 (class 2606 OID 17817)
-- Name: veredas veredas_pkey; Type: CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.veredas
    ADD CONSTRAINT veredas_pkey PRIMARY KEY (id_vereda);


--
-- TOC entry 3601 (class 1259 OID 17065)
-- Name: comunidades_culturales_activo; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX comunidades_culturales_activo ON public.comunidades_culturales USING btree (activo);


--
-- TOC entry 3602 (class 1259 OID 17066)
-- Name: comunidades_culturales_created_at; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX comunidades_culturales_created_at ON public.comunidades_culturales USING btree ("createdAt");


--
-- TOC entry 3603 (class 1259 OID 17067)
-- Name: comunidades_culturales_nombre; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE UNIQUE INDEX comunidades_culturales_nombre ON public.comunidades_culturales USING btree (nombre);


--
-- TOC entry 3615 (class 1259 OID 17068)
-- Name: encuestas_fecha; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX encuestas_fecha ON public.encuestas USING btree (fecha);


--
-- TOC entry 3616 (class 1259 OID 17069)
-- Name: encuestas_fecha_id_parroquia; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX encuestas_fecha_id_parroquia ON public.encuestas USING btree (fecha, id_parroquia);


--
-- TOC entry 3617 (class 1259 OID 17070)
-- Name: encuestas_id_municipio_id_sector; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX encuestas_id_municipio_id_sector ON public.encuestas USING btree (id_municipio, id_sector);


--
-- TOC entry 3618 (class 1259 OID 17071)
-- Name: encuestas_id_parroquia; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX encuestas_id_parroquia ON public.encuestas USING btree (id_parroquia);


--
-- TOC entry 3619 (class 1259 OID 17072)
-- Name: encuestas_id_vereda; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX encuestas_id_vereda ON public.encuestas USING btree (id_vereda);


--
-- TOC entry 3628 (class 1259 OID 17073)
-- Name: familia_sistema_acueducto_id_familia; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX familia_sistema_acueducto_id_familia ON public.familia_sistema_acueducto USING btree (id_familia);


--
-- TOC entry 3629 (class 1259 OID 17074)
-- Name: familia_sistema_acueducto_id_familia_id_sistema_acueducto; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE UNIQUE INDEX familia_sistema_acueducto_id_familia_id_sistema_acueducto ON public.familia_sistema_acueducto USING btree (id_familia, id_sistema_acueducto);


--
-- TOC entry 3630 (class 1259 OID 17075)
-- Name: familia_sistema_acueducto_id_sistema_acueducto; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX familia_sistema_acueducto_id_sistema_acueducto ON public.familia_sistema_acueducto USING btree (id_sistema_acueducto);


--
-- TOC entry 3632 (class 1259 OID 17076)
-- Name: familia_tipo_vivienda_id_familia; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX familia_tipo_vivienda_id_familia ON public.familia_tipo_vivienda USING btree (id_familia);


--
-- TOC entry 3633 (class 1259 OID 17077)
-- Name: familia_tipo_vivienda_id_familia_id_tipo_vivienda; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE UNIQUE INDEX familia_tipo_vivienda_id_familia_id_tipo_vivienda ON public.familia_tipo_vivienda USING btree (id_familia, id_tipo_vivienda);


--
-- TOC entry 3634 (class 1259 OID 17078)
-- Name: familia_tipo_vivienda_id_tipo_vivienda; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX familia_tipo_vivienda_id_tipo_vivienda ON public.familia_tipo_vivienda USING btree (id_tipo_vivienda);


--
-- TOC entry 3610 (class 1259 OID 17083)
-- Name: idx_destrezas_nombre_unique; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE UNIQUE INDEX idx_destrezas_nombre_unique ON public.destrezas USING btree (nombre);


--
-- TOC entry 3613 (class 1259 OID 17084)
-- Name: idx_difuntos_familia_familia; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX idx_difuntos_familia_familia ON public.difuntos_familia USING btree (id_familia_familias);


--
-- TOC entry 3614 (class 1259 OID 17085)
-- Name: idx_difuntos_fecha_fallecimiento; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX idx_difuntos_fecha_fallecimiento ON public.difuntos_familia USING btree (fecha_fallecimiento);


--
-- TOC entry 3644 (class 1259 OID 17092)
-- Name: idx_parentesco_activo; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX idx_parentesco_activo ON public.parentescos USING btree (activo);


--
-- TOC entry 3645 (class 1259 OID 17093)
-- Name: idx_parentesco_nombre; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX idx_parentesco_nombre ON public.parentescos USING btree (nombre);


--
-- TOC entry 3650 (class 1259 OID 17094)
-- Name: idx_parroquia_municipio; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX idx_parroquia_municipio ON public.parroquia USING btree (id_municipio);


--
-- TOC entry 3651 (class 1259 OID 17737)
-- Name: idx_parroquia_nombre; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX idx_parroquia_nombre ON public.parroquia USING btree (nombre);


--
-- TOC entry 3636 (class 1259 OID 17101)
-- Name: niveles_educativos_activo; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX niveles_educativos_activo ON public.niveles_educativos USING btree (activo);


--
-- TOC entry 3637 (class 1259 OID 17102)
-- Name: niveles_educativos_created_at; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX niveles_educativos_created_at ON public.niveles_educativos USING btree ("createdAt");


--
-- TOC entry 3638 (class 1259 OID 17103)
-- Name: niveles_educativos_nivel; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE UNIQUE INDEX niveles_educativos_nivel ON public.niveles_educativos USING btree (nivel) WHERE ("deletedAt" IS NULL);


--
-- TOC entry 3641 (class 1259 OID 17104)
-- Name: niveles_educativos_orden_nivel; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX niveles_educativos_orden_nivel ON public.niveles_educativos USING btree (orden_nivel);


--
-- TOC entry 3656 (class 1259 OID 17105)
-- Name: persona_enfermedad_id_enfermedad; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX persona_enfermedad_id_enfermedad ON public.persona_enfermedad USING btree (id_enfermedad);


--
-- TOC entry 3657 (class 1259 OID 17106)
-- Name: persona_enfermedad_id_persona; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX persona_enfermedad_id_persona ON public.persona_enfermedad USING btree (id_persona);


--
-- TOC entry 3658 (class 1259 OID 17107)
-- Name: persona_enfermedad_id_persona_id_enfermedad; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE UNIQUE INDEX persona_enfermedad_id_persona_id_enfermedad ON public.persona_enfermedad USING btree (id_persona, id_enfermedad);


--
-- TOC entry 3660 (class 1259 OID 17111)
-- Name: profesiones_nombre; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE UNIQUE INDEX profesiones_nombre ON public.profesiones USING btree (nombre);


--
-- TOC entry 3675 (class 1259 OID 17112)
-- Name: sistemas_acueducto_nombre; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE UNIQUE INDEX sistemas_acueducto_nombre ON public.sistemas_acueducto USING btree (nombre);


--
-- TOC entry 3680 (class 1259 OID 17113)
-- Name: situaciones_civiles_activo; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX situaciones_civiles_activo ON public.situaciones_civiles USING btree (activo);


--
-- TOC entry 3681 (class 1259 OID 17114)
-- Name: situaciones_civiles_codigo; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE UNIQUE INDEX situaciones_civiles_codigo ON public.situaciones_civiles USING btree (codigo) WHERE (codigo IS NOT NULL);


--
-- TOC entry 3684 (class 1259 OID 17115)
-- Name: situaciones_civiles_nombre; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE UNIQUE INDEX situaciones_civiles_nombre ON public.situaciones_civiles USING btree (nombre);


--
-- TOC entry 3687 (class 1259 OID 17116)
-- Name: situaciones_civiles_orden; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE INDEX situaciones_civiles_orden ON public.situaciones_civiles USING btree (orden);


--
-- TOC entry 3696 (class 1259 OID 17117)
-- Name: tipos_disposicion_basura_nombre; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE UNIQUE INDEX tipos_disposicion_basura_nombre ON public.tipos_disposicion_basura USING btree (nombre);


--
-- TOC entry 3703 (class 1259 OID 17118)
-- Name: tipos_vivienda_nombre; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE UNIQUE INDEX tipos_vivienda_nombre ON public.tipos_vivienda USING btree (nombre);


--
-- TOC entry 3631 (class 1259 OID 17119)
-- Name: unique_familia_sistema_acueducto; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE UNIQUE INDEX unique_familia_sistema_acueducto ON public.familia_sistema_acueducto USING btree (id_familia, id_sistema_acueducto);


--
-- TOC entry 3635 (class 1259 OID 17120)
-- Name: unique_familia_tipo_vivienda; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE UNIQUE INDEX unique_familia_tipo_vivienda ON public.familia_tipo_vivienda USING btree (id_familia, id_tipo_vivienda);


--
-- TOC entry 3659 (class 1259 OID 17121)
-- Name: unique_persona_enfermedad; Type: INDEX; Schema: public; Owner: parroquia_user
--

CREATE UNIQUE INDEX unique_persona_enfermedad ON public.persona_enfermedad USING btree (id_persona, id_enfermedad);


--
-- TOC entry 3750 (class 2606 OID 17132)
-- Name: familia_disposicion_basura familia_disposicion_basura_id_tipo_disposicion_basura_fkey; Type: FK CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familia_disposicion_basura
    ADD CONSTRAINT familia_disposicion_basura_id_tipo_disposicion_basura_fkey FOREIGN KEY (id_tipo_disposicion_basura) REFERENCES public.tipos_disposicion_basura(id_tipo_disposicion_basura) ON UPDATE CASCADE;


--
-- TOC entry 3751 (class 2606 OID 17137)
-- Name: familia_sistema_acueducto familia_sistema_acueducto_id_sistema_acueducto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.familia_sistema_acueducto
    ADD CONSTRAINT familia_sistema_acueducto_id_sistema_acueducto_fkey FOREIGN KEY (id_sistema_acueducto) REFERENCES public.sistemas_acueducto(id_sistema_acueducto) ON UPDATE CASCADE;


--
-- TOC entry 3748 (class 2606 OID 17167)
-- Name: difuntos_familia fk_difuntos_familia_parentesco; Type: FK CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.difuntos_familia
    ADD CONSTRAINT fk_difuntos_familia_parentesco FOREIGN KEY (id_parentesco) REFERENCES public.parentescos(id_parentesco);


--
-- TOC entry 3749 (class 2606 OID 17172)
-- Name: difuntos_familia fk_difuntos_familia_sexo; Type: FK CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.difuntos_familia
    ADD CONSTRAINT fk_difuntos_familia_sexo FOREIGN KEY (id_sexo) REFERENCES public.sexos(id_sexo);


--
-- TOC entry 3753 (class 2606 OID 17768)
-- Name: municipios municipios_id_departamento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.municipios
    ADD CONSTRAINT municipios_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES public.departamentos(id_departamento);


--
-- TOC entry 3754 (class 2606 OID 17784)
-- Name: parroquias parroquias_id_municipio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.parroquias
    ADD CONSTRAINT parroquias_id_municipio_fkey FOREIGN KEY (id_municipio) REFERENCES public.municipios(id_municipio);


--
-- TOC entry 3752 (class 2606 OID 17212)
-- Name: persona_destreza persona_destreza_id_destrezas_destrezas_fkey; Type: FK CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.persona_destreza
    ADD CONSTRAINT persona_destreza_id_destrezas_destrezas_fkey FOREIGN KEY (id_destrezas_destrezas) REFERENCES public.destrezas(id_destreza) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3755 (class 2606 OID 17801)
-- Name: sectores sectores_id_parroquia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.sectores
    ADD CONSTRAINT sectores_id_parroquia_fkey FOREIGN KEY (id_parroquia) REFERENCES public.parroquias(id_parroquia);


--
-- TOC entry 3757 (class 2606 OID 18021)
-- Name: usuarios_roles usuarios_roles_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.usuarios_roles
    ADD CONSTRAINT usuarios_roles_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 3758 (class 2606 OID 18016)
-- Name: usuarios_roles usuarios_roles_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.usuarios_roles
    ADD CONSTRAINT usuarios_roles_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 3756 (class 2606 OID 17818)
-- Name: veredas veredas_id_sector_fkey; Type: FK CONSTRAINT; Schema: public; Owner: parroquia_user
--

ALTER TABLE ONLY public.veredas
    ADD CONSTRAINT veredas_id_sector_fkey FOREIGN KEY (id_sector) REFERENCES public.sectores(id_sector);


-- Completed on 2025-09-29 23:33:53 UTC

--
-- PostgreSQL database dump complete
--

\unrestrict ajDaju8vn1P75mrgsE6BAZjV2XZK2Vm1OSh0vLIIH9E8rttmXDyo5K6vUpqIAjw


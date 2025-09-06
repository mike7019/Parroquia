--
-- PostgreSQL database cluster dump
--

-- Started on 2025-09-05 22:25:41

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE parroquia_user;
ALTER ROLE parroquia_user WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS;

--
-- User Configurations
--






--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.3

-- Started on 2025-09-05 22:25:42

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Completed on 2025-09-05 22:25:42

--
-- PostgreSQL database dump complete
--

--
-- Database "parroquia_db" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.3

-- Started on 2025-09-05 22:25:42

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4000 (class 1262 OID 16384)
-- Name: parroquia_db; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE parroquia_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


\connect parroquia_db

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 975 (class 1247 OID 25775)
-- Name: enum_familias_estado_encuesta; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_familias_estado_encuesta AS ENUM (
    'pending',
    'in_progress',
    'completed'
);


--
-- TOC entry 978 (class 1247 OID 25835)
-- Name: enum_families_survey_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_families_survey_status AS ENUM (
    'pending',
    'in_progress',
    'completed'
);


--
-- TOC entry 966 (class 1247 OID 16670)
-- Name: enum_persona_destreza_nivel_habilidad; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_persona_destreza_nivel_habilidad AS ENUM (
    'basico',
    'intermedio',
    'avanzado',
    'experto'
);


--
-- TOC entry 984 (class 1247 OID 26106)
-- Name: enum_profesiones_nivel_educativo_requerido; Type: TYPE; Schema: public; Owner: -
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


--
-- TOC entry 981 (class 1247 OID 25859)
-- Name: enum_surveys_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_surveys_status AS ENUM (
    'draft',
    'in_progress',
    'completed',
    'cancelled'
);


--
-- TOC entry 990 (class 1247 OID 26246)
-- Name: enum_tallas_genero; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_tallas_genero AS ENUM (
    'masculino',
    'femenino',
    'unisex'
);


--
-- TOC entry 987 (class 1247 OID 26238)
-- Name: enum_tallas_tipo_prenda; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_tallas_tipo_prenda AS ENUM (
    'zapato',
    'camisa',
    'pantalon'
);


--
-- TOC entry 1002 (class 1247 OID 66880)
-- Name: enum_usuarios_rol; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_usuarios_rol AS ENUM (
    'admin',
    'coordinador',
    'encuestador'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16385)
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


--
-- TOC entry 279 (class 1259 OID 67070)
-- Name: comunidades_culturales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comunidades_culturales (
    id_comunidad_cultural bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 278 (class 1259 OID 67069)
-- Name: comunidades_culturales_id_comunidad_cultural_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comunidades_culturales_id_comunidad_cultural_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4001 (class 0 OID 0)
-- Dependencies: 278
-- Name: comunidades_culturales_id_comunidad_cultural_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comunidades_culturales_id_comunidad_cultural_seq OWNED BY public.comunidades_culturales.id_comunidad_cultural;


--
-- TOC entry 259 (class 1259 OID 66933)
-- Name: departamentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departamentos (
    id_departamento bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    codigo_dane character varying(2) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 4002 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN departamentos.codigo_dane; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.departamentos.codigo_dane IS 'Código DANE del departamento (2 dígitos)';


--
-- TOC entry 258 (class 1259 OID 66932)
-- Name: departamentos_id_departamento_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departamentos_id_departamento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4003 (class 0 OID 0)
-- Dependencies: 258
-- Name: departamentos_id_departamento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departamentos_id_departamento_seq OWNED BY public.departamentos.id_departamento;


--
-- TOC entry 298 (class 1259 OID 67240)
-- Name: destrezas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.destrezas (
    id_destreza bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 297 (class 1259 OID 67239)
-- Name: destrezas_id_destreza_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.destrezas_id_destreza_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4004 (class 0 OID 0)
-- Dependencies: 297
-- Name: destrezas_id_destreza_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.destrezas_id_destreza_seq OWNED BY public.destrezas.id_destreza;


--
-- TOC entry 280 (class 1259 OID 67084)
-- Name: difuntos_familia; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 302 (class 1259 OID 67335)
-- Name: difuntos_familia_id_difunto_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.difuntos_familia_id_difunto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4005 (class 0 OID 0)
-- Dependencies: 302
-- Name: difuntos_familia_id_difunto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.difuntos_familia_id_difunto_seq OWNED BY public.difuntos_familia.id_difunto;


--
-- TOC entry 226 (class 1259 OID 16609)
-- Name: encuestas; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 4006 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN encuestas.firma; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.encuestas.firma IS 'Firma digital o ruta de imagen de firma';


--
-- TOC entry 225 (class 1259 OID 16608)
-- Name: encuestas_id_encuesta_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.encuestas_id_encuesta_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4007 (class 0 OID 0)
-- Dependencies: 225
-- Name: encuestas_id_encuesta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.encuestas_id_encuesta_seq OWNED BY public.encuestas.id_encuesta;


--
-- TOC entry 284 (class 1259 OID 67135)
-- Name: enfermedades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enfermedades (
    id_enfermedad bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 283 (class 1259 OID 67134)
-- Name: enfermedades_id_enfermedad_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.enfermedades_id_enfermedad_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4008 (class 0 OID 0)
-- Dependencies: 283
-- Name: enfermedades_id_enfermedad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.enfermedades_id_enfermedad_seq OWNED BY public.enfermedades.id_enfermedad;


--
-- TOC entry 248 (class 1259 OID 66744)
-- Name: estados_civiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estados_civiles (
    id_estado bigint NOT NULL,
    descripcion character varying(50) NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 247 (class 1259 OID 66743)
-- Name: estados_civiles_id_estado_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estados_civiles_id_estado_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4009 (class 0 OID 0)
-- Dependencies: 247
-- Name: estados_civiles_id_estado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estados_civiles_id_estado_seq OWNED BY public.estados_civiles.id_estado;


--
-- TOC entry 240 (class 1259 OID 66660)
-- Name: familia_aguas_residuales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.familia_aguas_residuales (
    id integer NOT NULL,
    id_familia integer NOT NULL,
    tipo_tratamiento character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 239 (class 1259 OID 66659)
-- Name: familia_aguas_residuales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.familia_aguas_residuales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4010 (class 0 OID 0)
-- Dependencies: 239
-- Name: familia_aguas_residuales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.familia_aguas_residuales_id_seq OWNED BY public.familia_aguas_residuales.id;


--
-- TOC entry 294 (class 1259 OID 67206)
-- Name: familia_disposicion_basura; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.familia_disposicion_basura (
    id bigint NOT NULL,
    id_familia bigint NOT NULL,
    id_tipo_disposicion_basura bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 293 (class 1259 OID 67205)
-- Name: familia_disposicion_basura_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.familia_disposicion_basura_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4011 (class 0 OID 0)
-- Dependencies: 293
-- Name: familia_disposicion_basura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.familia_disposicion_basura_id_seq OWNED BY public.familia_disposicion_basura.id;


--
-- TOC entry 238 (class 1259 OID 66651)
-- Name: familia_disposicion_basuras; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.familia_disposicion_basuras (
    id integer NOT NULL,
    id_familia integer NOT NULL,
    disposicion character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 237 (class 1259 OID 66650)
-- Name: familia_disposicion_basuras_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.familia_disposicion_basuras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4012 (class 0 OID 0)
-- Dependencies: 237
-- Name: familia_disposicion_basuras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.familia_disposicion_basuras_id_seq OWNED BY public.familia_disposicion_basuras.id;


--
-- TOC entry 229 (class 1259 OID 16727)
-- Name: familia_sistema_acueducto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.familia_sistema_acueducto (
    id_familia bigint NOT NULL,
    id_sistema_acueducto bigint NOT NULL,
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 230 (class 1259 OID 32958)
-- Name: familia_sistema_acueducto_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.familia_sistema_acueducto_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4013 (class 0 OID 0)
-- Dependencies: 230
-- Name: familia_sistema_acueducto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.familia_sistema_acueducto_id_seq OWNED BY public.familia_sistema_acueducto.id;


--
-- TOC entry 250 (class 1259 OID 66783)
-- Name: familia_sistema_acueductos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.familia_sistema_acueductos (
    id bigint NOT NULL,
    id_familia bigint NOT NULL,
    id_sistema_acueducto bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 249 (class 1259 OID 66782)
-- Name: familia_sistema_acueductos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.familia_sistema_acueductos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4014 (class 0 OID 0)
-- Dependencies: 249
-- Name: familia_sistema_acueductos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.familia_sistema_acueductos_id_seq OWNED BY public.familia_sistema_acueductos.id;


--
-- TOC entry 296 (class 1259 OID 67223)
-- Name: familia_sistema_aguas_residuales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.familia_sistema_aguas_residuales (
    id bigint NOT NULL,
    id_familia bigint NOT NULL,
    id_tipo_aguas_residuales bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 295 (class 1259 OID 67222)
-- Name: familia_sistema_aguas_residuales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.familia_sistema_aguas_residuales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4015 (class 0 OID 0)
-- Dependencies: 295
-- Name: familia_sistema_aguas_residuales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.familia_sistema_aguas_residuales_id_seq OWNED BY public.familia_sistema_aguas_residuales.id;


--
-- TOC entry 228 (class 1259 OID 16705)
-- Name: familia_tipo_vivienda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.familia_tipo_vivienda (
    id_familia bigint NOT NULL,
    id_tipo_vivienda bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 252 (class 1259 OID 66790)
-- Name: familia_tipo_viviendas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.familia_tipo_viviendas (
    id bigint NOT NULL,
    id_familia bigint NOT NULL,
    id_tipo_vivienda bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 251 (class 1259 OID 66789)
-- Name: familia_tipo_viviendas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.familia_tipo_viviendas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4016 (class 0 OID 0)
-- Dependencies: 251
-- Name: familia_tipo_viviendas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.familia_tipo_viviendas_id_seq OWNED BY public.familia_tipo_viviendas.id;


--
-- TOC entry 271 (class 1259 OID 67008)
-- Name: familias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.familias (
    id_familia bigint NOT NULL,
    apellido_familiar character varying(200) NOT NULL,
    sector character varying(100) NOT NULL,
    direccion_familia character varying(255) NOT NULL,
    numero_contacto character varying(20),
    telefono character varying(20),
    email character varying(100),
    "tamaño_familia" integer DEFAULT 1 NOT NULL,
    tipo_vivienda character varying(100),
    estado_encuesta character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    numero_encuestas integer DEFAULT 0 NOT NULL,
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
    id_tipo_vivienda bigint
);


--
-- TOC entry 4017 (class 0 OID 0)
-- Dependencies: 271
-- Name: COLUMN familias."comunionEnCasa"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.familias."comunionEnCasa" IS 'Solicita Comunión en casa?';


--
-- TOC entry 4018 (class 0 OID 0)
-- Dependencies: 271
-- Name: COLUMN familias.numero_contrato_epm; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.familias.numero_contrato_epm IS 'Número de contrato con EPM (Empresas Públicas)';


--
-- TOC entry 270 (class 1259 OID 67007)
-- Name: familias_id_familia_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.familias_id_familia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4019 (class 0 OID 0)
-- Dependencies: 270
-- Name: familias_id_familia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.familias_id_familia_seq OWNED BY public.familias.id_familia;


--
-- TOC entry 261 (class 1259 OID 66940)
-- Name: municipios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.municipios (
    id_municipio bigint NOT NULL,
    nombre_municipio character varying(255) NOT NULL,
    codigo_dane character varying(5) NOT NULL,
    id_departamento bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 4020 (class 0 OID 0)
-- Dependencies: 261
-- Name: COLUMN municipios.codigo_dane; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.municipios.codigo_dane IS 'Código DANE del municipio (5 dígitos) - debe ser único';


--
-- TOC entry 4021 (class 0 OID 0)
-- Dependencies: 261
-- Name: COLUMN municipios.id_departamento; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.municipios.id_departamento IS 'ID del departamento al que pertenece el municipio';


--
-- TOC entry 260 (class 1259 OID 66939)
-- Name: municipios_id_municipio_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.municipios_id_municipio_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4022 (class 0 OID 0)
-- Dependencies: 260
-- Name: municipios_id_municipio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.municipios_id_municipio_seq OWNED BY public.municipios.id_municipio;


--
-- TOC entry 290 (class 1259 OID 67179)
-- Name: niveles_educativos; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 289 (class 1259 OID 67178)
-- Name: niveles_educativos_id_niveles_educativos_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.niveles_educativos_id_niveles_educativos_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4023 (class 0 OID 0)
-- Dependencies: 289
-- Name: niveles_educativos_id_niveles_educativos_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.niveles_educativos_id_niveles_educativos_seq OWNED BY public.niveles_educativos.id_niveles_educativos;


--
-- TOC entry 286 (class 1259 OID 67146)
-- Name: parentescos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parentescos (
    id_parentesco bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 285 (class 1259 OID 67145)
-- Name: parentescos_id_parentesco_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parentescos_id_parentesco_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4024 (class 0 OID 0)
-- Dependencies: 285
-- Name: parentescos_id_parentesco_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parentescos_id_parentesco_seq OWNED BY public.parentescos.id_parentesco;


--
-- TOC entry 263 (class 1259 OID 66955)
-- Name: parroquia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parroquia (
    id_parroquia bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    id_municipio bigint NOT NULL
);


--
-- TOC entry 4025 (class 0 OID 0)
-- Dependencies: 263
-- Name: COLUMN parroquia.id_municipio; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.parroquia.id_municipio IS 'ID del municipio al que pertenece la parroquia';


--
-- TOC entry 262 (class 1259 OID 66954)
-- Name: parroquia_id_parroquia_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parroquia_id_parroquia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4026 (class 0 OID 0)
-- Dependencies: 262
-- Name: parroquia_id_parroquia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parroquia_id_parroquia_seq OWNED BY public.parroquia.id_parroquia;


--
-- TOC entry 242 (class 1259 OID 66690)
-- Name: parroquias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parroquias (
    id_parroquia bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    id_municipio bigint,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 241 (class 1259 OID 66689)
-- Name: parroquias_id_parroquia_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parroquias_id_parroquia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4027 (class 0 OID 0)
-- Dependencies: 241
-- Name: parroquias_id_parroquia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parroquias_id_parroquia_seq OWNED BY public.parroquias.id_parroquia;


--
-- TOC entry 301 (class 1259 OID 67259)
-- Name: persona_destreza; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.persona_destreza (
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    id_destrezas_destrezas bigint NOT NULL,
    id_personas_personas bigint NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 16646)
-- Name: persona_enfermedad; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.persona_enfermedad (
    id_persona bigint NOT NULL,
    id_enfermedad bigint NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 282 (class 1259 OID 67099)
-- Name: personas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personas (
    id_personas bigint NOT NULL,
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
    CONSTRAINT personas_dia_celebrar_check CHECK (((dia_celebrar >= 1) AND (dia_celebrar <= 31))),
    CONSTRAINT personas_mes_celebrar_check CHECK (((mes_celebrar >= 1) AND (mes_celebrar <= 12)))
);


--
-- TOC entry 281 (class 1259 OID 67098)
-- Name: personas_id_personas_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personas_id_personas_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4028 (class 0 OID 0)
-- Dependencies: 281
-- Name: personas_id_personas_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personas_id_personas_seq OWNED BY public.personas.id_personas;


--
-- TOC entry 300 (class 1259 OID 67248)
-- Name: profesiones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profesiones (
    id_profesion bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 299 (class 1259 OID 67247)
-- Name: profesiones_id_profesion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profesiones_id_profesion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4029 (class 0 OID 0)
-- Dependencies: 299
-- Name: profesiones_id_profesion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profesiones_id_profesion_seq OWNED BY public.profesiones.id_profesion;


--
-- TOC entry 254 (class 1259 OID 66901)
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    nombre character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 66627)
-- Name: sector; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sector (
    id_sector bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 66626)
-- Name: sector_id_sector_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sector_id_sector_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4030 (class 0 OID 0)
-- Dependencies: 231
-- Name: sector_id_sector_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sector_id_sector_seq OWNED BY public.sector.id_sector;


--
-- TOC entry 267 (class 1259 OID 66982)
-- Name: sectores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sectores (
    id_sector bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    id_municipio bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 266 (class 1259 OID 66981)
-- Name: sectores_id_sector_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sectores_id_sector_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4031 (class 0 OID 0)
-- Dependencies: 266
-- Name: sectores_id_sector_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sectores_id_sector_seq OWNED BY public.sectores.id_sector;


--
-- TOC entry 234 (class 1259 OID 66634)
-- Name: sexo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sexo (
    id_sexo bigint NOT NULL,
    descripcion character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 4032 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN sexo.descripcion; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sexo.descripcion IS 'Descripción del tipo de sexo';


--
-- TOC entry 233 (class 1259 OID 66633)
-- Name: sexo_id_sexo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sexo_id_sexo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4033 (class 0 OID 0)
-- Dependencies: 233
-- Name: sexo_id_sexo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sexo_id_sexo_seq OWNED BY public.sexo.id_sexo;


--
-- TOC entry 265 (class 1259 OID 66969)
-- Name: sexos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sexos (
    id_sexo bigint NOT NULL,
    nombre character varying(50) NOT NULL,
    codigo character varying(1) NOT NULL,
    descripcion text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 264 (class 1259 OID 66968)
-- Name: sexos_id_sexo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sexos_id_sexo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4034 (class 0 OID 0)
-- Dependencies: 264
-- Name: sexos_id_sexo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sexos_id_sexo_seq OWNED BY public.sexos.id_sexo;


--
-- TOC entry 224 (class 1259 OID 16506)
-- Name: sistemas_acueducto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sistemas_acueducto (
    id_sistema_acueducto bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 16505)
-- Name: sistemas_acueducto_id_sistema_acueducto_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sistemas_acueducto_id_sistema_acueducto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4035 (class 0 OID 0)
-- Dependencies: 223
-- Name: sistemas_acueducto_id_sistema_acueducto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sistemas_acueducto_id_sistema_acueducto_seq OWNED BY public.sistemas_acueducto.id_sistema_acueducto;


--
-- TOC entry 244 (class 1259 OID 66728)
-- Name: sistemas_acueductos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sistemas_acueductos (
    id_sistema bigint NOT NULL,
    descripcion character varying(100) NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 243 (class 1259 OID 66727)
-- Name: sistemas_acueductos_id_sistema_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sistemas_acueductos_id_sistema_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4036 (class 0 OID 0)
-- Dependencies: 243
-- Name: sistemas_acueductos_id_sistema_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sistemas_acueductos_id_sistema_seq OWNED BY public.sistemas_acueductos.id_sistema;


--
-- TOC entry 288 (class 1259 OID 67160)
-- Name: situaciones_civiles; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 287 (class 1259 OID 67159)
-- Name: situaciones_civiles_id_situacion_civil_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.situaciones_civiles_id_situacion_civil_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4037 (class 0 OID 0)
-- Dependencies: 287
-- Name: situaciones_civiles_id_situacion_civil_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.situaciones_civiles_id_situacion_civil_seq OWNED BY public.situaciones_civiles.id_situacion_civil;


--
-- TOC entry 292 (class 1259 OID 67195)
-- Name: tallas; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 291 (class 1259 OID 67194)
-- Name: tallas_id_talla_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tallas_id_talla_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4038 (class 0 OID 0)
-- Dependencies: 291
-- Name: tallas_id_talla_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tallas_id_talla_seq OWNED BY public.tallas.id_talla;


--
-- TOC entry 236 (class 1259 OID 66641)
-- Name: tipo_identificacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipo_identificacion (
    id_tipo_identificacion bigint NOT NULL,
    descripcion character varying(255) NOT NULL,
    codigo character varying(10) NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 66640)
-- Name: tipo_identificacion_id_tipo_identificacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipo_identificacion_id_tipo_identificacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4039 (class 0 OID 0)
-- Dependencies: 235
-- Name: tipo_identificacion_id_tipo_identificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipo_identificacion_id_tipo_identificacion_seq OWNED BY public.tipo_identificacion.id_tipo_identificacion;


--
-- TOC entry 275 (class 1259 OID 67050)
-- Name: tipos_aguas_residuales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipos_aguas_residuales (
    id_tipo_aguas_residuales bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 274 (class 1259 OID 67049)
-- Name: tipos_aguas_residuales_id_tipo_aguas_residuales_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipos_aguas_residuales_id_tipo_aguas_residuales_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4040 (class 0 OID 0)
-- Dependencies: 274
-- Name: tipos_aguas_residuales_id_tipo_aguas_residuales_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipos_aguas_residuales_id_tipo_aguas_residuales_seq OWNED BY public.tipos_aguas_residuales.id_tipo_aguas_residuales;


--
-- TOC entry 273 (class 1259 OID 67040)
-- Name: tipos_disposicion_basura; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipos_disposicion_basura (
    id_tipo_disposicion_basura bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 272 (class 1259 OID 67039)
-- Name: tipos_disposicion_basura_id_tipo_disposicion_basura_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipos_disposicion_basura_id_tipo_disposicion_basura_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4041 (class 0 OID 0)
-- Dependencies: 272
-- Name: tipos_disposicion_basura_id_tipo_disposicion_basura_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipos_disposicion_basura_id_tipo_disposicion_basura_seq OWNED BY public.tipos_disposicion_basura.id_tipo_disposicion_basura;


--
-- TOC entry 257 (class 1259 OID 66922)
-- Name: tipos_identificacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipos_identificacion (
    id_tipo_identificacion bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    codigo character varying(10) NOT NULL,
    descripcion text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 256 (class 1259 OID 66921)
-- Name: tipos_identificacion_id_tipo_identificacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipos_identificacion_id_tipo_identificacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4042 (class 0 OID 0)
-- Dependencies: 256
-- Name: tipos_identificacion_id_tipo_identificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipos_identificacion_id_tipo_identificacion_seq OWNED BY public.tipos_identificacion.id_tipo_identificacion;


--
-- TOC entry 277 (class 1259 OID 67059)
-- Name: tipos_vivienda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipos_vivienda (
    id_tipo_vivienda bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion character varying(255),
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 4043 (class 0 OID 0)
-- Dependencies: 277
-- Name: COLUMN tipos_vivienda.activo; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tipos_vivienda.activo IS 'Indica si el tipo de vivienda está activo';


--
-- TOC entry 276 (class 1259 OID 67058)
-- Name: tipos_vivienda_id_tipo_vivienda_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipos_vivienda_id_tipo_vivienda_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4044 (class 0 OID 0)
-- Dependencies: 276
-- Name: tipos_vivienda_id_tipo_vivienda_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipos_vivienda_id_tipo_vivienda_seq OWNED BY public.tipos_vivienda.id_tipo_vivienda;


--
-- TOC entry 246 (class 1259 OID 66736)
-- Name: tipos_viviendas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipos_viviendas (
    id_tipo bigint NOT NULL,
    descripcion character varying(100) NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 245 (class 1259 OID 66735)
-- Name: tipos_viviendas_id_tipo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipos_viviendas_id_tipo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4045 (class 0 OID 0)
-- Dependencies: 245
-- Name: tipos_viviendas_id_tipo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipos_viviendas_id_tipo_seq OWNED BY public.tipos_viviendas.id_tipo;


--
-- TOC entry 253 (class 1259 OID 66887)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id uuid NOT NULL,
    correo_electronico character varying(255) NOT NULL,
    contrasena character varying(255) NOT NULL,
    primer_nombre character varying(255) NOT NULL,
    segundo_nombre character varying(255),
    primer_apellido character varying(255) NOT NULL,
    segundo_apellido character varying(255),
    numero_documento character varying(20),
    telefono character varying(20),
    activo boolean DEFAULT true,
    fecha_ultimo_acceso timestamp with time zone,
    intentos_fallidos integer DEFAULT 0 NOT NULL,
    bloqueado_hasta timestamp with time zone,
    token_recuperacion character varying(255),
    token_expiracion timestamp with time zone,
    email_verificado boolean DEFAULT false NOT NULL,
    token_verificacion_email character varying(255),
    fecha_verificacion_email timestamp with time zone,
    expira_token_reset timestamp with time zone,
    refresh_token text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 255 (class 1259 OID 66906)
-- Name: usuarios_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios_roles (
    id_usuarios uuid NOT NULL,
    id_roles uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 269 (class 1259 OID 66994)
-- Name: veredas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.veredas (
    id_vereda bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    codigo_vereda character varying(50),
    id_municipio_municipios bigint,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 268 (class 1259 OID 66993)
-- Name: veredas_id_vereda_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.veredas_id_vereda_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4046 (class 0 OID 0)
-- Dependencies: 268
-- Name: veredas_id_vereda_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.veredas_id_vereda_seq OWNED BY public.veredas.id_vereda;


--
-- TOC entry 3552 (class 2604 OID 67073)
-- Name: comunidades_culturales id_comunidad_cultural; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comunidades_culturales ALTER COLUMN id_comunidad_cultural SET DEFAULT nextval('public.comunidades_culturales_id_comunidad_cultural_seq'::regclass);


--
-- TOC entry 3526 (class 2604 OID 66936)
-- Name: departamentos id_departamento; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departamentos ALTER COLUMN id_departamento SET DEFAULT nextval('public.departamentos_id_departamento_seq'::regclass);


--
-- TOC entry 3569 (class 2604 OID 67243)
-- Name: destrezas id_destreza; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.destrezas ALTER COLUMN id_destreza SET DEFAULT nextval('public.destrezas_id_destreza_seq'::regclass);


--
-- TOC entry 3554 (class 2604 OID 67336)
-- Name: difuntos_familia id_difunto; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.difuntos_familia ALTER COLUMN id_difunto SET DEFAULT nextval('public.difuntos_familia_id_difunto_seq'::regclass);


--
-- TOC entry 3501 (class 2604 OID 16612)
-- Name: encuestas id_encuesta; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encuestas ALTER COLUMN id_encuesta SET DEFAULT nextval('public.encuestas_id_encuesta_seq'::regclass);


--
-- TOC entry 3556 (class 2604 OID 67138)
-- Name: enfermedades id_enfermedad; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enfermedades ALTER COLUMN id_enfermedad SET DEFAULT nextval('public.enfermedades_id_enfermedad_seq'::regclass);


--
-- TOC entry 3518 (class 2604 OID 66747)
-- Name: estados_civiles id_estado; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estados_civiles ALTER COLUMN id_estado SET DEFAULT nextval('public.estados_civiles_id_estado_seq'::regclass);


--
-- TOC entry 3510 (class 2604 OID 66663)
-- Name: familia_aguas_residuales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_aguas_residuales ALTER COLUMN id SET DEFAULT nextval('public.familia_aguas_residuales_id_seq'::regclass);


--
-- TOC entry 3567 (class 2604 OID 67209)
-- Name: familia_disposicion_basura id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_disposicion_basura ALTER COLUMN id SET DEFAULT nextval('public.familia_disposicion_basura_id_seq'::regclass);


--
-- TOC entry 3507 (class 2604 OID 66654)
-- Name: familia_disposicion_basuras id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_disposicion_basuras ALTER COLUMN id SET DEFAULT nextval('public.familia_disposicion_basuras_id_seq'::regclass);


--
-- TOC entry 3503 (class 2604 OID 32959)
-- Name: familia_sistema_acueducto id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_sistema_acueducto ALTER COLUMN id SET DEFAULT nextval('public.familia_sistema_acueducto_id_seq'::regclass);


--
-- TOC entry 3520 (class 2604 OID 66786)
-- Name: familia_sistema_acueductos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_sistema_acueductos ALTER COLUMN id SET DEFAULT nextval('public.familia_sistema_acueductos_id_seq'::regclass);


--
-- TOC entry 3568 (class 2604 OID 67226)
-- Name: familia_sistema_aguas_residuales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_sistema_aguas_residuales ALTER COLUMN id SET DEFAULT nextval('public.familia_sistema_aguas_residuales_id_seq'::regclass);


--
-- TOC entry 3521 (class 2604 OID 66793)
-- Name: familia_tipo_viviendas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_tipo_viviendas ALTER COLUMN id SET DEFAULT nextval('public.familia_tipo_viviendas_id_seq'::regclass);


--
-- TOC entry 3532 (class 2604 OID 67011)
-- Name: familias id_familia; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familias ALTER COLUMN id_familia SET DEFAULT nextval('public.familias_id_familia_seq'::regclass);


--
-- TOC entry 3527 (class 2604 OID 66943)
-- Name: municipios id_municipio; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.municipios ALTER COLUMN id_municipio SET DEFAULT nextval('public.municipios_id_municipio_seq'::regclass);


--
-- TOC entry 3562 (class 2604 OID 67182)
-- Name: niveles_educativos id_niveles_educativos; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.niveles_educativos ALTER COLUMN id_niveles_educativos SET DEFAULT nextval('public.niveles_educativos_id_niveles_educativos_seq'::regclass);


--
-- TOC entry 3557 (class 2604 OID 67149)
-- Name: parentescos id_parentesco; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parentescos ALTER COLUMN id_parentesco SET DEFAULT nextval('public.parentescos_id_parentesco_seq'::regclass);


--
-- TOC entry 3528 (class 2604 OID 66958)
-- Name: parroquia id_parroquia; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parroquia ALTER COLUMN id_parroquia SET DEFAULT nextval('public.parroquia_id_parroquia_seq'::regclass);


--
-- TOC entry 3513 (class 2604 OID 66693)
-- Name: parroquias id_parroquia; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parroquias ALTER COLUMN id_parroquia SET DEFAULT nextval('public.parroquias_id_parroquia_seq'::regclass);


--
-- TOC entry 3555 (class 2604 OID 67102)
-- Name: personas id_personas; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas ALTER COLUMN id_personas SET DEFAULT nextval('public.personas_id_personas_seq'::regclass);


--
-- TOC entry 3570 (class 2604 OID 67251)
-- Name: profesiones id_profesion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesiones ALTER COLUMN id_profesion SET DEFAULT nextval('public.profesiones_id_profesion_seq'::regclass);


--
-- TOC entry 3504 (class 2604 OID 66630)
-- Name: sector id_sector; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sector ALTER COLUMN id_sector SET DEFAULT nextval('public.sector_id_sector_seq'::regclass);


--
-- TOC entry 3530 (class 2604 OID 66985)
-- Name: sectores id_sector; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sectores ALTER COLUMN id_sector SET DEFAULT nextval('public.sectores_id_sector_seq'::regclass);


--
-- TOC entry 3505 (class 2604 OID 66637)
-- Name: sexo id_sexo; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sexo ALTER COLUMN id_sexo SET DEFAULT nextval('public.sexo_id_sexo_seq'::regclass);


--
-- TOC entry 3529 (class 2604 OID 66972)
-- Name: sexos id_sexo; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sexos ALTER COLUMN id_sexo SET DEFAULT nextval('public.sexos_id_sexo_seq'::regclass);


--
-- TOC entry 3500 (class 2604 OID 16509)
-- Name: sistemas_acueducto id_sistema_acueducto; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sistemas_acueducto ALTER COLUMN id_sistema_acueducto SET DEFAULT nextval('public.sistemas_acueducto_id_sistema_acueducto_seq'::regclass);


--
-- TOC entry 3514 (class 2604 OID 66731)
-- Name: sistemas_acueductos id_sistema; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sistemas_acueductos ALTER COLUMN id_sistema SET DEFAULT nextval('public.sistemas_acueductos_id_sistema_seq'::regclass);


--
-- TOC entry 3559 (class 2604 OID 67163)
-- Name: situaciones_civiles id_situacion_civil; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.situaciones_civiles ALTER COLUMN id_situacion_civil SET DEFAULT nextval('public.situaciones_civiles_id_situacion_civil_seq'::regclass);


--
-- TOC entry 3564 (class 2604 OID 67198)
-- Name: tallas id_talla; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tallas ALTER COLUMN id_talla SET DEFAULT nextval('public.tallas_id_talla_seq'::regclass);


--
-- TOC entry 3506 (class 2604 OID 66644)
-- Name: tipo_identificacion id_tipo_identificacion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_identificacion ALTER COLUMN id_tipo_identificacion SET DEFAULT nextval('public.tipo_identificacion_id_tipo_identificacion_seq'::regclass);


--
-- TOC entry 3549 (class 2604 OID 67053)
-- Name: tipos_aguas_residuales id_tipo_aguas_residuales; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_aguas_residuales ALTER COLUMN id_tipo_aguas_residuales SET DEFAULT nextval('public.tipos_aguas_residuales_id_tipo_aguas_residuales_seq'::regclass);


--
-- TOC entry 3548 (class 2604 OID 67043)
-- Name: tipos_disposicion_basura id_tipo_disposicion_basura; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_disposicion_basura ALTER COLUMN id_tipo_disposicion_basura SET DEFAULT nextval('public.tipos_disposicion_basura_id_tipo_disposicion_basura_seq'::regclass);


--
-- TOC entry 3525 (class 2604 OID 66925)
-- Name: tipos_identificacion id_tipo_identificacion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_identificacion ALTER COLUMN id_tipo_identificacion SET DEFAULT nextval('public.tipos_identificacion_id_tipo_identificacion_seq'::regclass);


--
-- TOC entry 3550 (class 2604 OID 67062)
-- Name: tipos_vivienda id_tipo_vivienda; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_vivienda ALTER COLUMN id_tipo_vivienda SET DEFAULT nextval('public.tipos_vivienda_id_tipo_vivienda_seq'::regclass);


--
-- TOC entry 3516 (class 2604 OID 66739)
-- Name: tipos_viviendas id_tipo; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_viviendas ALTER COLUMN id_tipo SET DEFAULT nextval('public.tipos_viviendas_id_tipo_seq'::regclass);


--
-- TOC entry 3531 (class 2604 OID 66997)
-- Name: veredas id_vereda; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.veredas ALTER COLUMN id_vereda SET DEFAULT nextval('public.veredas_id_vereda_seq'::regclass);


--
-- TOC entry 3914 (class 0 OID 16385)
-- Dependencies: 222
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: -
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
-- TOC entry 3971 (class 0 OID 67070)
-- Dependencies: 279
-- Data for Name: comunidades_culturales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comunidades_culturales (id_comunidad_cultural, nombre, descripcion, activo, "createdAt", "updatedAt") FROM stdin;
1	Afrodescendiente	Comunidad de personas afrodescendientes	t	2025-09-04 20:16:22.126+00	2025-09-04 20:16:22.126+00
\.


--
-- TOC entry 3951 (class 0 OID 66933)
-- Dependencies: 259
-- Data for Name: departamentos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departamentos (id_departamento, nombre, codigo_dane, created_at, updated_at) FROM stdin;
1	Amazonas	91	2025-09-05 06:20:49.683+00	2025-09-05 06:20:49.684+00
2	Antioquia	05	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
3	Arauca	81	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
4	Atlántico	08	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
5	Bogotá	11	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
6	Bolívar	13	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
7	Boyacá	15	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
8	Caldas	17	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
9	Caquetá	18	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
10	Casanare	85	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
11	Cauca	19	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
12	Cesar	20	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
13	Chocó	27	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
14	Córdoba	23	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
15	Cundinamarca	25	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
16	Guainía	94	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
17	Guaviare	95	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
18	Huila	41	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
19	La Guajira	44	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
20	Magdalena	47	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
21	Meta	50	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
22	Nariño	52	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
23	Norte de Santander	54	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
24	Putumayo	86	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
25	Quindío	63	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
26	Risaralda	66	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
27	San Andrés y Providencia	88	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
28	Santander	68	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
29	Sucre	70	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
30	Tolima	73	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
31	Valle del Cauca	76	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
32	Vaupés	97	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
33	Vichada	99	2025-09-05 06:20:49.684+00	2025-09-05 06:20:49.684+00
\.


--
-- TOC entry 3990 (class 0 OID 67240)
-- Dependencies: 298
-- Data for Name: destrezas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.destrezas (id_destreza, nombre, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3972 (class 0 OID 67084)
-- Dependencies: 280
-- Data for Name: difuntos_familia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.difuntos_familia (id_difunto, nombre_completo, fecha_fallecimiento, observaciones, id_familia_familias, "createdAt", "updatedAt", id_sexo, id_parentesco, causa_fallecimiento) FROM stdin;
\.


--
-- TOC entry 3918 (class 0 OID 16609)
-- Dependencies: 226
-- Data for Name: encuestas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.encuestas (id_encuesta, id_parroquia, id_municipio, fecha, id_sector, id_vereda, observaciones, tratamiento_datos, firma, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3976 (class 0 OID 67135)
-- Dependencies: 284
-- Data for Name: enfermedades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.enfermedades (id_enfermedad, nombre, descripcion, "createdAt", "updatedAt") FROM stdin;
1	Diabetes tipo 2	Trastorno metabólico caracterizado por altos niveles de glucosa en sangre	2025-09-04 20:12:40.307+00	2025-09-04 20:12:40.307+00
\.


--
-- TOC entry 3940 (class 0 OID 66744)
-- Dependencies: 248
-- Data for Name: estados_civiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.estados_civiles (id_estado, descripcion, activo, created_at, updated_at) FROM stdin;
1	Soltero(a)	t	2025-09-04 14:41:06.76+00	2025-09-04 14:41:06.76+00
2	Casado(a)	t	2025-09-04 14:41:06.768+00	2025-09-04 14:41:06.768+00
3	Unión Libre	t	2025-09-04 14:41:06.775+00	2025-09-04 14:41:06.775+00
4	Divorciado(a)	t	2025-09-04 14:41:06.781+00	2025-09-04 14:41:06.781+00
5	Viudo(a)	t	2025-09-04 14:41:06.785+00	2025-09-04 14:41:06.785+00
6	Separado(a)	t	2025-09-04 14:41:06.788+00	2025-09-04 14:41:06.788+00
\.


--
-- TOC entry 3932 (class 0 OID 66660)
-- Dependencies: 240
-- Data for Name: familia_aguas_residuales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.familia_aguas_residuales (id, id_familia, tipo_tratamiento, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3986 (class 0 OID 67206)
-- Dependencies: 294
-- Data for Name: familia_disposicion_basura; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.familia_disposicion_basura (id, id_familia, id_tipo_disposicion_basura, created_at, updated_at) FROM stdin;
48	5	1	2025-09-05 06:38:53.593619+00	2025-09-05 06:38:53.593619+00
49	5	4	2025-09-05 06:38:53.593619+00	2025-09-05 06:38:53.593619+00
50	6	1	2025-09-05 06:43:22.281405+00	2025-09-05 06:43:22.281405+00
51	6	4	2025-09-05 06:43:22.281405+00	2025-09-05 06:43:22.281405+00
\.


--
-- TOC entry 3930 (class 0 OID 66651)
-- Dependencies: 238
-- Data for Name: familia_disposicion_basuras; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.familia_disposicion_basuras (id, id_familia, disposicion, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3921 (class 0 OID 16727)
-- Dependencies: 229
-- Data for Name: familia_sistema_acueducto; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.familia_sistema_acueducto (id_familia, id_sistema_acueducto, id, created_at, updated_at) FROM stdin;
32	10	7	2025-08-23 05:27:03.382367+00	2025-08-23 05:27:03.382367+00
33	10	8	2025-08-23 05:27:30.8685+00	2025-08-23 05:27:30.8685+00
34	10	9	2025-08-23 05:31:18.604036+00	2025-08-23 05:31:18.604036+00
35	10	10	2025-08-23 05:33:44.768569+00	2025-08-23 05:33:44.768569+00
36	10	11	2025-08-23 05:34:13.545712+00	2025-08-23 05:34:13.545712+00
37	1	12	2025-08-23 05:57:37.53577+00	2025-08-23 05:57:37.53577+00
61	1	26	2025-08-26 04:50:18.744644+00	2025-08-26 04:50:18.744644+00
62	1	27	2025-08-26 04:50:38.129006+00	2025-08-26 04:50:38.129006+00
63	1	28	2025-08-26 04:53:10.664114+00	2025-08-26 04:53:10.664114+00
64	1	29	2025-08-26 04:55:14.746864+00	2025-08-26 04:55:14.746864+00
65	1	30	2025-08-26 05:29:24.083966+00	2025-08-26 05:29:24.083966+00
651	1	31	2025-08-26 14:24:33.936595+00	2025-08-26 14:24:33.936595+00
660	1	38	2025-08-29 17:53:50.18036+00	2025-08-29 17:53:50.18036+00
666	1	39	2025-08-31 01:41:04.376808+00	2025-08-31 01:41:04.376808+00
667	1	40	2025-08-31 01:43:11.143779+00	2025-08-31 01:43:11.143779+00
668	1	41	2025-08-31 01:49:56.024+00	2025-08-31 01:49:56.024+00
4	1	43	2025-09-02 18:06:06.957504+00	2025-09-02 18:06:06.957504+00
5	1	44	2025-09-02 18:09:21.719232+00	2025-09-02 18:09:21.719232+00
6	1	45	2025-09-02 18:13:35.522108+00	2025-09-02 18:13:35.522108+00
7	1	46	2025-09-02 19:07:12.545935+00	2025-09-02 19:07:12.545935+00
8	1	47	2025-09-02 21:40:05.139272+00	2025-09-02 21:40:05.139272+00
9	1	48	2025-09-02 23:44:55.748726+00	2025-09-02 23:44:55.748726+00
1	1	49	2025-09-04 14:54:25.425255+00	2025-09-04 14:54:25.425255+00
2	1	50	2025-09-04 15:00:10.028732+00	2025-09-04 15:00:10.028732+00
3	1	51	2025-09-04 15:04:41.940964+00	2025-09-04 15:04:41.940964+00
11	1	68	2025-09-04 21:49:05.323242+00	2025-09-04 21:49:05.323242+00
15	1	69	2025-09-04 23:20:05.17269+00	2025-09-04 23:20:05.17269+00
13	1	70	2025-09-05 04:18:40.032486+00	2025-09-05 04:18:40.032486+00
14	1	71	2025-09-05 04:18:40.036783+00	2025-09-05 04:18:40.036783+00
17	1	72	2025-09-05 04:56:34.173793+00	2025-09-05 04:56:34.173793+00
21	1	75	2025-09-05 05:14:06.907688+00	2025-09-05 05:14:06.907688+00
22	1	76	2025-09-05 05:17:07.362398+00	2025-09-05 05:17:07.362398+00
23	1	77	2025-09-05 05:21:04.653118+00	2025-09-05 05:21:04.653118+00
24	1	78	2025-09-05 05:25:58.147533+00	2025-09-05 05:25:58.147533+00
25	1	79	2025-09-05 05:26:42.767482+00	2025-09-05 05:26:42.767482+00
26	1	80	2025-09-05 05:27:27.033866+00	2025-09-05 05:27:27.033866+00
27	1	81	2025-09-05 05:28:09.976543+00	2025-09-05 05:28:09.976543+00
28	1	82	2025-09-05 05:29:01.020839+00	2025-09-05 05:29:01.020839+00
29	1	83	2025-09-05 05:29:41.780793+00	2025-09-05 05:29:41.780793+00
30	1	84	2025-09-05 05:36:59.252269+00	2025-09-05 05:36:59.252269+00
31	1	85	2025-09-05 05:41:17.786107+00	2025-09-05 05:41:17.786107+00
41	1	91	2025-09-05 05:54:35.523074+00	2025-09-05 05:54:35.523074+00
42	1	92	2025-09-05 05:55:18.008005+00	2025-09-05 05:55:18.008005+00
43	1	93	2025-09-05 05:55:57.92599+00	2025-09-05 05:55:57.92599+00
44	1	94	2025-09-05 05:58:08.976326+00	2025-09-05 05:58:08.976326+00
45	1	95	2025-09-05 05:58:27.930262+00	2025-09-05 05:58:27.930262+00
\.


--
-- TOC entry 3942 (class 0 OID 66783)
-- Dependencies: 250
-- Data for Name: familia_sistema_acueductos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.familia_sistema_acueductos (id, id_familia, id_sistema_acueducto, created_at, updated_at) FROM stdin;
1	14	1	2025-09-04 22:29:09.689785+00	2025-09-04 22:29:09.689785+00
\.


--
-- TOC entry 3988 (class 0 OID 67223)
-- Dependencies: 296
-- Data for Name: familia_sistema_aguas_residuales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.familia_sistema_aguas_residuales (id, id_familia, id_tipo_aguas_residuales, created_at, updated_at) FROM stdin;
29	3	1	2025-09-05 06:29:12.138626+00	2025-09-05 06:29:12.138626+00
30	5	1	2025-09-05 06:38:53.593619+00	2025-09-05 06:38:53.593619+00
31	6	1	2025-09-05 06:43:22.281405+00	2025-09-05 06:43:22.281405+00
\.


--
-- TOC entry 3920 (class 0 OID 16705)
-- Dependencies: 228
-- Data for Name: familia_tipo_vivienda; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.familia_tipo_vivienda (id_familia, id_tipo_vivienda, created_at, updated_at) FROM stdin;
32	1	2025-08-23 05:27:03.382367+00	2025-08-23 05:27:03.382367+00
33	1	2025-08-23 05:27:30.8685+00	2025-08-23 05:27:30.8685+00
34	1	2025-08-23 05:31:18.604036+00	2025-08-23 05:31:18.604036+00
35	1	2025-08-23 05:33:44.768569+00	2025-08-23 05:33:44.768569+00
36	1	2025-08-23 05:34:13.545712+00	2025-08-23 05:34:13.545712+00
37	1	2025-08-23 05:57:37.53577+00	2025-08-23 05:57:37.53577+00
61	1	2025-08-26 04:50:18.744644+00	2025-08-26 04:50:18.744644+00
62	1	2025-08-26 04:50:38.129006+00	2025-08-26 04:50:38.129006+00
63	1	2025-08-26 04:53:10.664114+00	2025-08-26 04:53:10.664114+00
64	1	2025-08-26 04:55:14.746864+00	2025-08-26 04:55:14.746864+00
65	1	2025-08-26 05:29:24.083966+00	2025-08-26 05:29:24.083966+00
651	1	2025-08-26 14:24:33.936595+00	2025-08-26 14:24:33.936595+00
659	1	2025-08-29 17:49:15.249424+00	2025-08-29 17:49:15.249424+00
660	1	2025-08-29 17:53:50.18036+00	2025-08-29 17:53:50.18036+00
4	1	2025-09-02 18:06:06.957504+00	2025-09-02 18:06:06.957504+00
5	1	2025-09-02 18:09:21.719232+00	2025-09-02 18:09:21.719232+00
6	1	2025-09-02 18:13:35.522108+00	2025-09-02 18:13:35.522108+00
7	1	2025-09-02 19:07:12.545935+00	2025-09-02 19:07:12.545935+00
8	1	2025-09-02 21:40:05.139272+00	2025-09-02 21:40:05.139272+00
9	1	2025-09-02 23:44:55.748726+00	2025-09-02 23:44:55.748726+00
1	1	2025-09-04 14:54:25.425255+00	2025-09-04 14:54:25.425255+00
2	1	2025-09-04 15:00:10.028732+00	2025-09-04 15:00:10.028732+00
3	1	2025-09-04 15:04:41.940964+00	2025-09-04 15:04:41.940964+00
11	1	2025-09-04 21:49:05.323242+00	2025-09-04 21:49:05.323242+00
15	1	2025-09-04 23:20:05.17269+00	2025-09-04 23:20:05.17269+00
17	1	2025-09-05 04:56:34.173793+00	2025-09-05 04:56:34.173793+00
21	1	2025-09-05 05:14:06.907688+00	2025-09-05 05:14:06.907688+00
22	1	2025-09-05 05:17:07.362398+00	2025-09-05 05:17:07.362398+00
23	1	2025-09-05 05:21:04.653118+00	2025-09-05 05:21:04.653118+00
24	1	2025-09-05 05:25:58.147533+00	2025-09-05 05:25:58.147533+00
25	1	2025-09-05 05:26:42.767482+00	2025-09-05 05:26:42.767482+00
26	1	2025-09-05 05:27:27.033866+00	2025-09-05 05:27:27.033866+00
27	1	2025-09-05 05:28:09.976543+00	2025-09-05 05:28:09.976543+00
28	1	2025-09-05 05:29:01.020839+00	2025-09-05 05:29:01.020839+00
29	1	2025-09-05 05:29:41.780793+00	2025-09-05 05:29:41.780793+00
30	1	2025-09-05 05:36:59.252269+00	2025-09-05 05:36:59.252269+00
31	1	2025-09-05 05:41:17.786107+00	2025-09-05 05:41:17.786107+00
41	1	2025-09-05 05:54:35.523074+00	2025-09-05 05:54:35.523074+00
42	1	2025-09-05 05:55:18.008005+00	2025-09-05 05:55:18.008005+00
43	1	2025-09-05 05:55:57.92599+00	2025-09-05 05:55:57.92599+00
44	1	2025-09-05 05:58:08.976326+00	2025-09-05 05:58:08.976326+00
45	1	2025-09-05 05:58:27.930262+00	2025-09-05 05:58:27.930262+00
\.


--
-- TOC entry 3944 (class 0 OID 66790)
-- Dependencies: 252
-- Data for Name: familia_tipo_viviendas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.familia_tipo_viviendas (id, id_familia, id_tipo_vivienda, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3963 (class 0 OID 67008)
-- Dependencies: 271
-- Data for Name: familias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.familias (id_familia, apellido_familiar, sector, direccion_familia, numero_contacto, telefono, email, "tamaño_familia", tipo_vivienda, estado_encuesta, numero_encuestas, fecha_ultima_encuesta, codigo_familia, tutor_responsable, id_municipio, id_vereda, id_sector, "comunionEnCasa", numero_contrato_epm, id_parroquia, comunionencasa, fecha_encuesta, sustento_familia, observaciones_encuestador, autorizacion_datos, pozo_septico, letrina, campo_abierto, disposicion_recolector, disposicion_quemada, disposicion_enterrada, disposicion_recicla, disposicion_aire_libre, disposicion_no_aplica, id_tipo_vivienda) FROM stdin;
1	Familia Test Organizada	General	Calle Organizada #123-45	\N	3001112233	\N	1	Casa	completed	1	2025-09-05	FAM_1757053545686_28b3a05d	\N	\N	\N	\N	f	\N	\N	f	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	\N
3	Familia Test Sin Parroquia	General	Calle Sin Parroquia #888-99	\N	3008889900	\N	1	1	completed	1	2025-09-05	FAM_1757053752109_689ad132	\N	1	\N	\N	f	\N	\N	f	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	\N
5	Guerra Perez	Centro	Carrera 45 # 23-67	\N	3001234567	\N	2	1	completed	1	2025-09-05	FAM_1757054333193_d01b4286	\N	1	1	1	f	\N	1	f	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	\N
6	Rodríguez García	Centro	Carrera 45 # 23-67	\N	3001234567	\N	2	1	completed	1	2025-09-05	FAM_1757054602618_8e040142	\N	1	1	1	f	\N	1	f	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	\N
\.


--
-- TOC entry 3953 (class 0 OID 66940)
-- Dependencies: 261
-- Data for Name: municipios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.municipios (id_municipio, nombre_municipio, codigo_dane, id_departamento, created_at, updated_at) FROM stdin;
1	Abejorral	00013	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
2	Abrego	00859	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
3	Abriaquí	00014	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
4	Acacias	00741	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
5	Acandí	00468	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
6	Acevedo	00658	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
7	Achí	00168	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
8	Agrado	00659	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
9	Agua de Dios	00629	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
10	Aguachica	00442	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
11	Aguada	00916	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
12	Aguadas	00338	8	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
13	Aguazul	00381	10	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
14	Agustín Codazzi	00443	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
15	Aipe	00660	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
16	Albán	00632	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
17	Albán	00770	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
18	Albania	00365	9	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
19	Albania	00695	19	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
20	Albania	00917	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
21	Alcalá	01102	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
22	Aldana	00771	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
23	Alejandría	00015	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
24	Algarrobo	00710	20	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
25	Algeciras	00661	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
26	Almaguer	00400	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
27	Almeida	00218	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
28	Alpujarra	01026	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
29	Altamira	00662	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
30	Alto Baudo	00469	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
31	Altos del Rosario	00205	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
32	Alvarado	01027	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
33	Amagá	00016	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
34	Amalfi	00017	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
35	Ambalema	01028	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
36	Anapoima	00527	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
37	Ancuyá	00772	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
38	Andalucía	01097	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
39	Andes	00018	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
40	Angelópolis	00019	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
41	Angostura	00020	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
42	Anolaima	00633	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
43	Anorí	00021	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
44	Anserma	00339	8	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
45	Ansermanuevo	01086	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
46	Anza	00022	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
47	Anzoátegui	01068	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
48	Apartadó	00023	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
49	Apía	00898	26	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
50	Apulo	00591	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
51	Aquitania	00219	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
52	Aracataca	00711	20	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
53	Aranzazu	00340	8	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
54	Aratoca	00918	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
55	Arauca	00143	3	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
56	Arauquita	00137	3	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
57	Arbeláez	00528	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
58	Arboleda	00831	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
59	Arboledas	00843	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
60	Arboletes	00024	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
61	Arcabuco	00220	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
62	Arenal	00169	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
63	Argelia	00401	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
64	Argelia	00025	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
65	Argelia	01075	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
66	Ariguaní	00712	20	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
67	Arjona	00170	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
68	Armenia	00026	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
69	Armenia	00885	25	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
70	Armero	01029	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
71	Arroyohondo	00171	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
72	Astrea	00444	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
73	Ataco	01030	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
74	Atrato	00470	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
75	Ayapel	00499	14	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
76	Bagadó	00471	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
77	Bahía Solano	00472	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
78	Bajo Baudó	00473	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
79	Balboa	00402	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
80	Balboa	00899	26	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
81	Baranoa	00145	4	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
82	Baraya	00663	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
83	Barbacoas	00773	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
84	Barbosa	00027	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
85	Barbosa	00919	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
86	Barichara	00920	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
87	Barranca de Upía	00763	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
88	Barrancabermeja	00921	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
89	Barrancas	00696	19	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
90	Barranco de Loba	00200	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
91	Barranco Minas	00645	16	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
92	Barranquilla	00144	4	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
93	Becerril	00445	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
94	Belalcázar	00341	8	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
95	Belén	00336	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
96	Belén	00829	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
97	Belén de Bajira	00493	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
98	Belén de Los Andaquies	00375	9	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
99	Belén de Umbría	00910	26	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
100	Bello	00028	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
101	Belmira	00067	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
102	Beltrán	00529	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
103	Berbeo	00221	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
104	Betania	00029	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
105	Betéitiva	00222	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
106	Betulia	00030	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
107	Betulia	00922	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
108	Bituima	00530	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
109	Boavita	00223	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
110	Bochalema	00845	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
111	Bogotá D.C.	00167	5	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
112	Bojacá	00531	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
113	Bojaya	00474	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
114	Bolívar	00403	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
115	Bolívar	00923	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
116	Bolívar	01092	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
117	Bosconia	00446	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
118	Boyacá	00224	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
119	Briceño	00225	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
120	Briceño	00032	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
121	Bucaramanga	00915	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
122	Bucarasica	00862	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
123	Buena Vista	00226	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
124	Buenaventura	01114	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
125	Buenavista	00500	14	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
126	Buenavista	00886	25	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
127	Buenavista	01001	29	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
128	Buenos Aires	00404	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
129	Buesaco	00827	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
130	Bugalagrande	01087	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
131	Buriticá	00033	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
132	Busbanzá	00227	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
133	Cabrera	00532	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
134	Cabrera	00924	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
135	Cabuyaro	00742	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
136	Cacahual	00650	16	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
137	Cáceres	00034	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
138	Cachipay	00533	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
139	Cachirá	00865	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
140	Cácota	00833	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
141	Caicedo	00035	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
142	Caicedonia	01080	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
143	Caimito	01002	29	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
144	Cajamarca	01031	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
145	Cajibío	00405	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
146	Cajicá	00534	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
147	Calamar	00172	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
148	Calamar	00653	17	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
149	Calarcá	00895	25	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
150	Caldas	00228	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
151	Caldas	00036	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
152	Caldono	00406	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
153	Cali	01093	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
154	California	00925	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
155	Calima	01096	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
156	Caloto	00407	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
157	Campamento	00037	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
158	Campo de La Cruz	00163	4	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
159	Campoalegre	00664	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
160	Campohermoso	00229	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
161	Canalete	00501	14	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
162	Candelaria	00146	4	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
163	Candelaria	01106	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
164	Cantagallo	00173	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
165	Cañasgordas	00038	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
166	Caparrapí	00535	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
167	Capitanejo	00998	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
168	Caqueza	00536	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
169	Caracolí	00039	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
170	Caramanta	00040	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
171	Carcasí	00926	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
172	Carepa	00041	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
173	Carmen de Apicala	01064	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
174	Carmen de Carupa	00630	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
175	Carmen del Darien	00494	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
176	Carolina	00042	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
177	Cartagena	00210	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
178	Cartagena del Chairá	00376	9	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
179	Cartago	01079	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
180	Carurú	01116	32	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
181	Casabianca	01067	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
182	Castilla la Nueva	00767	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
183	Caucasia	00043	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
184	Cepitá	00927	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
185	Cereté	00502	14	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
186	Cerinza	00230	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
187	Cerrito	00928	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
188	Cerro San Antonio	00713	20	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
189	Cértegui	00475	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
190	Chachagüí	00830	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
191	Chaguaní	00537	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
192	Chalán	01005	29	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
193	Chámeza	00382	10	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
194	Chaparral	01032	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
195	Charalá	00929	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
196	Charta	00930	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
197	Chía	00634	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
198	Chigorodó	00044	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
199	Chimá	00503	14	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
200	Chimá	00997	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
201	Chimichagua	00447	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
202	Chinácota	00853	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
203	Chinavita	00231	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
204	Chinchiná	00342	8	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
205	Chinú	00504	14	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
206	Chipaque	00538	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
207	Chipatá	00931	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
208	Chiquinquirá	00232	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
209	Chíquiza	00244	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
210	Chiriguaná	00448	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
211	Chiscas	00233	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
212	Chita	00234	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
213	Chitagá	00857	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
214	Chitaraque	00235	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
215	Chivatá	00236	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
216	Chivolo	00714	20	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
217	Chivor	00245	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
218	Choachí	00539	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
219	Chocontá	00540	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
220	Cicuco	00174	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
221	Ciénaga	00738	20	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
222	Ciénaga de Oro	00522	14	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
223	Ciénega	00216	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
224	Cimitarra	00932	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
225	Circasia	00887	25	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
226	Cisneros	00045	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
227	Ciudad Bolívar	00031	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
228	Clemencia	00176	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
229	Cocorná	00046	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
230	Coello	01033	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
231	Cogua	00541	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
232	Colombia	00665	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
233	Colón	00774	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
234	Colón	00873	24	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
235	Coloso	01003	29	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
236	Cómbita	00237	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
237	Concepción	00047	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
238	Concepción	00933	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
239	Concordia	00048	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
240	Concordia	00715	20	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
241	Condoto	00476	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
242	Confines	00934	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
243	Consaca	00775	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
244	Contadero	00776	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
245	Contratación	00935	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
246	Convención	00846	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
247	Copacabana	00049	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
248	Coper	00238	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
249	Córdoba	00175	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
250	Córdoba	00777	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
251	Córdoba	00888	25	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
252	Corinto	00408	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
253	Coromoro	00936	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
254	Corozal	01025	29	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
255	Corrales	00239	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
256	Cota	00542	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
257	Cotorra	00505	14	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
258	Covarachía	00240	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
259	Coveñas	01004	29	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
260	Coyaima	01034	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
261	Cravo Norte	00138	3	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
262	Cuaspud	00778	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
263	Cubará	00241	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
264	Cubarral	00743	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
265	Cucaita	00242	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
266	Cucunubá	00543	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
267	Cúcuta	00870	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
268	Cucutilla	00838	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
269	Cuítiva	00243	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
270	Cumaral	00744	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
271	Cumaribo	01124	33	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
272	Cumbal	00779	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
273	Cumbitara	00780	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
274	Cunday	01035	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
275	Curillo	00366	9	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
276	Curití	00937	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
277	Curumaní	00449	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
278	Dabeiba	00050	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
279	Dagua	01084	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
280	Dibula	00697	19	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
281	Distracción	00698	19	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
282	Dolores	01036	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
283	Don Matías	00051	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
284	Dosquebradas	00900	26	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
285	Duitama	00246	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
286	Durania	00867	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
287	Ebéjico	00052	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
288	El Águila	01104	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
289	El Bagre	00053	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
290	El Banco	00716	20	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
291	El Cairo	01081	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
292	El Calvario	00745	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
293	El Cantón del San Pablo	00490	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
294	El Carmen	00871	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
295	El Carmen de Atrato	00491	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
296	El Carmen de Bolívar	00203	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
297	El Carmen de Chucurí	00993	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
298	El Carmen de Viboral	00131	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
299	El Castillo	00746	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
300	El Cerrito	01078	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
301	El Charco	00781	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
302	El Cocuy	00247	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
303	El Colegio	00544	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
304	El Copey	00450	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
305	El Doncello	00367	9	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
306	El Dorado	00747	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
307	El Dovio	01073	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
308	El Encanto	00002	1	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
309	El Espino	00248	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
310	El Guacamayo	00938	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
311	El Guamo	00177	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
312	El Litoral del San Juan	00489	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
313	El Molino	00699	19	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
314	El Paso	00451	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
315	El Paujil	00368	9	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
316	El Peñol	00782	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
317	El Peñón	00209	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
318	El Peñón	00635	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
319	El Peñón	00999	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
320	El Piñon	00717	20	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
321	El Playón	00939	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
322	El Retén	00718	20	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
323	El Retorno	00656	17	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
324	El Roble	01006	29	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
325	El Rosal	00545	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
326	El Rosario	00783	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
327	El Santuario	00104	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
328	El Tablón de Gómez	00826	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
329	El Tambo	00409	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
330	El Tambo	00784	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
331	El Tarra	00841	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
332	El Zulia	00836	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
333	Elías	00666	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
334	Encino	00940	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
335	Enciso	00941	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
336	Entrerrios	00054	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
337	Envigado	00055	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
338	Espinal	01037	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
339	Facatativá	00642	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
340	Falan	01038	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
341	Filadelfia	00343	8	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
342	Filandia	00889	25	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
343	Firavitoba	00249	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
344	Flandes	01039	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
345	Florencia	00364	9	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
346	Florencia	00410	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
347	Floresta	00250	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
348	Florián	00942	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
349	Florida	01112	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
350	Floridablanca	00943	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
351	Fomeque	00546	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
352	Fonseca	00700	19	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
353	Fortul	00139	3	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
354	Fosca	00547	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
355	Francisco Pizarro	00806	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
356	Fredonia	00056	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
357	Fresno	01040	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
358	Frontino	00133	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
359	Fuente de Oro	00764	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
360	Fundación	00719	20	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
361	Funes	00785	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
362	Funza	00548	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
363	Fúquene	00549	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
364	Fusagasugá	00640	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
365	Gachala	00550	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
366	Gachancipá	00551	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
367	Gachantivá	00251	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
368	Gachetá	00552	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
369	Galán	00944	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
370	Galapa	00147	4	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
371	Galeras	01007	29	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
372	Gama	00637	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
373	Gamarra	00452	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
374	Gambita	00945	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
375	Gameza	00252	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
376	Garagoa	00253	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
377	Garzón	00667	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
378	Génova	00896	25	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
379	Gigante	00668	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
380	Ginebra	01089	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
381	Giraldo	00057	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
382	Girardot	00553	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
383	Girardota	00058	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
384	Girón	00946	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
385	Gómez Plata	00059	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
386	González	00453	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
387	Gramalote	00840	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
388	Granada	00134	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
389	Granada	00554	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
390	Granada	00748	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
391	Guaca	00947	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
392	Guacamayas	00254	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
393	Guacarí	01085	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
394	Guachené	00411	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
395	Guachetá	00555	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
396	Guachucal	00786	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
397	Guadalajara de Buga	01095	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
398	Guadalupe	00669	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
399	Guadalupe	00060	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
400	Guadalupe	00948	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
401	Guaduas	00556	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
402	Guaitarilla	00787	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
403	Gualmatán	00788	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
404	Guamal	00720	20	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
405	Guamal	00749	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
406	Guamo	01041	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
407	Guapi	00412	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
408	Guapotá	00949	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
409	Guaranda	01008	29	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
410	Guarne	00061	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
411	Guasca	00557	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
412	Guatapé	00062	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
413	Guataquí	00558	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
414	Guatavita	00559	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
415	Guateque	00255	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
416	Guática	00901	26	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
417	Guavatá	00950	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
418	Guayabal de Siquima	00627	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
419	Guayabetal	00560	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
420	Guayatá	00256	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
421	Güepsa	00951	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
422	Güicán	00257	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
423	Gutiérrez	00561	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
424	Hacarí	00847	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
425	Hatillo de Loba	00202	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
426	Hato	00996	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
427	Hato Corozal	00383	10	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
428	Hatonuevo	00701	19	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
429	Heliconia	00063	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
430	Herrán	00848	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
431	Herveo	01042	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
432	Hispania	00064	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
433	Hobo	00670	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
434	Honda	01043	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
435	Ibagué	01069	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
436	Icononzo	01044	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
437	Iles	00789	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
438	Imués	00790	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
439	Inírida	00644	16	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
440	Inzá	00413	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
441	Ipiales	00791	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
442	Iquira	00671	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
443	Isnos	00672	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
444	Istmina	00466	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
445	Itagui	00065	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
446	Ituango	00066	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
447	Iza	00258	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
448	Jambaló	00414	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
449	Jamundí	01113	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
450	Jardín	00135	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
451	Jenesano	00259	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
452	Jericó	00260	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
453	Jericó	00068	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
454	Jerusalén	00562	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
455	Jesús María	00952	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
456	Jordán	00953	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
457	Juan de Acosta	00161	4	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
458	Junín	00563	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
459	Juradó	00477	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
460	La Apartada	00525	14	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
461	La Argentina	00673	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
462	La Belleza	00954	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
463	La Calera	00564	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
464	La Capilla	00262	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
465	La Ceja	00069	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
466	La Celia	00902	26	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
467	La Chorrera	00003	1	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
468	La Cruz	00792	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
469	La Cumbre	01107	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
470	La Dorada	00344	8	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
471	La Esperanza	00855	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
472	La Estrella	00070	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
473	La Florida	00793	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
474	La Gloria	00454	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
475	La Guadalupe	00649	16	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
476	La Jagua de Ibirico	00465	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
477	La Jagua del Pilar	00707	19	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
478	La Llanada	00794	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
479	La Macarena	00752	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
480	La Merced	00345	8	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
481	La Mesa	00565	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
482	La Montañita	00378	9	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
483	La Palma	00566	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
484	La Paz	00459	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
485	La Paz	00956	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
486	La Pedrera	00004	1	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
487	La Peña	00567	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
488	La Pintada	00071	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
489	La Plata	00674	18	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
490	La Playa	00852	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
491	La Primavera	01122	33	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
492	La Salina	00384	10	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
493	La Sierra	00415	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
494	La Tebaida	00890	25	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
495	La Tola	00795	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
496	La Unión	00072	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
497	La Unión	00796	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
498	La Unión	01009	29	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
499	La Unión	01082	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
500	La Uvita	00335	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
501	La Vega	00416	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
502	La Vega	00568	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
503	La Victoria	00263	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
504	La Victoria	00005	1	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
505	La Victoria	01088	31	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
506	La Virginia	00903	26	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
507	Labateca	00864	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
508	Labranzagrande	00261	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
509	Landázuri	00955	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
510	Lebríja	00957	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
511	Leguízamo	00877	24	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
512	Leiva	00797	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
513	Lejanías	00753	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
514	Lenguazaque	00569	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
515	Lérida	01071	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
516	Leticia	00001	1	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
517	Líbano	01070	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
518	Liborina	00073	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
519	Linares	00798	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
520	Lloró	00478	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
521	López	00417	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
522	Lorica	00506	14	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
523	Los Andes	00799	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
524	Los Córdobas	00507	14	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
525	Los Palmitos	01010	29	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
526	Los Patios	00860	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
527	Los Santos	00958	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
528	Lourdes	00844	23	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
529	Luruaco	00148	4	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
530	Macanal	00264	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
531	Macaravita	00959	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
532	Maceo	00074	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
533	Macheta	00570	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
534	Madrid	00571	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
535	Magangué	00178	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
536	Magüí	00800	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
537	Mahates	00179	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
538	Maicao	00702	19	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
539	Majagual	01011	29	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
540	Málaga	00960	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
541	Malambo	00149	4	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
542	Mallama	00801	22	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
543	Manatí	00150	4	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
544	Manaure	00455	12	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
545	Manaure	00703	19	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
546	Maní	00396	10	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
547	Manizales	00337	8	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
548	Manta	00572	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
549	Manzanares	00346	8	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
550	Mapiripán	00750	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
551	Mapiripana	00646	16	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
552	Margarita	00180	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
553	María la Baja	00211	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
554	Marinilla	00075	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
555	Maripí	00265	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
556	Mariquita	01045	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
557	Marmato	00347	8	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
558	Marquetalia	00363	8	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
559	Marsella	00904	26	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
560	Marulanda	00348	8	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
561	Matanza	00961	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
562	Medellín	00012	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
563	Medina	00573	15	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
564	Medio Atrato	00479	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
565	Medio Baudó	00480	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
566	Medio San Juan	00481	13	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
567	Melgar	01046	30	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
568	Mercaderes	00418	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
569	Mesetas	00751	21	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
570	Milán	00377	9	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
571	Miraflores	00266	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
572	Miraflores	00655	17	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
573	Miranda	00419	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
574	Miriti Paraná	00011	1	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
575	Mistrató	00905	26	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
576	Mitú	01115	32	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
577	Mocoa	00872	24	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
578	Mogotes	00962	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
579	Molagavita	00963	28	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
580	Momil	00508	14	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
581	Mompós	00182	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
582	Mongua	00267	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
583	Monguí	00268	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
584	Moniquirá	00269	7	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
585	Montebello	00076	2	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
586	Montecristo	00181	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
587	Montelíbano	00524	14	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
588	Montenegro	00891	25	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
589	Montería	00498	14	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
590	Monterrey	00385	10	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
591	Moñitos	00509	14	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
592	Morales	00183	6	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
593	Morales	00420	11	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
594	Morelia	00369	9	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
595	Morichal	00652	16	2025-09-05 06:20:50.248+00	2025-09-05 06:20:50.248+00
596	Morroa	01012	29	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
597	Mosquera	00574	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
598	Mosquera	00802	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
599	Motavita	00215	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
600	Murillo	01047	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
601	Murindó	00077	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
602	Mutatá	00078	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
603	Mutiscua	00835	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
604	Muzo	00270	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
605	Nariño	00575	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
606	Nariño	00803	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
607	Nariño	00079	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
608	Nátaga	00675	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
609	Natagaima	01048	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
610	Nechí	00081	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
611	Necoclí	00080	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
612	Neira	00349	8	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
613	Neiva	00657	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
614	Nemocón	00576	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
615	Nilo	00577	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
616	Nimaima	00578	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
617	Nobsa	00271	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
618	Nocaima	00579	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
619	Norcasia	00350	8	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
620	Norosí	00184	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
621	Nóvita	00482	13	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
622	Nueva Granada	00721	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
623	Nuevo Colón	00272	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
624	Nunchía	00395	10	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
625	Nuquí	00483	13	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
626	Obando	01091	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
627	Ocamonte	00964	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
628	Ocaña	00861	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
629	Oiba	00965	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
630	Oicatá	00273	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
631	Olaya	00082	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
632	Olaya Herrera	00804	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
633	Onzaga	00966	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
634	Oporapa	00676	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
635	Orito	00874	24	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
636	Orocué	00398	10	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
637	Ortega	01049	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
638	Ospina	00805	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
639	Otanche	00274	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
640	Ovejas	01013	29	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
641	Pachavita	00275	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
642	Pacho	00581	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
643	Pacoa	01120	32	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
644	Pácora	00351	8	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
645	Padilla	00421	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
646	Páez	00276	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
647	Páez	00440	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
648	Paicol	00677	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
649	Pailitas	00456	12	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
650	Paime	00582	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
651	Paipa	00277	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
652	Pajarito	00278	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
653	Palermo	00678	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
654	Palestina	00352	8	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
655	Palestina	00679	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
656	Palmar	00967	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
657	Palmar de Varela	00162	4	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
658	Palmas del Socorro	00988	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
659	Palmira	01100	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
660	Palmito	01014	29	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
661	Palocabildo	01050	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
662	Pamplona	00868	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
663	Pamplonita	00869	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
664	Pana Pana	00651	16	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
665	Pandi	00583	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
666	Panqueba	00279	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
667	Papunahua	01118	32	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
668	Páramo	00968	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
669	Paratebueno	00584	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
670	Pasca	00585	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
671	Pasto	00769	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
672	Patía	00422	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
673	Pauna	00280	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
674	Paya	00281	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
675	Paz de Ariporo	00394	10	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
676	Paz de Río	00327	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
677	Pedraza	00722	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
678	Pelaya	00457	12	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
679	Pensilvania	00353	8	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
680	Peñol	00083	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
681	Peque	00084	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
682	Pereira	00897	26	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
683	Pesca	00282	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
684	Piamonte	00423	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
685	Piedecuesta	00969	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
686	Piedras	01051	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
687	Piendamó	00424	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
688	Pijao	00892	25	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
689	Pijiño del Carmen	00735	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
690	Pinchote	00970	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
691	Pinillos	00185	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
692	Piojó	00151	4	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
693	Pisba	00283	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
694	Pital	00680	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
695	Pitalito	00681	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
696	Pivijay	00723	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
697	Planadas	01052	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
698	Planeta Rica	00510	14	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
699	Plato	00724	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
700	Policarpa	00807	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
701	Polonuevo	00152	4	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
702	Ponedera	00166	4	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
703	Popayán	00399	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
704	Pore	00386	10	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
705	Potosí	00808	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
706	Pradera	01098	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
707	Prado	01053	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
708	Providencia	00809	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
709	Providencia	00911	27	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
710	Pueblo Bello	00458	12	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
711	Pueblo Nuevo	00511	14	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
712	Pueblo Rico	00906	26	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
713	Pueblo Viejo	00737	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
714	Pueblorrico	00085	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
715	Puente Nacional	00971	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
716	Puerres	00810	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
717	Puerto Alegría	00010	1	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
718	Puerto Arica	00006	1	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
719	Puerto Asís	00883	24	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
720	Puerto Berrío	00086	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
721	Puerto Boyacá	00284	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
722	Puerto Caicedo	00875	24	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
723	Puerto Carreño	01121	33	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
724	Puerto Colombia	00165	4	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
725	Puerto Colombia	00648	16	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
726	Puerto Concordia	00754	21	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
727	Puerto Escondido	00512	14	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
728	Puerto Gaitán	00755	21	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
729	Puerto Guzmán	00876	24	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
730	Puerto Libertador	00526	14	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
731	Puerto Lleras	00757	21	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
732	Puerto López	00756	21	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
733	Puerto Nare	00087	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
734	Puerto Nariño	00007	1	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
735	Puerto Parra	00914	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
736	Puerto Rico	00370	9	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
737	Puerto Rico	00758	21	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
738	Puerto Rondón	00140	3	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
739	Puerto Salgar	00586	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
740	Puerto Santander	00008	1	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
741	Puerto Santander	00839	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
742	Puerto Tejada	00425	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
743	Puerto Triunfo	00088	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
744	Puerto Wilches	00913	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
745	Pulí	00587	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
746	Pupiales	00811	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
747	Puracé	00426	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
748	Purificación	01054	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
749	Purísima	00513	14	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
750	Quebradanegra	00588	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
751	Quetame	00589	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
752	Quibdó	00467	13	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
753	Quimbaya	00893	25	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
754	Quinchía	00907	26	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
755	Quípama	00285	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
756	Quipile	00590	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
757	Ragonvalia	00854	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
758	Ramiriquí	00286	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
759	Ráquira	00287	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
760	Recetor	00387	10	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
761	Regidor	00186	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
762	Remedios	00089	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
763	Remolino	00725	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
764	Repelón	00164	4	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
765	Restrepo	00759	21	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
766	Restrepo	01083	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
767	Retiro	00090	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
768	Ricaurte	00592	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
769	Ricaurte	00812	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
770	Rio Blanco	01055	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
771	Río de Oro	00464	12	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
772	Río Iro	00484	13	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
773	Río Quito	00485	13	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
774	Río Viejo	00187	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
775	Riofrío	01101	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
776	Riohacha	00694	19	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
777	Rionegro	00091	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
778	Rionegro	00972	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
779	Riosucio	00354	8	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
780	Riosucio	00486	13	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
781	Risaralda	00355	8	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
782	Rivera	00682	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
783	Roberto Payán	00813	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
784	Roldanillo	01074	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
785	Roncesvalles	01056	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
786	Rondón	00288	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
787	Rosas	00427	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
788	Rovira	01057	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
789	Sabana de Torres	00992	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
790	Sabanagrande	00153	4	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
791	Sabanalarga	00092	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
792	Sabanalarga	00154	4	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
793	Sabanalarga	00388	10	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
794	Sabanas de San Angel	00734	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
795	Sabaneta	00093	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
796	Saboyá	00289	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
797	Sácama	00389	10	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
798	Sáchica	00290	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
799	Sahagún	00514	14	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
800	Saladoblanco	00683	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
801	Salamina	00356	8	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
802	Salamina	00726	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
803	Salazar	00837	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
804	Saldaña	01058	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
805	Salento	00894	25	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
806	Salgar	00094	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
807	Samacá	00291	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
808	Samaná	00357	8	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
809	Samaniego	00814	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
810	Sampués	01024	29	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
811	San Agustín	00693	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
812	San Alberto	00460	12	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
813	San Andrés	00912	27	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
814	San Andrés	00973	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
815	San Andrés de Cuerquía	00127	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
816	San Andrés de Tumaco	00828	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
817	San Andrés Sotavento	00515	14	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
818	San Antero	00516	14	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
819	San Antonio	01066	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
820	San Antonio del Tequendama	00628	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
821	San Benito	00995	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
822	San Benito Abad	01015	29	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
823	San Bernardo	00593	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
824	San Bernardo	00816	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
825	San Bernardo del Viento	00497	14	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
826	San Calixto	00851	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
827	San Carlos	00132	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
828	San Carlos	00523	14	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
829	San Carlos de Guaroa	00765	21	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
830	San Cayetano	00594	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
831	San Cayetano	00850	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
832	San Cristóbal	00212	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
833	San Diego	00461	12	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
834	San Eduardo	00292	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
835	San Estanislao	00188	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
836	San Felipe	00647	16	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
837	San Fernando	00189	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
838	San Francisco	00095	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
839	San Francisco	00595	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
840	San Francisco	00879	24	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
841	San Gil	00974	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
842	San Jacinto	00208	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
843	San Jacinto del Cauca	00206	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
844	San Jerónimo	00096	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
845	San Joaquín	00975	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
846	San José	00358	8	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
847	San José de La Montaña	00129	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
848	San José de Miranda	00990	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
849	San José de Pare	00331	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
850	San José de Uré	00521	14	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
851	San José del Fragua	00374	9	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
852	San José del Guaviare	00654	17	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
853	San José del Palmar	00492	13	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
854	San Juan de Arama	00766	21	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
855	San Juan de Betulia	01022	29	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
856	San Juan de Río Seco	00625	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
857	San Juan de Urabá	00130	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
858	San Juan del Cesar	00708	19	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
859	San Juan Nepomuceno	00190	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
860	San Juanito	00760	21	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
861	San Lorenzo	00817	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
862	San Luis	00097	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
863	San Luis	01065	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
864	San Luis de Gaceno	00330	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
865	San Luis de Gaceno	00393	10	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
866	San Luis de Sincé	01021	29	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
867	San Marcos	01016	29	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
868	San Martín	00462	12	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
869	San Martín	00761	21	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
870	San Martín de Loba	00204	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
871	San Mateo	00293	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
872	San Miguel	00880	24	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
873	San Miguel	00976	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
874	San Miguel de Sema	00332	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
875	San Onofre	01017	29	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
876	San Pablo	00818	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
877	San Pablo de Borbur	00207	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
878	San Pablo de Borbur	00329	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
879	San Pedro	00098	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
880	San Pedro	01018	29	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
881	San Pedro	01094	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
882	San Pedro de Cartago	00825	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
883	San Pedro de Uraba	00124	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
884	San Pelayo	00517	14	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
885	San Rafael	00099	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
886	San Roque	00100	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
887	San Sebastián	00439	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
888	San Sebastián de Buenavista	00733	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
889	San Vicente	00101	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
890	San Vicente de Chucurí	00989	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
891	San Vicente del Caguán	00379	9	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
892	San Zenón	00727	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
893	Sandoná	00815	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
894	Santa Ana	00728	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
895	Santa Bárbara	00102	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
896	Santa Bárbara	00819	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
897	Santa Bárbara	00977	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
898	Santa Bárbara de Pinto	00736	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
899	Santa Catalina	00191	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
900	Santa Helena del Opón	00991	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
901	Santa Isabel	01059	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
902	Santa Lucía	00155	4	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
903	Santa María	00295	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
904	Santa María	00684	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
905	Santa Marta	00709	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
906	Santa Rosa	00192	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
907	Santa Rosa	00428	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
908	Santa Rosa de Cabal	00909	26	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
909	Santa Rosa de Osos	00126	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
910	Santa Rosa de Viterbo	00328	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
911	Santa Rosa del Sur	00201	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
912	Santa Rosalía	01123	33	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
913	Santa Sofía	00296	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
914	Santacruz	00768	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
915	Santafé de Antioquia	00125	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
916	Santana	00294	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
917	Santander de Quilichao	00438	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
918	Santiago	00863	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
919	Santiago	00881	24	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
920	Santiago de Tolú	01023	29	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
921	Santo Domingo	00103	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
922	Santo Tomás	00156	4	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
923	Santuario	00908	26	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
924	Sapuyes	00820	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
925	Saravena	00141	3	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
926	Sardinata	00858	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
927	Sasaima	00638	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
928	Sativanorte	00297	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
929	Sativasur	00298	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
930	Segovia	00105	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
931	Sesquilé	00596	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
932	Sevilla	01076	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
933	Siachoque	00299	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
934	Sibaté	00597	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
935	Sibundoy	00878	24	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
936	Silos	00832	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
937	Silvania	00598	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
938	Silvia	00429	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
939	Simacota	00978	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
940	Simijaca	00599	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
941	Simití	00193	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
942	Sincelejo	01000	29	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
943	Sipí	00487	13	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
944	Sitionuevo	00729	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
945	Soacha	00600	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
946	Soatá	00300	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
947	Socha	00302	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
948	Socorro	00979	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
949	Socotá	00301	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
950	Sogamoso	00303	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
951	Solano	00371	9	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
952	Soledad	00157	4	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
953	Solita	00372	9	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
954	Somondoco	00304	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
955	Sonsón	00136	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
956	Sopetrán	00106	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
957	Soplaviento	00194	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
958	Sopó	00636	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
959	Sora	00305	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
960	Soracá	00307	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
961	Sotaquirá	00306	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
962	Sotara	00430	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
963	Suaita	00980	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
964	Suan	00158	4	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
965	Suárez	00431	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
966	Suárez	01072	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
967	Suaza	00685	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
968	Subachoque	00601	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
969	Sucre	00432	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
970	Sucre	00981	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
971	Sucre	01019	29	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
972	Suesca	00602	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
973	Supatá	00603	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
974	Supía	00359	8	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
975	Suratá	00982	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
976	Susa	00604	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
977	Susacón	00308	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
978	Sutamarchán	00309	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
979	Sutatausa	00605	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
980	Sutatenza	00310	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
981	Tabio	00606	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
982	Tadó	00495	13	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
983	Talaigua Nuevo	00195	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
984	Tamalameque	00463	12	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
985	Támara	00397	10	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
986	Tame	00142	3	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
987	Támesis	00107	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
988	Taminango	00821	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
989	Tangua	00822	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
990	Taraira	01117	32	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
991	Tarapacá	00009	1	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
992	Tarazá	00108	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
993	Tarqui	00686	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
994	Tarso	00109	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
995	Tasco	00311	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
996	Tauramena	00390	10	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
997	Tausa	00607	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
998	Tello	00688	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
999	Tena	00608	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1000	Tenerife	00730	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1001	Tenjo	00609	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1002	Tenza	00312	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1003	Teorama	00842	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1004	Teruel	00689	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1005	Tesalia	00687	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1006	Tibacuy	00610	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1007	Tibaná	00313	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1008	Tibasosa	00334	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1009	Tibirita	00611	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1010	Tibú	00849	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1011	Tierralta	00518	14	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1012	Timaná	00690	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1013	Timbío	00433	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1014	Timbiquí	00434	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1015	Tinjacá	00314	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1016	Tipacoque	00315	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1017	Tiquisio	00196	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1018	Titiribí	00110	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1019	Toca	00316	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1020	Tocaima	00612	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1021	Tocancipá	00613	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1022	Togüí	00325	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1023	Toledo	00111	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1024	Toledo	00834	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1025	Tolú Viejo	01020	29	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1026	Tona	00983	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1027	Tópaga	00317	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1028	Topaipí	00614	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1029	Toribio	00435	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1030	Toro	01105	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1031	Tota	00318	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1032	Totoró	00436	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1033	Trinidad	00391	10	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1034	Trujillo	01109	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1035	Tubará	00159	4	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1036	Tuchín	00519	14	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1037	Tuluá	01111	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1038	Tunja	00217	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1039	Tununguá	00214	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1040	Túquerres	00823	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1041	Turbaco	00197	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1042	Turbaná	00198	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1043	Turbo	00112	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1044	Turmequé	00319	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1045	Tuta	00333	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1046	Tutazá	00320	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1047	Ubalá	00615	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1048	Ubaque	00616	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1049	Ulloa	01108	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1050	Umbita	00321	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1051	Une	00617	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1052	Unguía	00488	13	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1053	Unión Panamericana	00496	13	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1054	Uramita	00113	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1055	Uribe	00739	21	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1056	Uribia	00704	19	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1057	Urrao	00114	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1058	Urumita	00705	19	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1059	Usiacurí	00160	4	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1060	Útica	00618	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1061	Valdivia	00115	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1062	Valencia	00520	14	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1063	Valle de Guamez	00882	24	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1064	Valle de San José	00994	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1065	Valle de San Juan	01063	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1066	Valledupar	00441	12	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1067	Valparaíso	00116	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1068	Valparaíso	00373	9	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1069	Vegachí	00117	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1070	Vélez	00984	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1071	Venadillo	01060	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1072	Venecia	00118	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1073	Venecia	00580	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1074	Ventaquemada	00322	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1075	Vergara	00631	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1076	Versalles	01103	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1077	Vetas	00985	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1078	Vianí	00619	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1079	Victoria	00360	8	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1080	Vigía del Fuerte	00128	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1081	Vijes	01110	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1082	Villa Caro	00866	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1083	Villa de Leyva	00326	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1084	Villa de San Diego de Ubate	00626	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1085	Villa del Rosario	00856	23	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1086	Villa Rica	00437	11	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1087	Villagarzón	00884	24	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1088	Villagómez	00620	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1089	Villahermosa	01061	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1090	Villamaría	00361	8	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1091	Villanueva	00199	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1092	Villanueva	00392	10	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1093	Villanueva	00706	19	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1094	Villanueva	00986	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1095	Villapinzón	00621	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1096	Villarrica	01062	30	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1097	Villavicencio	00740	21	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1098	Villavieja	00691	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1099	Villeta	00622	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1100	Viotá	00623	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1101	Viracachá	00323	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1102	Vista Hermosa	00762	21	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1103	Viterbo	00362	8	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1104	Yacopí	00639	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1105	Yacuanquer	00824	22	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1106	Yaguará	00692	18	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1107	Yalí	00119	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1108	Yarumal	00120	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1109	Yavaraté	01119	32	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1110	Yolombó	00121	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1111	Yondó	00122	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1112	Yopal	00380	10	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1113	Yotoco	01099	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1114	Yumbo	01090	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1115	Zambrano	00213	6	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1116	Zapatoca	00987	28	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1117	Zapayán	00731	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1118	Zaragoza	00123	2	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1119	Zarzal	01077	31	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1120	Zetaquira	00324	7	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1121	Zipacón	00624	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1122	Zipaquirá	00641	15	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
1123	Zona Bananera	00732	20	2025-09-05 06:20:50.249+00	2025-09-05 06:20:50.249+00
\.


--
-- TOC entry 3982 (class 0 OID 67179)
-- Dependencies: 290
-- Data for Name: niveles_educativos; Type: TABLE DATA; Schema: public; Owner: -
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
-- TOC entry 3978 (class 0 OID 67146)
-- Dependencies: 286
-- Data for Name: parentescos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parentescos (id_parentesco, nombre, descripcion, activo, "createdAt", "updatedAt") FROM stdin;
1	Abuelo	Abuelo paterno o materno	t	2025-09-04 20:14:04.598+00	2025-09-04 20:14:04.598+00
\.


--
-- TOC entry 3955 (class 0 OID 66955)
-- Dependencies: 263
-- Data for Name: parroquia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parroquia (id_parroquia, nombre, id_municipio) FROM stdin;
\.


--
-- TOC entry 3934 (class 0 OID 66690)
-- Dependencies: 242
-- Data for Name: parroquias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parroquias (id_parroquia, nombre, id_municipio, created_at, updated_at) FROM stdin;
1	Parroquia Central Abejorral	1	2025-09-05 06:36:25.335+00	2025-09-05 06:36:25.336+00
2	Parroquia Central Abrego	2	2025-09-05 06:36:25.336+00	2025-09-05 06:36:25.336+00
3	Parroquia Central Abriaquí	3	2025-09-05 06:36:25.336+00	2025-09-05 06:36:25.336+00
4	Parroquia Central Acacias	4	2025-09-05 06:36:25.336+00	2025-09-05 06:36:25.336+00
5	Parroquia Central Acandí	5	2025-09-05 06:36:25.336+00	2025-09-05 06:36:25.336+00
6	Parroquia Central Acevedo	6	2025-09-05 06:36:25.336+00	2025-09-05 06:36:25.336+00
7	Parroquia Central Achí	7	2025-09-05 06:36:25.336+00	2025-09-05 06:36:25.336+00
8	Parroquia Central Agrado	8	2025-09-05 06:36:25.336+00	2025-09-05 06:36:25.336+00
9	Parroquia Central Agua de Dios	9	2025-09-05 06:36:25.336+00	2025-09-05 06:36:25.336+00
10	Parroquia Central Aguachica	10	2025-09-05 06:36:25.336+00	2025-09-05 06:36:25.336+00
\.


--
-- TOC entry 3993 (class 0 OID 67259)
-- Dependencies: 301
-- Data for Name: persona_destreza; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.persona_destreza ("createdAt", "updatedAt", id_destrezas_destrezas, id_personas_personas) FROM stdin;
\.


--
-- TOC entry 3919 (class 0 OID 16646)
-- Dependencies: 227
-- Data for Name: persona_enfermedad; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.persona_enfermedad (id_persona, id_enfermedad, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3974 (class 0 OID 67099)
-- Dependencies: 282
-- Data for Name: personas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personas (id_personas, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, id_tipo_identificacion_tipo_identificacion, identificacion, telefono, correo_electronico, fecha_nacimiento, direccion, id_familia_familias, id_estado_civil_estado_civil, estudios, en_que_eres_lider, necesidad_enfermo, id_profesion, id_sexo, talla_camisa, talla_pantalon, talla_zapato, id_familia, id_parroquia, id_parentesco, id_comunidad_cultural, id_nivel_educativo, motivo_celebrar, dia_celebrar, mes_celebrar) FROM stdin;
31	Jeff	Peña García	Guerra Perez	\N	1	857484	32066666666	jeff.1757054333223.0@temp.com	1985-03-14	Carrera 45 # 23-67	5	1	Universitario	\N	\N	\N	1	L	32	42	\N	\N	\N	\N	\N	\N	\N	\N
32	Pedro	Antonio Rodríguez	Guerra Perez	\N	\N	FALLECIDO_1757054333228_427bec7e_0	N/A	fallecido.1757054333229.0@temp.com	1900-01-01	Carrera 45 # 23-67	5	\N	{"es_fallecido":true,"fecha_aniversario":"2020-05-15","era_padre":false,"era_madre":false,"causa_fallecimiento":"Enfermedad cardiovascular"}	\N	\N	\N	\N	\N	\N	\N	5	\N	\N	\N	\N	\N	\N	\N
33	Carlos	Andrés Rodríguez García	Rodríguez García	\N	1	49844585	32066666666	carlos.1757054602652.0@temp.com	1985-03-14	Carrera 45 # 23-67	6	1	Universitario	\N	\N	\N	1	L	32	42	\N	\N	\N	\N	\N	\N	\N	\N
34	Pedro	Antonio Rodríguez	Rodríguez García	\N	\N	FALLECIDO_1757054602657_9dc26fe3_0	N/A	fallecido.1757054602658.0@temp.com	1900-01-01	Carrera 45 # 23-67	6	\N	{"es_fallecido":true,"fecha_aniversario":"2020-05-15","era_padre":false,"era_madre":false,"causa_fallecimiento":"Enfermedad cardiovascular"}	\N	\N	\N	\N	\N	\N	\N	6	\N	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 3992 (class 0 OID 67248)
-- Dependencies: 300
-- Data for Name: profesiones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profesiones (id_profesion, nombre, descripcion, created_at, updated_at) FROM stdin;
1	Ingeniero	Profesión de Ingeniería	2025-09-04 22:48:50.4363+00	2025-09-04 22:48:50.4363+00
2	Contador	Profesión de Contaduría	2025-09-04 22:48:50.4363+00	2025-09-04 22:48:50.4363+00
\.


--
-- TOC entry 3946 (class 0 OID 66901)
-- Dependencies: 254
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, nombre, created_at, updated_at) FROM stdin;
8dc7484f-7a0e-43ba-9337-0feea3a1b9ba	admin	2025-09-04 19:09:47.51+00	2025-09-04 19:09:47.51+00
18d1054d-85d4-4f92-a214-eb9a5d05f677	Administrador	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
2a122c2a-2aaf-458a-b9fe-914c79df1ff7	Super Administrador	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
4bad7653-2099-4c20-8864-7f939adddb39	Párroco	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
36e36874-8ee2-458f-a566-02d538974a30	Vicario	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
7b242b3d-5a86-45d9-8a34-2e5ff49d9de4	Coordinador General	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
a97ee02f-dc57-43f9-8c85-03257deaefe5	Secretario Parroquial	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
5845b4f8-76cf-47e0-944e-55de08b7abf0	Encuestador	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
62e75c80-8154-439c-b06b-1582d6e08b07	Supervisor de Campo	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
5a1356c1-0d44-4951-a5f4-9f37c1a68c75	Líder Comunitario	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
68745906-29f6-4af0-9bcd-b4cd716f5f53	Agente Pastoral	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
96ee6a4b-dc4e-405d-a94f-053f47f242f7	Consultor	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
633f5790-713e-4451-a2c7-98230f00532e	Analista de Datos	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
e50e30a1-abae-4739-8b63-54f9c45d6170	Auditor	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
29da26e4-cd2b-402c-95fd-eb65be51b42e	Coordinador de Liturgia	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
f1f91a7e-6685-4403-89c2-835d00848815	Coordinador de Catequesis	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
8b0b6a24-f454-4efe-8e3c-4051f5bc9b92	Coordinador de Juventud	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
dad297e2-da44-4765-b62c-6ed97eac5bf0	Coordinador de Caridad	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
0a458020-fa8b-4a69-8183-a51a3529f976	Coordinador de Familia	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
c4f8f102-1695-46d5-901e-2268d0345371	Ministro Extraordinario	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
29bf2e69-be36-4511-b350-9e403e96ef20	Soporte Técnico	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
886593c7-3d8f-420a-a91c-3fd85f1633f6	Operador de Sistema	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
63f50524-7c1d-4342-a9ed-49d6c0897dc5	Usuario	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
3fef83f9-0c57-4263-abd3-7865eab19d58	Invitado	2025-09-04 19:46:38.12+00	2025-09-04 19:46:38.12+00
\.


--
-- TOC entry 3924 (class 0 OID 66627)
-- Dependencies: 232
-- Data for Name: sector; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sector (id_sector, nombre, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3959 (class 0 OID 66982)
-- Dependencies: 267
-- Data for Name: sectores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sectores (id_sector, nombre, id_municipio, created_at, updated_at) FROM stdin;
1	Sector Centro	1	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
2	Sector Rural	1	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
3	Sector Centro	2	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
4	Sector Rural	2	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
5	Sector Centro	3	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
6	Sector Rural	3	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
7	Sector Centro	4	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
8	Sector Rural	4	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
9	Sector Centro	5	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
10	Sector Rural	5	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
11	Sector Centro	6	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
12	Sector Rural	6	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
13	Sector Centro	7	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
14	Sector Rural	7	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
15	Sector Centro	8	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
16	Sector Rural	8	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
17	Sector Centro	9	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
18	Sector Rural	9	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
19	Sector Centro	10	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
20	Sector Rural	10	2025-09-05 06:36:25.345+00	2025-09-05 06:36:25.345+00
\.


--
-- TOC entry 3926 (class 0 OID 66634)
-- Dependencies: 234
-- Data for Name: sexo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sexo (id_sexo, descripcion, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3957 (class 0 OID 66969)
-- Dependencies: 265
-- Data for Name: sexos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sexos (id_sexo, nombre, codigo, descripcion, created_at, updated_at) FROM stdin;
1	Masculino	M	Sexo masculino	2025-09-04 20:06:15.858+00	2025-09-04 20:06:15.858+00
\.


--
-- TOC entry 3916 (class 0 OID 16506)
-- Dependencies: 224
-- Data for Name: sistemas_acueducto; Type: TABLE DATA; Schema: public; Owner: -
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
-- TOC entry 3936 (class 0 OID 66728)
-- Dependencies: 244
-- Data for Name: sistemas_acueductos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sistemas_acueductos (id_sistema, descripcion, activo, created_at, updated_at) FROM stdin;
1	Acueducto Municipal	t	2025-09-04 14:41:06.678+00	2025-09-04 14:41:06.678+00
2	Pozo Propio	t	2025-09-04 14:41:06.683+00	2025-09-04 14:41:06.683+00
3	Agua Lluvia	t	2025-09-04 14:41:06.686+00	2025-09-04 14:41:06.686+00
4	Carrotanque	t	2025-09-04 14:41:06.693+00	2025-09-04 14:41:06.693+00
5	Nacimiento	t	2025-09-04 14:41:06.702+00	2025-09-04 14:41:06.702+00
6	Otro	t	2025-09-04 14:41:06.71+00	2025-09-04 14:41:06.71+00
\.


--
-- TOC entry 3980 (class 0 OID 67160)
-- Dependencies: 288
-- Data for Name: situaciones_civiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.situaciones_civiles (id_situacion_civil, nombre, descripcion, codigo, orden, activo, "createdAt", "updatedAt", "fechaEliminacion") FROM stdin;
1	Soltero(a)	Persona que no ha contraído matrimonio	SOL	1	t	2025-09-04 20:17:08.31+00	2025-09-04 20:17:08.31+00	\N
\.


--
-- TOC entry 3984 (class 0 OID 67195)
-- Dependencies: 292
-- Data for Name: tallas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tallas (id_talla, tipo_prenda, talla, descripcion, genero, equivalencia_numerica, activo, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3928 (class 0 OID 66641)
-- Dependencies: 236
-- Data for Name: tipo_identificacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tipo_identificacion (id_tipo_identificacion, descripcion, codigo) FROM stdin;
\.


--
-- TOC entry 3967 (class 0 OID 67050)
-- Dependencies: 275
-- Data for Name: tipos_aguas_residuales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tipos_aguas_residuales (id_tipo_aguas_residuales, nombre, descripcion, created_at, updated_at) FROM stdin;
1	Alcantarillado	Conectado a red de alcantarillado municipal	2025-09-04 19:09:22.949+00	2025-09-04 19:09:22.949+00
2	Pozo Séptico	Sistema de tratamiento individual	2025-09-04 19:09:22.96+00	2025-09-04 19:09:22.96+00
3	Letrina	Sistema básico de saneamiento	2025-09-04 19:09:22.965+00	2025-09-04 19:09:22.965+00
4	Campo Abierto	Sin sistema de tratamiento	2025-09-04 19:09:22.969+00	2025-09-04 19:09:22.969+00
5	Río/Quebrada	Descarga directa a fuente hídrica	2025-09-04 19:09:22.973+00	2025-09-04 19:09:22.973+00
\.


--
-- TOC entry 3965 (class 0 OID 67040)
-- Dependencies: 273
-- Data for Name: tipos_disposicion_basura; Type: TABLE DATA; Schema: public; Owner: -
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
-- TOC entry 3949 (class 0 OID 66922)
-- Dependencies: 257
-- Data for Name: tipos_identificacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tipos_identificacion (id_tipo_identificacion, nombre, codigo, descripcion, created_at, updated_at) FROM stdin;
1	Cédula de Ciudadanía	CC	Cédula de Ciudadanía	2025-09-04 21:48:57.451+00	2025-09-04 21:48:57.451+00
\.


--
-- TOC entry 3969 (class 0 OID 67059)
-- Dependencies: 277
-- Data for Name: tipos_vivienda; Type: TABLE DATA; Schema: public; Owner: -
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
-- TOC entry 3938 (class 0 OID 66736)
-- Dependencies: 246
-- Data for Name: tipos_viviendas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tipos_viviendas (id_tipo, descripcion, activo, created_at, updated_at) FROM stdin;
1	Casa Propia	t	2025-09-04 14:41:06.719+00	2025-09-04 14:41:06.719+00
2	Casa Familiar	t	2025-09-04 14:41:06.727+00	2025-09-04 14:41:06.727+00
3	Casa Arrendada	t	2025-09-04 14:41:06.736+00	2025-09-04 14:41:06.736+00
4	Apartamento	t	2025-09-04 14:41:06.742+00	2025-09-04 14:41:06.742+00
5	Cuarto	t	2025-09-04 14:41:06.746+00	2025-09-04 14:41:06.746+00
6	Otro	t	2025-09-04 14:41:06.753+00	2025-09-04 14:41:06.753+00
\.


--
-- TOC entry 3945 (class 0 OID 66887)
-- Dependencies: 253
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, correo_electronico, contrasena, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, numero_documento, telefono, activo, fecha_ultimo_acceso, intentos_fallidos, bloqueado_hasta, token_recuperacion, token_expiracion, email_verificado, token_verificacion_email, fecha_verificacion_email, expira_token_reset, refresh_token, created_at, updated_at) FROM stdin;
163c77aa-ca7b-4676-81e5-60fcd9c19229	diego.garcia5105@yopmail.com	$2b$10$kO1..sRjPOjCiO5SbBr5RO0l3olr00edqFHZmRtL6roGeT1PnD4au	Diego	Carlos	Garcia	López	\N	+57 300 456 7890	t	\N	0	\N	\N	\N	t	\N	\N	\N	\N	2025-09-04 19:52:55.978+00	2025-09-04 19:54:11.78+00
acdb6fc5-ac64-4936-b756-0498873986c1	admin@parroquia.com	$2b$10$U5RAjETEtaQRKqarmxRn/OcbAuOcINKNi42KSA8deReJrfP5tOfKO	Diego	Carlos	Garcia	López	\N	+57 300 456 7890	t	2025-09-05 06:52:16.891+00	0	\N	\N	\N	t	\N	\N	\N	\N	2025-09-04 19:54:50.896+00	2025-09-05 06:52:16.892+00
d8be67ce-9409-4d48-90b0-e07463c5c346	admin@admin.com	$2b$10$wL9nS0IBjIJYMPvwc/i.CuKWsuYbidsbgH4pL14TTJQqf.DEBo5hS	Admin	\N	Sistema	\N	\N	\N	t	2025-09-05 02:15:43.151+00	0	\N	\N	\N	t	\N	\N	\N	\N	2025-09-04 19:27:51.2+00	2025-09-05 02:15:43.152+00
\.


--
-- TOC entry 3947 (class 0 OID 66906)
-- Dependencies: 255
-- Data for Name: usuarios_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios_roles (id_usuarios, id_roles, created_at, updated_at) FROM stdin;
163c77aa-ca7b-4676-81e5-60fcd9c19229	18d1054d-85d4-4f92-a214-eb9a5d05f677	2025-09-04 19:52:56.042+00	2025-09-04 19:52:56.042+00
acdb6fc5-ac64-4936-b756-0498873986c1	18d1054d-85d4-4f92-a214-eb9a5d05f677	2025-09-04 19:54:50.955+00	2025-09-04 19:54:50.955+00
\.


--
-- TOC entry 3961 (class 0 OID 66994)
-- Dependencies: 269
-- Data for Name: veredas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.veredas (id_vereda, nombre, codigo_vereda, id_municipio_municipios, created_at, updated_at) FROM stdin;
1	Vereda Central Abejorral	V001	1	2025-09-05 06:36:25.352+00	2025-09-05 06:36:25.352+00
2	Vereda Central Abrego	V002	2	2025-09-05 06:36:25.352+00	2025-09-05 06:36:25.352+00
3	Vereda Central Abriaquí	V003	3	2025-09-05 06:36:25.352+00	2025-09-05 06:36:25.352+00
4	Vereda Central Acacias	V004	4	2025-09-05 06:36:25.352+00	2025-09-05 06:36:25.352+00
5	Vereda Central Acandí	V005	5	2025-09-05 06:36:25.352+00	2025-09-05 06:36:25.352+00
6	Vereda Central Acevedo	V006	6	2025-09-05 06:36:25.352+00	2025-09-05 06:36:25.352+00
7	Vereda Central Achí	V007	7	2025-09-05 06:36:25.352+00	2025-09-05 06:36:25.352+00
8	Vereda Central Agrado	V008	8	2025-09-05 06:36:25.352+00	2025-09-05 06:36:25.352+00
9	Vereda Central Agua de Dios	V009	9	2025-09-05 06:36:25.352+00	2025-09-05 06:36:25.352+00
10	Vereda Central Aguachica	V010	10	2025-09-05 06:36:25.352+00	2025-09-05 06:36:25.352+00
\.


--
-- TOC entry 4047 (class 0 OID 0)
-- Dependencies: 278
-- Name: comunidades_culturales_id_comunidad_cultural_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.comunidades_culturales_id_comunidad_cultural_seq', 1, true);


--
-- TOC entry 4048 (class 0 OID 0)
-- Dependencies: 258
-- Name: departamentos_id_departamento_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departamentos_id_departamento_seq', 1, false);


--
-- TOC entry 4049 (class 0 OID 0)
-- Dependencies: 297
-- Name: destrezas_id_destreza_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.destrezas_id_destreza_seq', 1, false);


--
-- TOC entry 4050 (class 0 OID 0)
-- Dependencies: 302
-- Name: difuntos_familia_id_difunto_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.difuntos_familia_id_difunto_seq', 2, true);


--
-- TOC entry 4051 (class 0 OID 0)
-- Dependencies: 225
-- Name: encuestas_id_encuesta_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.encuestas_id_encuesta_seq', 16, true);


--
-- TOC entry 4052 (class 0 OID 0)
-- Dependencies: 283
-- Name: enfermedades_id_enfermedad_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.enfermedades_id_enfermedad_seq', 1, true);


--
-- TOC entry 4053 (class 0 OID 0)
-- Dependencies: 247
-- Name: estados_civiles_id_estado_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.estados_civiles_id_estado_seq', 6, true);


--
-- TOC entry 4054 (class 0 OID 0)
-- Dependencies: 239
-- Name: familia_aguas_residuales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.familia_aguas_residuales_id_seq', 1, false);


--
-- TOC entry 4055 (class 0 OID 0)
-- Dependencies: 293
-- Name: familia_disposicion_basura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.familia_disposicion_basura_id_seq', 51, true);


--
-- TOC entry 4056 (class 0 OID 0)
-- Dependencies: 237
-- Name: familia_disposicion_basuras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.familia_disposicion_basuras_id_seq', 1, false);


--
-- TOC entry 4057 (class 0 OID 0)
-- Dependencies: 230
-- Name: familia_sistema_acueducto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.familia_sistema_acueducto_id_seq', 95, true);


--
-- TOC entry 4058 (class 0 OID 0)
-- Dependencies: 249
-- Name: familia_sistema_acueductos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.familia_sistema_acueductos_id_seq', 1, true);


--
-- TOC entry 4059 (class 0 OID 0)
-- Dependencies: 295
-- Name: familia_sistema_aguas_residuales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.familia_sistema_aguas_residuales_id_seq', 31, true);


--
-- TOC entry 4060 (class 0 OID 0)
-- Dependencies: 251
-- Name: familia_tipo_viviendas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.familia_tipo_viviendas_id_seq', 1, false);


--
-- TOC entry 4061 (class 0 OID 0)
-- Dependencies: 270
-- Name: familias_id_familia_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.familias_id_familia_seq', 6, true);


--
-- TOC entry 4062 (class 0 OID 0)
-- Dependencies: 260
-- Name: municipios_id_municipio_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.municipios_id_municipio_seq', 1, false);


--
-- TOC entry 4063 (class 0 OID 0)
-- Dependencies: 289
-- Name: niveles_educativos_id_niveles_educativos_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.niveles_educativos_id_niveles_educativos_seq', 9, true);


--
-- TOC entry 4064 (class 0 OID 0)
-- Dependencies: 285
-- Name: parentescos_id_parentesco_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.parentescos_id_parentesco_seq', 1, true);


--
-- TOC entry 4065 (class 0 OID 0)
-- Dependencies: 262
-- Name: parroquia_id_parroquia_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.parroquia_id_parroquia_seq', 1, true);


--
-- TOC entry 4066 (class 0 OID 0)
-- Dependencies: 241
-- Name: parroquias_id_parroquia_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.parroquias_id_parroquia_seq', 1, false);


--
-- TOC entry 4067 (class 0 OID 0)
-- Dependencies: 281
-- Name: personas_id_personas_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personas_id_personas_seq', 34, true);


--
-- TOC entry 4068 (class 0 OID 0)
-- Dependencies: 299
-- Name: profesiones_id_profesion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.profesiones_id_profesion_seq', 2, true);


--
-- TOC entry 4069 (class 0 OID 0)
-- Dependencies: 231
-- Name: sector_id_sector_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sector_id_sector_seq', 1, false);


--
-- TOC entry 4070 (class 0 OID 0)
-- Dependencies: 266
-- Name: sectores_id_sector_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sectores_id_sector_seq', 1, false);


--
-- TOC entry 4071 (class 0 OID 0)
-- Dependencies: 233
-- Name: sexo_id_sexo_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sexo_id_sexo_seq', 1, false);


--
-- TOC entry 4072 (class 0 OID 0)
-- Dependencies: 264
-- Name: sexos_id_sexo_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sexos_id_sexo_seq', 1, true);


--
-- TOC entry 4073 (class 0 OID 0)
-- Dependencies: 223
-- Name: sistemas_acueducto_id_sistema_acueducto_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sistemas_acueducto_id_sistema_acueducto_seq', 30, true);


--
-- TOC entry 4074 (class 0 OID 0)
-- Dependencies: 243
-- Name: sistemas_acueductos_id_sistema_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sistemas_acueductos_id_sistema_seq', 6, true);


--
-- TOC entry 4075 (class 0 OID 0)
-- Dependencies: 287
-- Name: situaciones_civiles_id_situacion_civil_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.situaciones_civiles_id_situacion_civil_seq', 1, true);


--
-- TOC entry 4076 (class 0 OID 0)
-- Dependencies: 291
-- Name: tallas_id_talla_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tallas_id_talla_seq', 1, false);


--
-- TOC entry 4077 (class 0 OID 0)
-- Dependencies: 235
-- Name: tipo_identificacion_id_tipo_identificacion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipo_identificacion_id_tipo_identificacion_seq', 1, false);


--
-- TOC entry 4078 (class 0 OID 0)
-- Dependencies: 274
-- Name: tipos_aguas_residuales_id_tipo_aguas_residuales_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipos_aguas_residuales_id_tipo_aguas_residuales_seq', 5, true);


--
-- TOC entry 4079 (class 0 OID 0)
-- Dependencies: 272
-- Name: tipos_disposicion_basura_id_tipo_disposicion_basura_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipos_disposicion_basura_id_tipo_disposicion_basura_seq', 8, true);


--
-- TOC entry 4080 (class 0 OID 0)
-- Dependencies: 256
-- Name: tipos_identificacion_id_tipo_identificacion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipos_identificacion_id_tipo_identificacion_seq', 1, true);


--
-- TOC entry 4081 (class 0 OID 0)
-- Dependencies: 276
-- Name: tipos_vivienda_id_tipo_vivienda_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipos_vivienda_id_tipo_vivienda_seq', 6, true);


--
-- TOC entry 4082 (class 0 OID 0)
-- Dependencies: 245
-- Name: tipos_viviendas_id_tipo_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipos_viviendas_id_tipo_seq', 6, true);


--
-- TOC entry 4083 (class 0 OID 0)
-- Dependencies: 268
-- Name: veredas_id_vereda_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.veredas_id_vereda_seq', 1, false);


--
-- TOC entry 3574 (class 2606 OID 16389)
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- TOC entry 3682 (class 2606 OID 67080)
-- Name: comunidades_culturales comunidades_culturales_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comunidades_culturales
    ADD CONSTRAINT comunidades_culturales_nombre_key UNIQUE (nombre);


--
-- TOC entry 3684 (class 2606 OID 67078)
-- Name: comunidades_culturales comunidades_culturales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comunidades_culturales
    ADD CONSTRAINT comunidades_culturales_pkey PRIMARY KEY (id_comunidad_cultural);


--
-- TOC entry 3638 (class 2606 OID 66938)
-- Name: departamentos departamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departamentos
    ADD CONSTRAINT departamentos_pkey PRIMARY KEY (id_departamento);


--
-- TOC entry 3735 (class 2606 OID 67245)
-- Name: destrezas destrezas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.destrezas
    ADD CONSTRAINT destrezas_pkey PRIMARY KEY (id_destreza);


--
-- TOC entry 3686 (class 2606 OID 67090)
-- Name: difuntos_familia difuntos_familia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.difuntos_familia
    ADD CONSTRAINT difuntos_familia_pkey PRIMARY KEY (id_difunto);


--
-- TOC entry 3586 (class 2606 OID 16619)
-- Name: encuestas encuestas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encuestas
    ADD CONSTRAINT encuestas_pkey PRIMARY KEY (id_encuesta);


--
-- TOC entry 3701 (class 2606 OID 67144)
-- Name: enfermedades enfermedades_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enfermedades
    ADD CONSTRAINT enfermedades_nombre_key UNIQUE (nombre);


--
-- TOC entry 3703 (class 2606 OID 67142)
-- Name: enfermedades enfermedades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enfermedades
    ADD CONSTRAINT enfermedades_pkey PRIMARY KEY (id_enfermedad);


--
-- TOC entry 3618 (class 2606 OID 66750)
-- Name: estados_civiles estados_civiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estados_civiles
    ADD CONSTRAINT estados_civiles_pkey PRIMARY KEY (id_estado);


--
-- TOC entry 3610 (class 2606 OID 66667)
-- Name: familia_aguas_residuales familia_aguas_residuales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_aguas_residuales
    ADD CONSTRAINT familia_aguas_residuales_pkey PRIMARY KEY (id);


--
-- TOC entry 3731 (class 2606 OID 67211)
-- Name: familia_disposicion_basura familia_disposicion_basura_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_disposicion_basura
    ADD CONSTRAINT familia_disposicion_basura_pkey PRIMARY KEY (id);


--
-- TOC entry 3608 (class 2606 OID 66658)
-- Name: familia_disposicion_basuras familia_disposicion_basuras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_disposicion_basuras
    ADD CONSTRAINT familia_disposicion_basuras_pkey PRIMARY KEY (id);


--
-- TOC entry 3620 (class 2606 OID 66788)
-- Name: familia_sistema_acueductos familia_sistema_acueductos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_sistema_acueductos
    ADD CONSTRAINT familia_sistema_acueductos_pkey PRIMARY KEY (id);


--
-- TOC entry 3733 (class 2606 OID 67228)
-- Name: familia_sistema_aguas_residuales familia_sistema_aguas_residuales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_sistema_aguas_residuales
    ADD CONSTRAINT familia_sistema_aguas_residuales_pkey PRIMARY KEY (id);


--
-- TOC entry 3622 (class 2606 OID 66795)
-- Name: familia_tipo_viviendas familia_tipo_viviendas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_tipo_viviendas
    ADD CONSTRAINT familia_tipo_viviendas_pkey PRIMARY KEY (id);


--
-- TOC entry 3665 (class 2606 OID 67019)
-- Name: familias familias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familias
    ADD CONSTRAINT familias_pkey PRIMARY KEY (id_familia);


--
-- TOC entry 3643 (class 2606 OID 66945)
-- Name: municipios municipios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.municipios
    ADD CONSTRAINT municipios_pkey PRIMARY KEY (id_municipio);


--
-- TOC entry 3724 (class 2606 OID 67189)
-- Name: niveles_educativos niveles_educativos_nivel_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.niveles_educativos
    ADD CONSTRAINT niveles_educativos_nivel_key UNIQUE (nivel);


--
-- TOC entry 3727 (class 2606 OID 67187)
-- Name: niveles_educativos niveles_educativos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.niveles_educativos
    ADD CONSTRAINT niveles_educativos_pkey PRIMARY KEY (id_niveles_educativos);


--
-- TOC entry 3707 (class 2606 OID 67156)
-- Name: parentescos parentescos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parentescos
    ADD CONSTRAINT parentescos_nombre_key UNIQUE (nombre);


--
-- TOC entry 3709 (class 2606 OID 67154)
-- Name: parentescos parentescos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parentescos
    ADD CONSTRAINT parentescos_pkey PRIMARY KEY (id_parentesco);


--
-- TOC entry 3647 (class 2606 OID 66960)
-- Name: parroquia parroquia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parroquia
    ADD CONSTRAINT parroquia_pkey PRIMARY KEY (id_parroquia);


--
-- TOC entry 3612 (class 2606 OID 66695)
-- Name: parroquias parroquias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parroquias
    ADD CONSTRAINT parroquias_pkey PRIMARY KEY (id_parroquia);


--
-- TOC entry 3743 (class 2606 OID 67263)
-- Name: persona_destreza persona_destreza_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.persona_destreza
    ADD CONSTRAINT persona_destreza_pkey PRIMARY KEY (id_destrezas_destrezas, id_personas_personas);


--
-- TOC entry 3697 (class 2606 OID 67108)
-- Name: personas personas_identificacion_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_identificacion_key UNIQUE (identificacion);


--
-- TOC entry 3699 (class 2606 OID 67106)
-- Name: personas personas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_pkey PRIMARY KEY (id_personas);


--
-- TOC entry 3739 (class 2606 OID 67257)
-- Name: profesiones profesiones_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesiones
    ADD CONSTRAINT profesiones_nombre_key UNIQUE (nombre);


--
-- TOC entry 3741 (class 2606 OID 67255)
-- Name: profesiones profesiones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesiones
    ADD CONSTRAINT profesiones_pkey PRIMARY KEY (id_profesion);


--
-- TOC entry 3630 (class 2606 OID 66905)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3600 (class 2606 OID 66632)
-- Name: sector sector_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sector
    ADD CONSTRAINT sector_pkey PRIMARY KEY (id_sector);


--
-- TOC entry 3655 (class 2606 OID 66987)
-- Name: sectores sectores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sectores
    ADD CONSTRAINT sectores_pkey PRIMARY KEY (id_sector);


--
-- TOC entry 3602 (class 2606 OID 66639)
-- Name: sexo sexo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sexo
    ADD CONSTRAINT sexo_pkey PRIMARY KEY (id_sexo);


--
-- TOC entry 3649 (class 2606 OID 66980)
-- Name: sexos sexos_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sexos
    ADD CONSTRAINT sexos_codigo_key UNIQUE (codigo);


--
-- TOC entry 3651 (class 2606 OID 66978)
-- Name: sexos sexos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sexos
    ADD CONSTRAINT sexos_nombre_key UNIQUE (nombre);


--
-- TOC entry 3653 (class 2606 OID 66976)
-- Name: sexos sexos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sexos
    ADD CONSTRAINT sexos_pkey PRIMARY KEY (id_sexo);


--
-- TOC entry 3577 (class 2606 OID 41847)
-- Name: sistemas_acueducto sistemas_acueducto_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sistemas_acueducto
    ADD CONSTRAINT sistemas_acueducto_nombre_key UNIQUE (nombre);


--
-- TOC entry 3579 (class 2606 OID 16515)
-- Name: sistemas_acueducto sistemas_acueducto_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sistemas_acueducto
    ADD CONSTRAINT sistemas_acueducto_pkey PRIMARY KEY (id_sistema_acueducto);


--
-- TOC entry 3614 (class 2606 OID 66734)
-- Name: sistemas_acueductos sistemas_acueductos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sistemas_acueductos
    ADD CONSTRAINT sistemas_acueductos_pkey PRIMARY KEY (id_sistema);


--
-- TOC entry 3713 (class 2606 OID 67173)
-- Name: situaciones_civiles situaciones_civiles_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.situaciones_civiles
    ADD CONSTRAINT situaciones_civiles_codigo_key UNIQUE (codigo);


--
-- TOC entry 3716 (class 2606 OID 67171)
-- Name: situaciones_civiles situaciones_civiles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.situaciones_civiles
    ADD CONSTRAINT situaciones_civiles_nombre_key UNIQUE (nombre);


--
-- TOC entry 3719 (class 2606 OID 67169)
-- Name: situaciones_civiles situaciones_civiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.situaciones_civiles
    ADD CONSTRAINT situaciones_civiles_pkey PRIMARY KEY (id_situacion_civil);


--
-- TOC entry 3729 (class 2606 OID 67204)
-- Name: tallas tallas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tallas
    ADD CONSTRAINT tallas_pkey PRIMARY KEY (id_talla);


--
-- TOC entry 3604 (class 2606 OID 66648)
-- Name: tipo_identificacion tipo_identificacion_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_identificacion
    ADD CONSTRAINT tipo_identificacion_codigo_key UNIQUE (codigo);


--
-- TOC entry 3606 (class 2606 OID 66646)
-- Name: tipo_identificacion tipo_identificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_identificacion
    ADD CONSTRAINT tipo_identificacion_pkey PRIMARY KEY (id_tipo_identificacion);


--
-- TOC entry 3674 (class 2606 OID 67057)
-- Name: tipos_aguas_residuales tipos_aguas_residuales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_aguas_residuales
    ADD CONSTRAINT tipos_aguas_residuales_pkey PRIMARY KEY (id_tipo_aguas_residuales);


--
-- TOC entry 3672 (class 2606 OID 67047)
-- Name: tipos_disposicion_basura tipos_disposicion_basura_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_disposicion_basura
    ADD CONSTRAINT tipos_disposicion_basura_pkey PRIMARY KEY (id_tipo_disposicion_basura);


--
-- TOC entry 3634 (class 2606 OID 66931)
-- Name: tipos_identificacion tipos_identificacion_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_identificacion
    ADD CONSTRAINT tipos_identificacion_codigo_key UNIQUE (codigo);


--
-- TOC entry 3636 (class 2606 OID 66929)
-- Name: tipos_identificacion tipos_identificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_identificacion
    ADD CONSTRAINT tipos_identificacion_pkey PRIMARY KEY (id_tipo_identificacion);


--
-- TOC entry 3677 (class 2606 OID 67067)
-- Name: tipos_vivienda tipos_vivienda_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_vivienda
    ADD CONSTRAINT tipos_vivienda_pkey PRIMARY KEY (id_tipo_vivienda);


--
-- TOC entry 3616 (class 2606 OID 66742)
-- Name: tipos_viviendas tipos_viviendas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_viviendas
    ADD CONSTRAINT tipos_viviendas_pkey PRIMARY KEY (id_tipo);


--
-- TOC entry 3624 (class 2606 OID 66898)
-- Name: usuarios usuarios_correo_electronico_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_electronico_key UNIQUE (correo_electronico);


--
-- TOC entry 3626 (class 2606 OID 66900)
-- Name: usuarios usuarios_numero_documento_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_numero_documento_key UNIQUE (numero_documento);


--
-- TOC entry 3628 (class 2606 OID 66896)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 3632 (class 2606 OID 66910)
-- Name: usuarios_roles usuarios_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_roles
    ADD CONSTRAINT usuarios_roles_pkey PRIMARY KEY (id_usuarios, id_roles);


--
-- TOC entry 3657 (class 2606 OID 67001)
-- Name: veredas veredas_codigo_vereda_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.veredas
    ADD CONSTRAINT veredas_codigo_vereda_key UNIQUE (codigo_vereda);


--
-- TOC entry 3659 (class 2606 OID 66999)
-- Name: veredas veredas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.veredas
    ADD CONSTRAINT veredas_pkey PRIMARY KEY (id_vereda);


--
-- TOC entry 3678 (class 1259 OID 67082)
-- Name: comunidades_culturales_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comunidades_culturales_activo ON public.comunidades_culturales USING btree (activo);


--
-- TOC entry 3679 (class 1259 OID 67083)
-- Name: comunidades_culturales_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comunidades_culturales_created_at ON public.comunidades_culturales USING btree ("createdAt");


--
-- TOC entry 3680 (class 1259 OID 67081)
-- Name: comunidades_culturales_nombre; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX comunidades_culturales_nombre ON public.comunidades_culturales USING btree (nombre);


--
-- TOC entry 3580 (class 1259 OID 41811)
-- Name: encuestas_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX encuestas_fecha ON public.encuestas USING btree (fecha);


--
-- TOC entry 3581 (class 1259 OID 41812)
-- Name: encuestas_fecha_id_parroquia; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX encuestas_fecha_id_parroquia ON public.encuestas USING btree (fecha, id_parroquia);


--
-- TOC entry 3582 (class 1259 OID 16641)
-- Name: encuestas_id_municipio_id_sector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX encuestas_id_municipio_id_sector ON public.encuestas USING btree (id_municipio, id_sector);


--
-- TOC entry 3583 (class 1259 OID 16643)
-- Name: encuestas_id_parroquia; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX encuestas_id_parroquia ON public.encuestas USING btree (id_parroquia);


--
-- TOC entry 3584 (class 1259 OID 41818)
-- Name: encuestas_id_vereda; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX encuestas_id_vereda ON public.encuestas USING btree (id_vereda);


--
-- TOC entry 3595 (class 1259 OID 16746)
-- Name: familia_sistema_acueducto_id_familia; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX familia_sistema_acueducto_id_familia ON public.familia_sistema_acueducto USING btree (id_familia);


--
-- TOC entry 3596 (class 1259 OID 16745)
-- Name: familia_sistema_acueducto_id_familia_id_sistema_acueducto; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX familia_sistema_acueducto_id_familia_id_sistema_acueducto ON public.familia_sistema_acueducto USING btree (id_familia, id_sistema_acueducto);


--
-- TOC entry 3597 (class 1259 OID 16747)
-- Name: familia_sistema_acueducto_id_sistema_acueducto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX familia_sistema_acueducto_id_sistema_acueducto ON public.familia_sistema_acueducto USING btree (id_sistema_acueducto);


--
-- TOC entry 3591 (class 1259 OID 16724)
-- Name: familia_tipo_vivienda_id_familia; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX familia_tipo_vivienda_id_familia ON public.familia_tipo_vivienda USING btree (id_familia);


--
-- TOC entry 3592 (class 1259 OID 16723)
-- Name: familia_tipo_vivienda_id_familia_id_tipo_vivienda; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX familia_tipo_vivienda_id_familia_id_tipo_vivienda ON public.familia_tipo_vivienda USING btree (id_familia, id_tipo_vivienda);


--
-- TOC entry 3593 (class 1259 OID 16725)
-- Name: familia_tipo_vivienda_id_tipo_vivienda; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX familia_tipo_vivienda_id_tipo_vivienda ON public.familia_tipo_vivienda USING btree (id_tipo_vivienda);


--
-- TOC entry 3660 (class 1259 OID 67038)
-- Name: familias_estado_encuesta; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX familias_estado_encuesta ON public.familias USING btree (estado_encuesta);


--
-- TOC entry 3661 (class 1259 OID 67035)
-- Name: familias_id_municipio; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX familias_id_municipio ON public.familias USING btree (id_municipio);


--
-- TOC entry 3662 (class 1259 OID 67037)
-- Name: familias_id_sector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX familias_id_sector ON public.familias USING btree (id_sector);


--
-- TOC entry 3663 (class 1259 OID 67036)
-- Name: familias_id_vereda; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX familias_id_vereda ON public.familias USING btree (id_vereda);


--
-- TOC entry 3736 (class 1259 OID 67246)
-- Name: idx_destrezas_nombre_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_destrezas_nombre_unique ON public.destrezas USING btree (nombre);


--
-- TOC entry 3687 (class 1259 OID 67096)
-- Name: idx_difuntos_familia_familia; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_difuntos_familia_familia ON public.difuntos_familia USING btree (id_familia_familias);


--
-- TOC entry 3688 (class 1259 OID 67097)
-- Name: idx_difuntos_fecha_fallecimiento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_difuntos_fecha_fallecimiento ON public.difuntos_familia USING btree (fecha_fallecimiento);


--
-- TOC entry 3666 (class 1259 OID 67324)
-- Name: idx_familias_autorizacion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_familias_autorizacion ON public.familias USING btree (autorizacion_datos);


--
-- TOC entry 3667 (class 1259 OID 67323)
-- Name: idx_familias_fecha_encuesta; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_familias_fecha_encuesta ON public.familias USING btree (fecha_encuesta);


--
-- TOC entry 3668 (class 1259 OID 67321)
-- Name: idx_familias_parroquia; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_familias_parroquia ON public.familias USING btree (id_parroquia);


--
-- TOC entry 3669 (class 1259 OID 67322)
-- Name: idx_familias_tipo_vivienda; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_familias_tipo_vivienda ON public.familias USING btree (id_tipo_vivienda);


--
-- TOC entry 3639 (class 1259 OID 66953)
-- Name: idx_municipios_departamento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_municipios_departamento ON public.municipios USING btree (id_departamento);


--
-- TOC entry 3640 (class 1259 OID 66952)
-- Name: idx_municipios_nombre; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_municipios_nombre ON public.municipios USING btree (nombre_municipio);


--
-- TOC entry 3704 (class 1259 OID 67158)
-- Name: idx_parentesco_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parentesco_activo ON public.parentescos USING btree (activo);


--
-- TOC entry 3705 (class 1259 OID 67157)
-- Name: idx_parentesco_nombre; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parentesco_nombre ON public.parentescos USING btree (nombre);


--
-- TOC entry 3644 (class 1259 OID 66966)
-- Name: idx_parroquia_municipio; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parroquia_municipio ON public.parroquia USING btree (id_municipio);


--
-- TOC entry 3645 (class 1259 OID 66967)
-- Name: idx_parroquia_nombre; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parroquia_nombre ON public.parroquia USING btree (nombre);


--
-- TOC entry 3689 (class 1259 OID 67299)
-- Name: idx_personas_celebracion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personas_celebracion ON public.personas USING btree (mes_celebrar, dia_celebrar);


--
-- TOC entry 3690 (class 1259 OID 67297)
-- Name: idx_personas_comunidad_cultural; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personas_comunidad_cultural ON public.personas USING btree (id_comunidad_cultural);


--
-- TOC entry 3691 (class 1259 OID 67298)
-- Name: idx_personas_nivel_educativo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personas_nivel_educativo ON public.personas USING btree (id_nivel_educativo);


--
-- TOC entry 3692 (class 1259 OID 67296)
-- Name: idx_personas_parentesco; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personas_parentesco ON public.personas USING btree (id_parentesco);


--
-- TOC entry 3641 (class 1259 OID 66951)
-- Name: municipios_codigo_dane_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX municipios_codigo_dane_unique ON public.municipios USING btree (codigo_dane);


--
-- TOC entry 3720 (class 1259 OID 67191)
-- Name: niveles_educativos_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX niveles_educativos_activo ON public.niveles_educativos USING btree (activo);


--
-- TOC entry 3721 (class 1259 OID 67193)
-- Name: niveles_educativos_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX niveles_educativos_created_at ON public.niveles_educativos USING btree ("createdAt");


--
-- TOC entry 3722 (class 1259 OID 67190)
-- Name: niveles_educativos_nivel; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX niveles_educativos_nivel ON public.niveles_educativos USING btree (nivel) WHERE ("deletedAt" IS NULL);


--
-- TOC entry 3725 (class 1259 OID 67192)
-- Name: niveles_educativos_orden_nivel; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX niveles_educativos_orden_nivel ON public.niveles_educativos USING btree (orden_nivel);


--
-- TOC entry 3587 (class 1259 OID 16668)
-- Name: persona_enfermedad_id_enfermedad; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX persona_enfermedad_id_enfermedad ON public.persona_enfermedad USING btree (id_enfermedad);


--
-- TOC entry 3588 (class 1259 OID 16667)
-- Name: persona_enfermedad_id_persona; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX persona_enfermedad_id_persona ON public.persona_enfermedad USING btree (id_persona);


--
-- TOC entry 3589 (class 1259 OID 16666)
-- Name: persona_enfermedad_id_persona_id_enfermedad; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX persona_enfermedad_id_persona_id_enfermedad ON public.persona_enfermedad USING btree (id_persona, id_enfermedad);


--
-- TOC entry 3693 (class 1259 OID 67131)
-- Name: personas_id_familia_familias; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personas_id_familia_familias ON public.personas USING btree (id_familia_familias);


--
-- TOC entry 3694 (class 1259 OID 67132)
-- Name: personas_id_sexo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personas_id_sexo ON public.personas USING btree (id_sexo);


--
-- TOC entry 3695 (class 1259 OID 67133)
-- Name: personas_identificacion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personas_identificacion ON public.personas USING btree (identificacion);


--
-- TOC entry 3737 (class 1259 OID 67258)
-- Name: profesiones_nombre; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX profesiones_nombre ON public.profesiones USING btree (nombre);


--
-- TOC entry 3575 (class 1259 OID 41848)
-- Name: sistemas_acueducto_nombre; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sistemas_acueducto_nombre ON public.sistemas_acueducto USING btree (nombre);


--
-- TOC entry 3710 (class 1259 OID 67176)
-- Name: situaciones_civiles_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX situaciones_civiles_activo ON public.situaciones_civiles USING btree (activo);


--
-- TOC entry 3711 (class 1259 OID 67175)
-- Name: situaciones_civiles_codigo; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX situaciones_civiles_codigo ON public.situaciones_civiles USING btree (codigo) WHERE (codigo IS NOT NULL);


--
-- TOC entry 3714 (class 1259 OID 67174)
-- Name: situaciones_civiles_nombre; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX situaciones_civiles_nombre ON public.situaciones_civiles USING btree (nombre);


--
-- TOC entry 3717 (class 1259 OID 67177)
-- Name: situaciones_civiles_orden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX situaciones_civiles_orden ON public.situaciones_civiles USING btree (orden);


--
-- TOC entry 3670 (class 1259 OID 67048)
-- Name: tipos_disposicion_basura_nombre; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tipos_disposicion_basura_nombre ON public.tipos_disposicion_basura USING btree (nombre);


--
-- TOC entry 3675 (class 1259 OID 67068)
-- Name: tipos_vivienda_nombre; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tipos_vivienda_nombre ON public.tipos_vivienda USING btree (nombre);


--
-- TOC entry 3598 (class 1259 OID 16987)
-- Name: unique_familia_sistema_acueducto; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_familia_sistema_acueducto ON public.familia_sistema_acueducto USING btree (id_familia, id_sistema_acueducto);


--
-- TOC entry 3594 (class 1259 OID 17129)
-- Name: unique_familia_tipo_vivienda; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_familia_tipo_vivienda ON public.familia_tipo_vivienda USING btree (id_familia, id_tipo_vivienda);


--
-- TOC entry 3590 (class 1259 OID 17127)
-- Name: unique_persona_enfermedad; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_persona_enfermedad ON public.persona_enfermedad USING btree (id_persona, id_enfermedad);


--
-- TOC entry 3756 (class 2606 OID 67091)
-- Name: difuntos_familia difuntos_familia_id_familia_familias_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.difuntos_familia
    ADD CONSTRAINT difuntos_familia_id_familia_familias_fkey FOREIGN KEY (id_familia_familias) REFERENCES public.familias(id_familia) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3766 (class 2606 OID 67212)
-- Name: familia_disposicion_basura familia_disposicion_basura_id_familia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_disposicion_basura
    ADD CONSTRAINT familia_disposicion_basura_id_familia_fkey FOREIGN KEY (id_familia) REFERENCES public.familias(id_familia) ON UPDATE CASCADE;


--
-- TOC entry 3767 (class 2606 OID 67217)
-- Name: familia_disposicion_basura familia_disposicion_basura_id_tipo_disposicion_basura_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_disposicion_basura
    ADD CONSTRAINT familia_disposicion_basura_id_tipo_disposicion_basura_fkey FOREIGN KEY (id_tipo_disposicion_basura) REFERENCES public.tipos_disposicion_basura(id_tipo_disposicion_basura) ON UPDATE CASCADE;


--
-- TOC entry 3744 (class 2606 OID 41854)
-- Name: familia_sistema_acueducto familia_sistema_acueducto_id_sistema_acueducto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_sistema_acueducto
    ADD CONSTRAINT familia_sistema_acueducto_id_sistema_acueducto_fkey FOREIGN KEY (id_sistema_acueducto) REFERENCES public.sistemas_acueducto(id_sistema_acueducto) ON UPDATE CASCADE;


--
-- TOC entry 3768 (class 2606 OID 67229)
-- Name: familia_sistema_aguas_residuales familia_sistema_aguas_residuales_id_familia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_sistema_aguas_residuales
    ADD CONSTRAINT familia_sistema_aguas_residuales_id_familia_fkey FOREIGN KEY (id_familia) REFERENCES public.familias(id_familia) ON UPDATE CASCADE;


--
-- TOC entry 3769 (class 2606 OID 67234)
-- Name: familia_sistema_aguas_residuales familia_sistema_aguas_residuales_id_tipo_aguas_residuales_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familia_sistema_aguas_residuales
    ADD CONSTRAINT familia_sistema_aguas_residuales_id_tipo_aguas_residuales_fkey FOREIGN KEY (id_tipo_aguas_residuales) REFERENCES public.tipos_aguas_residuales(id_tipo_aguas_residuales) ON UPDATE CASCADE;


--
-- TOC entry 3751 (class 2606 OID 67020)
-- Name: familias familias_id_municipio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familias
    ADD CONSTRAINT familias_id_municipio_fkey FOREIGN KEY (id_municipio) REFERENCES public.municipios(id_municipio) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3752 (class 2606 OID 67030)
-- Name: familias familias_id_sector_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familias
    ADD CONSTRAINT familias_id_sector_fkey FOREIGN KEY (id_sector) REFERENCES public.sectores(id_sector) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3753 (class 2606 OID 67025)
-- Name: familias familias_id_vereda_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familias
    ADD CONSTRAINT familias_id_vereda_fkey FOREIGN KEY (id_vereda) REFERENCES public.veredas(id_vereda) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3757 (class 2606 OID 67330)
-- Name: difuntos_familia fk_difuntos_familia_parentesco; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.difuntos_familia
    ADD CONSTRAINT fk_difuntos_familia_parentesco FOREIGN KEY (id_parentesco) REFERENCES public.parentescos(id_parentesco);


--
-- TOC entry 3758 (class 2606 OID 67325)
-- Name: difuntos_familia fk_difuntos_familia_sexo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.difuntos_familia
    ADD CONSTRAINT fk_difuntos_familia_sexo FOREIGN KEY (id_sexo) REFERENCES public.sexos(id_sexo);


--
-- TOC entry 3754 (class 2606 OID 67311)
-- Name: familias fk_familias_parroquia; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familias
    ADD CONSTRAINT fk_familias_parroquia FOREIGN KEY (id_parroquia) REFERENCES public.parroquias(id_parroquia);


--
-- TOC entry 3755 (class 2606 OID 67316)
-- Name: familias fk_familias_tipo_vivienda; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familias
    ADD CONSTRAINT fk_familias_tipo_vivienda FOREIGN KEY (id_tipo_vivienda) REFERENCES public.tipos_viviendas(id_tipo);


--
-- TOC entry 3759 (class 2606 OID 67286)
-- Name: personas fk_personas_comunidad_cultural; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT fk_personas_comunidad_cultural FOREIGN KEY (id_comunidad_cultural) REFERENCES public.comunidades_culturales(id_comunidad_cultural);


--
-- TOC entry 3760 (class 2606 OID 67291)
-- Name: personas fk_personas_nivel_educativo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT fk_personas_nivel_educativo FOREIGN KEY (id_nivel_educativo) REFERENCES public.niveles_educativos(id_niveles_educativos);


--
-- TOC entry 3761 (class 2606 OID 67281)
-- Name: personas fk_personas_parentesco; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT fk_personas_parentesco FOREIGN KEY (id_parentesco) REFERENCES public.parentescos(id_parentesco);


--
-- TOC entry 3747 (class 2606 OID 66946)
-- Name: municipios municipios_id_departamento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.municipios
    ADD CONSTRAINT municipios_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES public.departamentos(id_departamento) ON UPDATE CASCADE;


--
-- TOC entry 3748 (class 2606 OID 66961)
-- Name: parroquia parroquia_id_municipio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parroquia
    ADD CONSTRAINT parroquia_id_municipio_fkey FOREIGN KEY (id_municipio) REFERENCES public.municipios(id_municipio) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3770 (class 2606 OID 67264)
-- Name: persona_destreza persona_destreza_id_destrezas_destrezas_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.persona_destreza
    ADD CONSTRAINT persona_destreza_id_destrezas_destrezas_fkey FOREIGN KEY (id_destrezas_destrezas) REFERENCES public.destrezas(id_destreza) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3771 (class 2606 OID 67269)
-- Name: persona_destreza persona_destreza_id_personas_personas_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.persona_destreza
    ADD CONSTRAINT persona_destreza_id_personas_personas_fkey FOREIGN KEY (id_personas_personas) REFERENCES public.personas(id_personas) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3762 (class 2606 OID 67116)
-- Name: personas personas_id_familia_familias_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_id_familia_familias_fkey FOREIGN KEY (id_familia_familias) REFERENCES public.familias(id_familia) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3763 (class 2606 OID 67126)
-- Name: personas personas_id_parroquia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_id_parroquia_fkey FOREIGN KEY (id_parroquia) REFERENCES public.parroquia(id_parroquia) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3764 (class 2606 OID 67121)
-- Name: personas personas_id_sexo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_id_sexo_fkey FOREIGN KEY (id_sexo) REFERENCES public.sexos(id_sexo) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3765 (class 2606 OID 67111)
-- Name: personas personas_id_tipo_identificacion_tipo_identificacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_id_tipo_identificacion_tipo_identificacion_fkey FOREIGN KEY (id_tipo_identificacion_tipo_identificacion) REFERENCES public.tipos_identificacion(id_tipo_identificacion) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3749 (class 2606 OID 66988)
-- Name: sectores sectores_id_municipio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sectores
    ADD CONSTRAINT sectores_id_municipio_fkey FOREIGN KEY (id_municipio) REFERENCES public.municipios(id_municipio) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3745 (class 2606 OID 66916)
-- Name: usuarios_roles usuarios_roles_id_roles_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_roles
    ADD CONSTRAINT usuarios_roles_id_roles_fkey FOREIGN KEY (id_roles) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3746 (class 2606 OID 66911)
-- Name: usuarios_roles usuarios_roles_id_usuarios_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_roles
    ADD CONSTRAINT usuarios_roles_id_usuarios_fkey FOREIGN KEY (id_usuarios) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3750 (class 2606 OID 67002)
-- Name: veredas veredas_id_municipio_municipios_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.veredas
    ADD CONSTRAINT veredas_id_municipio_municipios_fkey FOREIGN KEY (id_municipio_municipios) REFERENCES public.municipios(id_municipio) ON UPDATE CASCADE ON DELETE SET NULL;


-- Completed on 2025-09-05 22:25:42

--
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.3

-- Started on 2025-09-05 22:25:42

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Completed on 2025-09-05 22:25:42

--
-- PostgreSQL database dump complete
--

-- Completed on 2025-09-05 22:25:42

--
-- PostgreSQL database cluster dump complete
--


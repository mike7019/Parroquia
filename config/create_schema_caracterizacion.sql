
-- =============================================
-- Script de creación de la base de datos
-- Basado en el modelo entidad-relación proporcionado
-- =============================================

CREATE TABLE tipo_identificacion (
    id_tipo_identificacion BIGINT PRIMARY KEY,
    descripcion VARCHAR(25),
    tipo_identificacion_pk VARCHAR(25) UNIQUE
);

CREATE TABLE estado_civil (
    id_estado_civil BIGINT PRIMARY KEY,
    descripcion VARCHAR(15)
);

CREATE TABLE parroquia (
    id_parroquia BIGINT PRIMARY KEY,
    nombre VARCHAR(255)
);

CREATE TABLE tipo_vivienda (
    id_tipo_vivienda BIGINT PRIMARY KEY,
    tipo_vivienda VARCHAR(31)
);

CREATE TABLE parentesco (
    id_parentesco BIGINT PRIMARY KEY,
    nombre VARCHAR(255)
);

CREATE TABLE sistemas_acueducto (
    id_sistemas_acueducto BIGINT PRIMARY KEY,
    proveedor VARCHAR(100),
    metodo_abastecimiento VARCHAR(100),
    descripcion TEXT
);

CREATE TABLE tipos_disposicion_basura (
    id_tipos_disposicion_basura BIGINT PRIMARY KEY,
    metodo VARCHAR(100)
);

CREATE TABLE tipos_aguas_residuales (
    id_tipos_aguas_residuales BIGINT PRIMARY KEY,
    metodo VARCHAR(100)
);

CREATE TABLE sexo (
    id_sexo BIGINT PRIMARY KEY,
    sexo VARCHAR(100)
);

CREATE TABLE personas (
    id uuid PRIMARY KEY,
    primer_nombre character varying(255),
    segundo_nombre character varying(255),
    primer_apellido character varying(255) NOT NULL,
    segundo_apellido character varying(255) NOT NULL,
    correo_electronico character varying(255) NOT NULL UNIQUE,
    contrasena character varying(255),
    activo boolean
    id_tipo_identificacion BIGINT REFERENCES tipo_identificacion(id_tipo_identificacion),
    id_estado_civil BIGINT REFERENCES estado_civil(id_estado_civil),
    id_parroquia BIGINT REFERENCES parroquia(id_parroquia),
    id_tipo_vivienda BIGINT REFERENCES tipo_vivienda(id_tipo_vivienda),
    id_sexo BIGINT REFERENCES sexo(id_sexo)
);

CREATE TABLE liderazgos (
    id_liderazgo BIGINT PRIMARY KEY,
    fecha_inicio DATE,
    fecha_fin DATE,
    activo BOOLEAN
);

CREATE TABLE areas_liderazgo (
    id_areas_liderazgo BIGINT PRIMARY KEY,
    nombre VARCHAR(255),
    descripcion TEXT
);

CREATE TABLE comunidades_culturales (
    id_comunidades_culturales BIGINT PRIMARY KEY,
    descripcion VARCHAR(255)
);

CREATE TABLE niveles_educativos (
    id_niveles_educativos BIGINT PRIMARY KEY,
    nivel VARCHAR(100)
);

CREATE TABLE talla_vestimenta (
    id_talla_vestimenta BIGINT PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE municipios (
    id_municipio BIGINT PRIMARY KEY,
    nombre VARCHAR(255)
);

CREATE TABLE veredas (
    id_vereda BIGINT PRIMARY KEY,
    nombre VARCHAR(255)
);

CREATE TABLE sector (
    id_sector BIGINT PRIMARY KEY,
    nombre VARCHAR(255)
);

CREATE TABLE destrezas (
    id_destrezas BIGINT PRIMARY KEY,
    nombre VARCHAR(255)
);

CREATE TABLE roles (
    id_rol BIGINT PRIMARY KEY,
    nombre_rol VARCHAR(255)
);

CREATE TABLE usuarios (
    id_usuario BIGINT PRIMARY KEY,
    primer_nombre VARCHAR(255),
    segundo_nombre VARCHAR(255),
    primer_apellido VARCHAR(255),
    segundo_apellido VARCHAR(255),
    correo_electronico VARCHAR(255) UNIQUE,
    contrasena VARCHAR(255)
);

CREATE TABLE familias (
    id_familia BIGINT PRIMARY KEY,
    codigo_familia VARCHAR(50),
    nombre_familia VARCHAR(255),
    direccion_familia VARCHAR(255),
    numero_contacto VARCHAR(20),
    tutor_responsable BOOLEAN,
    observaciones TEXT
);

CREATE TABLE difuntos_familia (
    id_difunto BIGINT PRIMARY KEY,
    nombre_completo VARCHAR(255),
    fecha_fallecimiento DATE,
    motivo TEXT
);

CREATE TABLE celebraciones_padre_madre (
    id_celebracion BIGINT PRIMARY KEY,
    fecha_celebracion DATE,
    nombre_evento VARCHAR(100)
);

CREATE TABLE celebraciones_personales (
    id_celebracion BIGINT PRIMARY KEY,
    profesion VARCHAR(255),
    motivo VARCHAR(255),
    fecha DATE
);

CREATE TABLE celebraciones_familia (
    id_celebracion BIGINT PRIMARY KEY,
    motivo VARCHAR(255),
    fecha DATE
);

CREATE TABLE necesidades_enfermo (
    id_necesidad BIGINT PRIMARY KEY,
    solicita_comunion BOOLEAN,
    otras_necesidades TEXT,
    fecha_registro TIMESTAMP
);

CREATE TABLE enfermedades (
    id_enfermedades SMALLINT PRIMARY KEY,
    nombre VARCHAR(255)
);

CREATE TABLE enfermedades_persona (
    id_enfermedades_persona BIGINT PRIMARY KEY
);

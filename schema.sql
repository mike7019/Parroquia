CREATE TABLE personas (
    id_personas bigserial PRIMARY KEY,
    primer_nombre              VARCHAR(255) NOT NULL,
    segundo_nombre             VARCHAR(255),
    primer_apellido            VARCHAR(255) NOT NULL,
    segundo_apellido           VARCHAR(255) NOT NULL,
    id_tipo_identificacion_tipo_identificacion bigint NOT NULL,
    identificacion             VARCHAR(255) NOT NULL UNIQUE,
    telefono                   VARCHAR(255),
    correo_electronico         VARCHAR(255) NOT NULL UNIQUE,
    fecha_nacimiento           date NOT NULL,
    sexo                       VARCHAR(255) NOT NULL,
    direccion                  VARCHAR(255) NOT NULL,
    id_familia_familias        bigint NOT NULL,
    id_estado_civil_estado_civil bigint NOT NULL,
    id_parroquia_parroquia     bigint NOT NULL,
    id_sexo_sexo               bigint NOT NULL,
    id_comunidades_culturales_comunidades_culturales bigint NOT NULL,
    CONSTRAINT personas_pk PRIMARY KEY (id_personas),
    CONSTRAINT personas_identificacion_unique UNIQUE (identificacion),
    CONSTRAINT personas_correo_electronico_unique UNIQUE (correo_electronico),
    CONSTRAINT personas_pk1 FOREIGN KEY (id_tipo_identificacion_tipo_identificacion) 
        REFERENCES tipo_identificacion (id_tipo_identificacion),
    CONSTRAINT personas_pk2 FOREIGN KEY (id_familia_familias)
        REFERENCES familias (id_familia),
    CONSTRAINT personas_pk3 FOREIGN KEY (id_estado_civil_estado_civil)
        REFERENCES estado_civil (id_estado_civil),
    CONSTRAINT personas_pk4 FOREIGN KEY (id_parroquia_parroquia)
        REFERENCES parroquia (id_parroquia),
    CONSTRAINT sexo_fk FOREIGN KEY (id_sexo_sexo)
        REFERENCES sexo (id_sexo),
    CONSTRAINT comunidades_culturales_fk FOREIGN KEY (id_comunidades_culturales_comunidades_culturales)
        REFERENCES comunidades_culturales (id_comunidades_culturales)
);

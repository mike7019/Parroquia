-- =============================================================
-- MIGRACIÓN: Módulo de Liderazgo
-- Crea las tablas tipos_liderazgo y persona_liderazgo
-- =============================================================

-- Tabla catálogo de tipos de liderazgo
CREATE TABLE IF NOT EXISTS tipos_liderazgo (
    id_tipo_liderazgo BIGSERIAL PRIMARY KEY,
    nombre            VARCHAR(255) NOT NULL UNIQUE,
    descripcion       TEXT,
    activo            BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt"       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt"       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tipos_liderazgo_nombre  ON tipos_liderazgo (nombre);
CREATE INDEX IF NOT EXISTS idx_tipos_liderazgo_activo  ON tipos_liderazgo (activo);

-- Tabla de relación persona ↔ tipo de liderazgo
CREATE TABLE IF NOT EXISTS persona_liderazgo (
    id_persona_liderazgo BIGSERIAL PRIMARY KEY,
    id_persona           BIGINT NOT NULL REFERENCES personas(id_personas) ON DELETE CASCADE,
    id_tipo_liderazgo    BIGINT NOT NULL REFERENCES tipos_liderazgo(id_tipo_liderazgo) ON DELETE CASCADE,
    descripcion          TEXT,
    activo               BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt"          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt"          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (id_persona, id_tipo_liderazgo)
);

CREATE INDEX IF NOT EXISTS idx_persona_liderazgo_persona ON persona_liderazgo (id_persona);
CREATE INDEX IF NOT EXISTS idx_persona_liderazgo_tipo    ON persona_liderazgo (id_tipo_liderazgo);
CREATE INDEX IF NOT EXISTS idx_persona_liderazgo_activo  ON persona_liderazgo (activo);

-- Datos iniciales del catálogo
INSERT INTO tipos_liderazgo (nombre, descripcion, activo) VALUES
    ('Comunitario',  'Liderazgo en actividades y organizaciones comunitarias', TRUE),
    ('Religioso',    'Liderazgo en grupos y actividades religiosas o pastorales', TRUE),
    ('Juvenil',      'Liderazgo en grupos y movimientos juveniles', TRUE),
    ('Deportivo',    'Liderazgo en actividades y equipos deportivos', TRUE),
    ('Cultural',     'Liderazgo en actividades artísticas y culturales', TRUE),
    ('Social',       'Liderazgo en organizaciones sociales y de voluntariado', TRUE),
    ('Educativo',    'Liderazgo en instituciones y procesos educativos', TRUE),
    ('Político',     'Liderazgo en organizaciones políticas o de participación ciudadana', TRUE),
    ('Empresarial',  'Liderazgo en iniciativas productivas y empresariales', TRUE),
    ('Ambiental',    'Liderazgo en procesos de conservación y medio ambiente', TRUE)
ON CONFLICT (nombre) DO NOTHING;

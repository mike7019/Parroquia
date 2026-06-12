-- =============================================================
-- MIGRACIÓN: Módulo de Necesidades del Enfermo
-- Crea las tablas tipos_necesidad_enfermo y persona_necesidad_enfermo
-- =============================================================

-- Tabla catálogo de tipos de necesidad del enfermo
CREATE TABLE IF NOT EXISTS tipos_necesidad_enfermo (
    id_tipo_necesidad_enfermo BIGSERIAL PRIMARY KEY,
    nombre                    VARCHAR(255) NOT NULL UNIQUE,
    descripcion               TEXT,
    activo                    BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt"               TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt"               TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tipos_necesidad_enfermo_nombre ON tipos_necesidad_enfermo (nombre);
CREATE INDEX IF NOT EXISTS idx_tipos_necesidad_enfermo_activo ON tipos_necesidad_enfermo (activo);

-- Tabla de relación persona ↔ tipo de necesidad del enfermo
CREATE TABLE IF NOT EXISTS persona_necesidad_enfermo (
    id_persona_necesidad_enfermo BIGSERIAL PRIMARY KEY,
    id_persona                   BIGINT NOT NULL REFERENCES personas(id_personas) ON DELETE CASCADE,
    id_tipo_necesidad_enfermo    BIGINT NOT NULL REFERENCES tipos_necesidad_enfermo(id_tipo_necesidad_enfermo) ON DELETE CASCADE,
    descripcion                  TEXT,
    activo                       BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt"                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt"                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (id_persona, id_tipo_necesidad_enfermo)
);

CREATE INDEX IF NOT EXISTS idx_persona_necesidad_enfermo_persona ON persona_necesidad_enfermo (id_persona);
CREATE INDEX IF NOT EXISTS idx_persona_necesidad_enfermo_tipo    ON persona_necesidad_enfermo (id_tipo_necesidad_enfermo);
CREATE INDEX IF NOT EXISTS idx_persona_necesidad_enfermo_activo  ON persona_necesidad_enfermo (activo);

-- Datos iniciales del catálogo
INSERT INTO tipos_necesidad_enfermo (nombre, descripcion, activo) VALUES
    ('Medicamentos',               'Necesidad de medicamentos para tratamiento médico continuo', TRUE),
    ('Transporte médico',          'Necesidad de transporte para asistir a citas y tratamientos médicos', TRUE),
    ('Cuidador domiciliario',      'Necesidad de una persona que brinde cuidado y asistencia en el hogar', TRUE),
    ('Terapia física',             'Necesidad de sesiones de fisioterapia o rehabilitación física', TRUE),
    ('Apoyo psicológico',          'Necesidad de acompañamiento y atención psicológica o emocional', TRUE),
    ('Alimentación especial',      'Necesidad de dieta especial o suplementos nutricionales por condición médica', TRUE),
    ('Equipo médico',              'Necesidad de equipos o dispositivos médicos para el cuidado en casa', TRUE),
    ('Apoyo espiritual',           'Necesidad de acompañamiento espiritual y pastoral en la enfermedad', TRUE),
    ('Visita médica domiciliaria', 'Necesidad de atención médica a domicilio por imposibilidad de desplazarse', TRUE),
    ('Gestión de citas médicas',   'Necesidad de apoyo para tramitar y gestionar citas con el sistema de salud', TRUE)
ON CONFLICT (nombre) DO NOTHING;

-- Script para añadir secuencias auto-increment y actualizaciones realizadas
-- Este script debe ejecutarse después de la creación inicial de tablas

-- Añadir timestamps a las tablas de catálogo existentes
DO $$
BEGIN
    -- Añadir timestamps a tabla sexo
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sexo' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.sexo 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Añadir timestamps a tabla sector  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sector' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.sector 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Añadir timestamps a tabla parroquia
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parroquia' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.parroquia 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Añadir timestamps a tabla veredas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'veredas' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.veredas 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Añadir timestamps a tabla municipios
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'municipios' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.municipios 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Añadir timestamps a tabla usuarios
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.usuarios 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Crear tabla departamentos si no existe
CREATE TABLE IF NOT EXISTS public.departamentos (
    id_departamento bigserial PRIMARY KEY,
    codigo_dane character varying(10) UNIQUE,
    nombre character varying(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.departamentos OWNER TO parroquia_user;

-- Añadir relación departamentos-municipios si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'municipios' 
        AND column_name = 'id_departamento'
    ) THEN
        ALTER TABLE public.municipios 
        ADD COLUMN id_departamento bigint,
        ADD COLUMN codigo_dane character varying(10);
        
        -- Añadir foreign key si la tabla departamentos existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'departamentos') THEN
            ALTER TABLE public.municipios 
            ADD CONSTRAINT fk_municipios_departamentos 
            FOREIGN KEY (id_departamento) REFERENCES public.departamentos(id_departamento);
        END IF;
    END IF;
END $$;

-- Crear secuencias auto-increment para todas las tablas de catálogo
DO $$
DECLARE
    max_id bigint;
BEGIN
    -- Secuencia para tabla sexo
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sexo') THEN
        SELECT COALESCE(MAX(id_sexo), 0) INTO max_id FROM public.sexo;
        
        -- Crear secuencia si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'sexo_id_sexo_seq') THEN
            EXECUTE format('CREATE SEQUENCE public.sexo_id_sexo_seq START WITH %s', max_id + 1);
            ALTER TABLE public.sexo ALTER COLUMN id_sexo SET DEFAULT nextval('public.sexo_id_sexo_seq');
            ALTER SEQUENCE public.sexo_id_sexo_seq OWNED BY public.sexo.id_sexo;
        END IF;
        
        -- Sincronizar secuencia con valor actual
        EXECUTE format('SELECT setval(''public.sexo_id_sexo_seq'', %s)', GREATEST(max_id, 1));
    END IF;

    -- Secuencia para tabla sector
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sector') THEN
        SELECT COALESCE(MAX(id_sector), 0) INTO max_id FROM public.sector;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'sector_id_sector_seq') THEN
            EXECUTE format('CREATE SEQUENCE public.sector_id_sector_seq START WITH %s', max_id + 1);
            ALTER TABLE public.sector ALTER COLUMN id_sector SET DEFAULT nextval('public.sector_id_sector_seq');
            ALTER SEQUENCE public.sector_id_sector_seq OWNED BY public.sector.id_sector;
        END IF;
        
        EXECUTE format('SELECT setval(''public.sector_id_sector_seq'', %s)', GREATEST(max_id, 1));
    END IF;

    -- Secuencia para tabla parroquia
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parroquia') THEN
        SELECT COALESCE(MAX(id_parroquia), 0) INTO max_id FROM public.parroquia;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'parroquia_id_parroquia_seq') THEN
            EXECUTE format('CREATE SEQUENCE public.parroquia_id_parroquia_seq START WITH %s', max_id + 1);
            ALTER TABLE public.parroquia ALTER COLUMN id_parroquia SET DEFAULT nextval('public.parroquia_id_parroquia_seq');
            ALTER SEQUENCE public.parroquia_id_parroquia_seq OWNED BY public.parroquia.id_parroquia;
        END IF;
        
        EXECUTE format('SELECT setval(''public.parroquia_id_parroquia_seq'', %s)', GREATEST(max_id, 1));
    END IF;

    -- Secuencia para tabla municipios
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'municipios') THEN
        SELECT COALESCE(MAX(id_municipio), 0) INTO max_id FROM public.municipios;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'municipios_id_municipio_seq') THEN
            EXECUTE format('CREATE SEQUENCE public.municipios_id_municipio_seq START WITH %s', max_id + 1);
            ALTER TABLE public.municipios ALTER COLUMN id_municipio SET DEFAULT nextval('public.municipios_id_municipio_seq');
            ALTER SEQUENCE public.municipios_id_municipio_seq OWNED BY public.municipios.id_municipio;
        END IF;
        
        EXECUTE format('SELECT setval(''public.municipios_id_municipio_seq'', %s)', GREATEST(max_id, 1));
    END IF;

    -- Secuencia para tabla veredas
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'veredas') THEN
        SELECT COALESCE(MAX(id_vereda), 0) INTO max_id FROM public.veredas;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'veredas_id_vereda_seq') THEN
            EXECUTE format('CREATE SEQUENCE public.veredas_id_vereda_seq START WITH %s', max_id + 1);
            ALTER TABLE public.veredas ALTER COLUMN id_vereda SET DEFAULT nextval('public.veredas_id_vereda_seq');
            ALTER SEQUENCE public.veredas_id_vereda_seq OWNED BY public.veredas.id_vereda;
        END IF;
        
        EXECUTE format('SELECT setval(''public.veredas_id_vereda_seq'', %s)', GREATEST(max_id, 1));
    END IF;

    RAISE NOTICE 'Secuencias auto-increment creadas y sincronizadas exitosamente';
END $$;

-- Insertar datos básicos en tabla sexo si no existen
INSERT INTO public.sexo (descripcion, created_at, updated_at) 
VALUES 
    ('Masculino', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Femenino', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id_sexo) DO NOTHING;

-- Insertar datos básicos en tabla sector si no existen
INSERT INTO public.sector (nombre, created_at, updated_at) 
VALUES 
    ('Urbano', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Rural', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id_sector) DO NOTHING;

-- Insertar datos básicos en tabla parroquia si no existen
INSERT INTO public.parroquia (nombre, created_at, updated_at) 
VALUES 
    ('Sagrado Corazón de Jesús', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('San José', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Nuestra Señora del Carmen', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id_parroquia) DO NOTHING;

-- Insertar algunos departamentos básicos de Colombia
INSERT INTO public.departamentos (codigo_dane, nombre, created_at, updated_at) 
VALUES 
    ('05', 'Antioquia', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('08', 'Atlántico', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('11', 'Bogotá', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('13', 'Bolívar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('15', 'Boyacá', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('17', 'Caldas', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('19', 'Cauca', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('20', 'Cesar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('23', 'Córdoba', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('25', 'Cundinamarca', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('27', 'Chocó', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('41', 'Huila', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('44', 'La Guajira', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('47', 'Magdalena', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('50', 'Meta', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('52', 'Nariño', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('54', 'Norte de Santander', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('63', 'Quindío', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('66', 'Risaralda', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('68', 'Santander', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('70', 'Sucre', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('73', 'Tolima', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('76', 'Valle del Cauca', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (codigo_dane) DO NOTHING;

-- Insertar algunos municipios básicos
INSERT INTO public.municipios (nombre_municipio, codigo_dane, created_at, updated_at) 
VALUES 
    ('Medellín', '05001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Bogotá', '11001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Cali', '76001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Barranquilla', '08001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Cartagena', '13001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id_municipio) DO NOTHING;

-- Crear usuario administrador por defecto
DO $$
DECLARE
    admin_exists boolean;
    admin_id uuid;
BEGIN
    -- Verificar si ya existe el usuario admin
    SELECT EXISTS(
        SELECT 1 FROM public.usuarios 
        WHERE correo_electronico = 'admin@parroquia.com'
    ) INTO admin_exists;
    
    IF NOT admin_exists THEN
        -- Generar UUID para el admin
        admin_id := gen_random_uuid();
        
        -- Insertar usuario administrador
        INSERT INTO public.usuarios (
            id, 
            primer_nombre, 
            segundo_nombre, 
            primer_apellido, 
            segundo_apellido, 
            correo_electronico, 
            contrasena, 
            activo,
            created_at,
            updated_at
        ) VALUES (
            admin_id,
            'Admin',
            NULL,
            'Sistema',
            NULL,
            'admin@parroquia.com',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewMyLDyWlPz.kG3u', -- admin123 hasheado
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Usuario administrador creado exitosamente';
        RAISE NOTICE 'Email: admin@parroquia.com';
        RAISE NOTICE 'Password: admin123';
    ELSE
        RAISE NOTICE 'El usuario administrador ya existe';
    END IF;
END $$;

-- Crear índices para optimizar rendimiento
CREATE INDEX IF NOT EXISTS idx_municipios_departamento ON public.municipios(id_departamento);
CREATE INDEX IF NOT EXISTS idx_municipios_codigo_dane ON public.municipios(codigo_dane);
CREATE INDEX IF NOT EXISTS idx_departamentos_codigo_dane ON public.departamentos(codigo_dane);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON public.usuarios(correo_electronico);

-- Actualizar permisos
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO parroquia_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO parroquia_user;

-- Log de finalización
DO $$
BEGIN
    RAISE NOTICE '✅ Script de actualización completado exitosamente';
    RAISE NOTICE '📋 Cambios aplicados:';
    RAISE NOTICE '   • Timestamps añadidos a tablas de catálogo';
    RAISE NOTICE '   • Secuencias auto-increment creadas y sincronizadas';
    RAISE NOTICE '   • Tabla departamentos creada';
    RAISE NOTICE '   • Datos básicos de catálogo insertados';
    RAISE NOTICE '   • Usuario administrador creado: admin@parroquia.com / admin123';
    RAISE NOTICE '   • Índices de rendimiento creados';
    RAISE NOTICE '   • Permisos actualizados';
END $$;

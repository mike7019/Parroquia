-- Script consolidado de todas las migraciones y cambios
-- Ejecutar después de la creación inicial del esquema

-- PASO 1: Aplicar migración 20250730000000-update-tipo-identificacion-table
DO $$
BEGIN
    -- Actualizar tabla tipo_identificacion si existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tipo_identificacion') THEN
        -- Añadir campo tipo_identificacion_pk si no existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'tipo_identificacion' 
            AND column_name = 'tipo_identificacion_pk'
        ) THEN
            ALTER TABLE public.tipo_identificacion 
            ADD COLUMN tipo_identificacion_pk character varying(5);
        END IF;
        
        -- Actualizar datos existentes si no tienen el campo pk
        UPDATE public.tipo_identificacion SET tipo_identificacion_pk = 'CC' WHERE id_tipo_identificacion = 1;
        UPDATE public.tipo_identificacion SET tipo_identificacion_pk = 'TI' WHERE id_tipo_identificacion = 2;
        UPDATE public.tipo_identificacion SET tipo_identificacion_pk = 'CE' WHERE id_tipo_identificacion = 3;
        UPDATE public.tipo_identificacion SET tipo_identificacion_pk = 'PA' WHERE id_tipo_identificacion = 4;
        UPDATE public.tipo_identificacion SET tipo_identificacion_pk = 'RC' WHERE id_tipo_identificacion = 5;
        UPDATE public.tipo_identificacion SET tipo_identificacion_pk = 'NI' WHERE id_tipo_identificacion = 6;
    END IF;
END $$;

-- PASO 2: Aplicar migración 20250730000001-add-timestamps-to-existing-tables
DO $$
BEGIN
    -- Añadir timestamps a todas las tablas existentes que no los tengan
    
    -- tipo_identificacion
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tipo_identificacion') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tipo_identificacion' AND column_name = 'created_at') THEN
            ALTER TABLE public.tipo_identificacion 
            ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
    END IF;

    -- estado_civil
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estado_civil') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estado_civil' AND column_name = 'created_at') THEN
            ALTER TABLE public.estado_civil 
            ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
    END IF;

    -- sexo
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sexo') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sexo' AND column_name = 'created_at') THEN
            ALTER TABLE public.sexo 
            ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
    END IF;

    -- parroquia
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parroquia') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parroquia' AND column_name = 'created_at') THEN
            ALTER TABLE public.parroquia 
            ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
    END IF;

    -- sector
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sector') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sector' AND column_name = 'created_at') THEN
            ALTER TABLE public.sector 
            ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
    END IF;

    -- municipios
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'municipios') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'municipios' AND column_name = 'created_at') THEN
            ALTER TABLE public.municipios 
            ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
    END IF;

    -- veredas
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'veredas') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'veredas' AND column_name = 'created_at') THEN
            ALTER TABLE public.veredas 
            ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
    END IF;

    -- usuarios
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'created_at') THEN
            ALTER TABLE public.usuarios 
            ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
    END IF;
END $$;

-- PASO 3: Aplicar migración 20250731002551-create-departamentos-and-update-municipios
DO $$
BEGIN
    -- Crear tabla departamentos si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'departamentos') THEN
        CREATE TABLE public.departamentos (
            id_departamento bigserial PRIMARY KEY,
            codigo_dane character varying(10) UNIQUE,
            nombre character varying(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        ALTER TABLE public.departamentos OWNER TO parroquia_user;
    END IF;

    -- Añadir relación departamentos-municipios si no existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'municipios') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'municipios' 
            AND column_name = 'id_departamento'
        ) THEN
            ALTER TABLE public.municipios 
            ADD COLUMN id_departamento bigint;
        END IF;
        
        -- Añadir foreign key si no existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_municipios_departamentos'
        ) THEN
            ALTER TABLE public.municipios 
            ADD CONSTRAINT fk_municipios_departamentos 
            FOREIGN KEY (id_departamento) REFERENCES public.departamentos(id_departamento);
        END IF;
    END IF;
END $$;

-- PASO 4: Aplicar migración 20250731055137-add-codigo-dane-to-municipios
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'municipios') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'municipios' 
            AND column_name = 'codigo_dane'
        ) THEN
            ALTER TABLE public.municipios 
            ADD COLUMN codigo_dane character varying(10);
        END IF;
    END IF;
END $$;

-- PASO 5: Aplicar migración 20250731120000-add-autoincrement-sequences
DO $$
DECLARE
    max_id bigint;
BEGIN
    -- Secuencia para tabla sexo
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sexo') THEN
        SELECT COALESCE(MAX(id_sexo), 0) INTO max_id FROM public.sexo;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'sexo_id_sexo_seq') THEN
            EXECUTE format('CREATE SEQUENCE public.sexo_id_sexo_seq START WITH %s', max_id + 1);
            ALTER TABLE public.sexo ALTER COLUMN id_sexo SET DEFAULT nextval('public.sexo_id_sexo_seq');
            ALTER SEQUENCE public.sexo_id_sexo_seq OWNED BY public.sexo.id_sexo;
        END IF;
        
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

    RAISE NOTICE 'Todas las secuencias auto-increment creadas y sincronizadas exitosamente';
END $$;

-- PASO 6: Crear índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_municipios_departamento ON public.municipios(id_departamento);
CREATE INDEX IF NOT EXISTS idx_municipios_codigo_dane ON public.municipios(codigo_dane);
CREATE INDEX IF NOT EXISTS idx_departamentos_codigo_dane ON public.departamentos(codigo_dane);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON public.usuarios(correo_electronico);
CREATE INDEX IF NOT EXISTS idx_sexo_descripcion ON public.sexo(descripcion);
CREATE INDEX IF NOT EXISTS idx_sector_nombre ON public.sector(nombre);
CREATE INDEX IF NOT EXISTS idx_parroquia_nombre ON public.parroquia(nombre);

-- PASO 7: Actualizar permisos para todas las nuevas estructuras
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO parroquia_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO parroquia_user;

-- PASO 8: Insertar usuario administrador
DO $$
DECLARE
    admin_exists boolean;
    admin_id uuid;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.usuarios 
        WHERE correo_electronico = 'admin@parroquia.com'
    ) INTO admin_exists;
    
    IF NOT admin_exists THEN
        admin_id := gen_random_uuid();
        
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
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewMyLDyWlPz.kG3u',
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Usuario administrador creado: admin@parroquia.com / admin123';
    ELSE
        -- Actualizar contraseña si el usuario ya existe
        UPDATE public.usuarios 
        SET contrasena = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewMyLDyWlPz.kG3u',
            activo = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE correo_electronico = 'admin@parroquia.com';
        
        RAISE NOTICE 'Usuario administrador actualizado: admin@parroquia.com / admin123';
    END IF;
END $$;

-- LOG FINAL
DO $$
BEGIN
    RAISE NOTICE '🎉 ¡MIGRACIÓN CONSOLIDADA COMPLETADA EXITOSAMENTE!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 CAMBIOS APLICADOS:';
    RAISE NOTICE '   ✅ Tipo identificación actualizado con PK';
    RAISE NOTICE '   ✅ Timestamps añadidos a todas las tablas';
    RAISE NOTICE '   ✅ Tabla departamentos creada';
    RAISE NOTICE '   ✅ Relación municipios-departamentos establecida';
    RAISE NOTICE '   ✅ Código DANE añadido a municipios';
    RAISE NOTICE '   ✅ Secuencias auto-increment configuradas';
    RAISE NOTICE '   ✅ Índices de rendimiento creados';
    RAISE NOTICE '   ✅ Usuario administrador configurado';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 CREDENCIALES ADMIN:';
    RAISE NOTICE '   Email: admin@parroquia.com';
    RAISE NOTICE '   Password: admin123';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Sistema listo para usar con prevención de duplicados';
END $$;

-- =====================================================
-- SCRIPT PARA CREAR ÚNICAMENTE LA TABLA PARROQUIA
-- SIN AFECTAR OTRAS TABLAS NI DATOS EXISTENTES
-- =====================================================

-- Verificar si la tabla ya existe antes de crearla
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'parroquia') THEN
        
        -- Crear la tabla parroquia
        CREATE TABLE parroquia (
            id_parroquia BIGSERIAL PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            id_municipio BIGINT NOT NULL
        );
        
        -- Agregar la clave foránea hacia municipios (solo si la tabla municipios existe)
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'municipios') THEN
            ALTER TABLE parroquia 
            ADD CONSTRAINT fk_parroquia_municipio 
            FOREIGN KEY (id_municipio) REFERENCES municipios(id_municipio) 
            ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
        
        -- Crear índices para optimizar consultas
        CREATE INDEX idx_parroquia_municipio ON parroquia(id_municipio);
        CREATE INDEX idx_parroquia_nombre ON parroquia(nombre);
        
        RAISE NOTICE 'Tabla parroquia creada exitosamente con índices y restricciones';
        
    ELSE
        RAISE NOTICE 'La tabla parroquia ya existe, no se realizaron cambios';
    END IF;
END $$;

-- =====================================================
-- INSERTAR DATOS DE EJEMPLO (OPCIONAL - COMENTADO)
-- =====================================================

/*
-- Solo ejecutar si quieres datos de ejemplo y tienes municipios existentes
-- Verifica primero que existan municipios en tu base de datos con:
-- SELECT id_municipio, nombre_municipio FROM municipios LIMIT 5;

-- Luego descomenta y ajusta estos INSERTs según tus municipios reales:

INSERT INTO parroquia (nombre, id_municipio) VALUES 
    ('Parroquia San José', 1),
    ('Parroquia La Inmaculada', 1),
    ('Parroquia del Sagrado Corazón', 2),
    ('Parroquia Santa María', 2),
    ('Parroquia San Pedro', 3)
ON CONFLICT DO NOTHING; -- Evita duplicados si ya existen
*/

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que la tabla se creó correctamente
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'parroquia';

-- Verificar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'parroquia' 
ORDER BY ordinal_position;

-- Verificar índices creados
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'parroquia';

-- Verificar restricciones (claves foráneas)
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'parroquia';

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================

/*
ESTE SCRIPT:
✅ Solo crea la tabla parroquia si NO existe
✅ No modifica datos existentes en otras tablas
✅ No afecta usuarios, roles, ni permisos
✅ Crea índices para optimizar performance
✅ Agrega clave foránea solo si existe la tabla municipios
✅ Incluye verificaciones de seguridad

ESTRUCTURA CREADA:
- id_parroquia: BIGSERIAL (clave primaria autoincremental)
- nombre: VARCHAR(255) NOT NULL
- id_municipio: BIGINT NOT NULL (clave foránea)

ÍNDICES CREADOS:
- idx_parroquia_municipio: Para búsquedas por municipio
- idx_parroquia_nombre: Para búsquedas por nombre

COMPATIBILIDAD:
- PostgreSQL 10+
- Compatible con tu modelo Sequelize existente
- No requiere cambios en tu código Node.js
*/